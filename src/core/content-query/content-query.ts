// Filtering, sorting, paging and counting over scanned content. Pure: arrays in,
// arrays out. It runs in the main process, but nothing about it needs to, which
// is what keeps it testable without an Electron app around it.

import { COLLATOR } from './constants.ts';
import {
  countValues, inBounds, isOneOf, matchesTerms, paginate, searchTerms, sortBy,
} from './utils.ts';
import type { SortValue } from './utils.ts';
import type {
  Car,
  CarFacets,
  CarQuery,
  CarSortKey,
  Page,
  Track,
  TrackFacets,
  TrackQuery,
  TrackSortKey,
} from '../../shared/types/index.ts';

/**
 * A named test an entry has to pass, so a facet can leave its own one out.
 */
type Filters<T> = Record<string, (item: T) => boolean>;

/**
 * What each car sort key reads off a car.
 */
const CAR_SORTS: Record<CarSortKey, (car: Car) => SortValue> = {
  name: (car) => car.name,
  brand: (car) => car.brand,
  year: (car) => car.year,
  bhp: (car) => car.specs.bhp,
  weight: (car) => car.specs.weightKg,
  powerToWeight: (car) => car.specs.powerToWeight,
};

/**
 * What each track sort key reads off a track layout.
 */
const TRACK_SORTS: Record<TrackSortKey, (track: Track) => SortValue> = {
  name: (track) => track.name,
  country: (track) => track.country,
  pitboxes: (track) => track.pitboxes,
};

/**
 * Builds the tests a car has to pass, one per filter the query can set.
 * @param query What the caller asked for
 * @returns The tests, keyed by the filter they come from
 */
const carFilters = (query: CarQuery): Filters<Car> => {
  const terms = searchTerms(query.search);

  return {
    search: (car) => matchesTerms(terms, [car.name, car.brand, car.id, ...car.tags]),
    brands: (car) => isOneOf(car.brand, query.brands),
    countries: (car) => isOneOf(car.country, query.countries),
    classes: (car) => isOneOf(car.carClass, query.classes),
    // Tags are the one filter that ands within itself: picking "gt3" and "dlc"
    // means both, since a tag list describes one car rather than partitioning
    // the library the way a brand does.
    tags: (car) => (query.tags ?? []).every((tag) => car.tags.includes(tag)),
    year: (car) => inBounds(car.year, query.yearFrom, query.yearTo),
    bhp: (car) => inBounds(car.specs.bhp, query.bhpFrom, query.bhpTo),
    hasSkins: (car) => query.hasSkins !== true || car.skins.length > 0,
  };
};

/**
 * Builds the tests a track layout has to pass.
 * @param query What the caller asked for
 * @returns The tests, keyed by the filter they come from
 */
const trackFilters = (query: TrackQuery): Filters<Track> => {
  const terms = searchTerms(query.search);

  return {
    search: (track) => matchesTerms(terms, [track.name, track.id, track.country]),
    countries: (track) => isOneOf(track.country, query.countries),
    pitboxes: (track) => inBounds(track.pitboxes, query.pitboxesFrom, query.pitboxesTo),
    hasGeotags: (track) => query.hasGeotags !== true
      || (track.geotags.lat !== null && track.geotags.lon !== null),
  };
};

/**
 * Applies every test but one.
 * @param items What to filter
 * @param filters The tests to apply
 * @param except The filter to leave out, so a facet does not count itself away
 * @returns The entries that passed
 */
const applyFilters = <T>(
  items: readonly T[],
  filters: Filters<T>,
  except?: string,
): T[] => {
  const active = Object.entries(filters).filter(([key]) => key !== except);

  return items.filter((item) => active.every(([, test]) => test(item)));
};

/**
 * Filters, sorts and pages a car list.
 * @param cars Every installed car
 * @param query What to search, filter, sort and page by
 * @returns One page, with the full match count beside it
 */
export const queryCars = (cars: readonly Car[], query: CarQuery = {}): Page<Car> => {
  const matched = applyFilters(cars, carFilters(query));
  const sorted = sortBy(matched, CAR_SORTS[query.sort ?? 'name'], (car) => car.name, query.direction);

  return paginate(sorted, query.offset, query.limit);
};

/**
 * Filters, sorts and pages a track layout list.
 * @param tracks Every installed track layout
 * @param query What to search, filter, sort and page by
 * @returns One page, with the full match count beside it
 */
export const queryTracks = (
  tracks: readonly Track[],
  query: TrackQuery = {},
): Page<Track> => {
  const matched = applyFilters(tracks, trackFilters(query));
  const key = TRACK_SORTS[query.sort ?? 'name'];
  const sorted = sortBy(matched, key, (track) => track.name, query.direction);

  return paginate(sorted, query.offset, query.limit);
};

/**
 * Counts the values behind a car browser's filter lists.
 *
 * Each dimension is counted against the search and every other filter but not
 * its own, so ticking one brand leaves the rest of the brand list visible and
 * pickable instead of collapsing it to the single choice already made.
 * @param cars Every installed car
 * @param query The filters currently applied
 * @returns Counts per brand, tag, country, class and year
 */
export const carFacets = (cars: readonly Car[], query: CarQuery = {}): CarFacets => {
  const filters = carFilters(query);
  const without = (except: string): Car[] => applyFilters(cars, filters, except);

  return {
    brands: countValues(without('brands'), (car) => [car.brand]),
    tags: countValues(without('tags'), (car) => car.tags),
    countries: countValues(without('countries'), (car) => [car.country]),
    classes: countValues(without('classes'), (car) => [car.carClass]),
    // Years read best newest first rather than commonest first, since a year
    // list is something you scan for a decade rather than for a popular value.
    years: countValues(without('year'), (car) => [car.year === null ? null : String(car.year)])
      .sort((a, b) => COLLATOR.compare(b.value, a.value)),
  };
};

/**
 * Counts the values behind a track browser's filter lists.
 * @param tracks Every installed track layout
 * @param query The filters currently applied
 * @returns Counts per country
 */
export const trackFacets = (
  tracks: readonly Track[],
  query: TrackQuery = {},
): TrackFacets => ({
  countries: countValues(
    applyFilters(tracks, trackFilters(query), 'countries'),
    (track) => [track.country],
  ),
});
