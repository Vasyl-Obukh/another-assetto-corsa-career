// Filtering, sorting, paging and counting over scanned content. Pure: arrays in,
// arrays out. It runs in the main process, but nothing about it needs to, which
// is what keeps it testable without an Electron app around it.

import { COLLATOR } from './constants.ts';
import {
  countValues, groupPitboxes, groupTracks, hasAnyOf, inBounds, isOneOf, matchesTerms,
  paginate, searchTerms, sortBy,
} from './utils.ts';
import type { SortValue } from './utils.ts';
import type {
  Car,
  CarFacets,
  CarQuery,
  CarSortKey,
  ClassCatalogue,
  ClassId,
  Page,
  SpecId,
  Track,
  TrackFacets,
  TrackGroup,
  TrackQuery,
  TrackSortKey,
} from '../../shared/types/index.ts';
import {
  carClassesOf, carSpecsOf, classOfSpec, SHIPPED_CATALOGUE,
} from '../../shared/utils/car-classes/index.ts';

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
  bhp: (car) => car.performance.bhp,
  weight: (car) => car.performance.weightKg,
  powerToWeight: (car) => car.performance.powerToWeight,
};

/**
 * What each track sort key reads off a track.
 *
 * Pit boxes take the largest of the track's layouts: sorting by grid size is
 * asking what will fit here, and one layout being able to hold it is the answer.
 */
const TRACK_SORTS: Record<TrackSortKey, (group: TrackGroup) => SortValue> = {
  name: (group) => group.name,
  country: (group) => group.country,
  pitboxes: groupPitboxes,
};

/**
 * Builds the tests a car has to pass, one per filter the query can set.
 * @param query What the caller asked for
 * @param catalogue The class catalogue classes and specs resolve against
 * @returns The tests, keyed by the filter they come from
 */
const carFilters = (query: CarQuery, catalogue: ClassCatalogue): Filters<Car> => {
  const terms = searchTerms(query.search);

  return {
    search: (car) => matchesTerms(terms, [car.name, car.brand, car.id]),
    ids: (car) => isOneOf(car.id, query.ids),
    brands: (car) => isOneOf(car.brand, query.brands),
    countries: (car) => isOneOf(car.country, query.countries),
    // A car races on as many grids as the catalogue gives it, so these two ask
    // whether any of its values was picked rather than whether its one value was.
    classes: (car) => hasAnyOf(carClassesOf(car.id, catalogue), query.classes),
    specs: (car) => hasAnyOf(carSpecsOf(car.id, catalogue), query.specs),
    sources: (car) => isOneOf(car.provenance.source, query.sources),
    packs: (car) => isOneOf(car.provenance.pack, query.packs),
    makers: (car) => isOneOf(car.provenance.maker, query.makers),
    distributors: (car) => isOneOf(car.provenance.distributor, query.distributors),
    year: (car) => inBounds(car.year, query.yearFrom, query.yearTo),
    bhp: (car) => inBounds(car.performance.bhp, query.bhpFrom, query.bhpTo),
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
    sources: (track) => isOneOf(track.provenance.source, query.sources),
    packs: (track) => isOneOf(track.provenance.pack, query.packs),
    makers: (track) => isOneOf(track.provenance.maker, query.makers),
    distributors: (track) => isOneOf(track.provenance.distributor, query.distributors),
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
 * @param catalogue The class catalogue classes and specs resolve against
 * @returns One page, with the full match count beside it
 */
export const queryCars = (
  cars: readonly Car[],
  query: CarQuery = {},
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
): Page<Car> => {
  const matched = applyFilters(cars, carFilters(query, catalogue));
  const sorted = sortBy(matched, CAR_SORTS[query.sort ?? 'name'], (car) => car.name, query.direction);

  return paginate(sorted, query.offset, query.limit);
};

/**
 * Filters, groups, sorts and pages installed tracks.
 *
 * The filters run per layout and the grouping follows, so a track is a match
 * when any of its layouts is - and the group that comes back holds only the
 * layouts that matched. Paging after the grouping is what makes the total a
 * count of tracks rather than of layouts.
 * @param tracks Every installed track layout
 * @param query What to search, filter, sort and page by
 * @returns One page of tracks, with the full match count beside it
 */
export const queryTracks = (
  tracks: readonly Track[],
  query: TrackQuery = {},
): Page<TrackGroup> => {
  const matched = applyFilters(tracks, trackFilters(query));
  const groups = groupTracks(matched, tracks);
  const key = TRACK_SORTS[query.sort ?? 'name'];
  const sorted = sortBy(groups, key, (group) => group.name, query.direction);

  return paginate(sorted, query.offset, query.limit);
};

/**
 * Counts the values behind a car browser's filter lists.
 *
 * Each dimension is counted against the search and every other filter but not
 * its own, so ticking one brand leaves the rest of the brand list visible and
 * pickable instead of collapsing it to the single choice already made.
 *
 * Class and spec are the exception, because they are a hierarchy rather than two
 * independent dimensions - see below.
 * @param cars Every installed car
 * @param query The filters currently applied
 * @param catalogue The class catalogue classes and specs resolve against
 * @returns Counts per brand, country, class, spec, provenance and year
 */
export const carFacets = (
  cars: readonly Car[],
  query: CarQuery = {},
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
): CarFacets => {
  const filters = carFilters(query, catalogue);
  const without = (except: string): Car[] => applyFilters(cars, filters, except);

  // Every other facet counts whatever the surviving entries carry, but a car
  // races on several grids at once: the cars in GT4 also run their own one-make
  // cups. Counting those would list Alpine A110 Cup under a GT4 selection and
  // GT4 under an Alpine A110 Cup one, both reading as though the two belonged
  // together. So the pair narrows each other - pick a class and the spec list is
  // that class's grids, pick a spec and the class list is the class it sits in.
  const pickedClasses = query.classes ?? [];
  const pickedSpecClasses = new Set((query.specs ?? []).map((spec) => classOfSpec(spec, catalogue)));

  const inPickedClass = (spec: SpecId): boolean => {
    const carClass = classOfSpec(spec, catalogue);

    return pickedClasses.length === 0 || (carClass !== null && pickedClasses.includes(carClass));
  };
  const inPickedSpecClass = (carClass: ClassId): boolean => (
    pickedSpecClasses.size === 0 || pickedSpecClasses.has(carClass)
  );

  return {
    brands: countValues(without('brands'), (car) => [car.brand]),
    countries: countValues(without('countries'), (car) => [car.country]),
    classes: countValues(without('classes'), (car) => carClassesOf(car.id, catalogue).filter(inPickedSpecClass)),
    specs: countValues(without('specs'), (car) => carSpecsOf(car.id, catalogue).filter(inPickedClass)),
    sources: countValues(without('sources'), (car) => [car.provenance.source]),
    packs: countValues(without('packs'), (car) => [car.provenance.pack]),
    makers: countValues(without('makers'), (car) => [car.provenance.maker]),
    distributors: countValues(without('distributors'), (car) => [car.provenance.distributor]),

    // Years read best newest first rather than commonest first, since a year
    // list is something you scan for a decade rather than for a popular value.
    years: countValues(without('year'), (car) => [car.year === null ? null : String(car.year)])
      .sort((a, b) => COLLATOR.compare(b.value, a.value)),
  };
};

/**
 * Counts the values behind a track browser's filter lists.
 *
 * Counted over tracks rather than layouts, so the numbers match the cards: a
 * Nordschleife with eight layouts is one German track, not eight.
 * @param tracks Every installed track layout
 * @param query The filters currently applied
 * @returns Counts per country and provenance
 */
export const trackFacets = (
  tracks: readonly Track[],
  query: TrackQuery = {},
): TrackFacets => {
  const filters = trackFilters(query);
  const without = (except: string): TrackGroup[] => (
    groupTracks(applyFilters(tracks, filters, except), tracks)
  );

  return {
    countries: countValues(without('countries'), (group) => [group.country]),
    sources: countValues(without('sources'), (group) => [group.provenance.source]),
    packs: countValues(without('packs'), (group) => [group.provenance.pack]),
    makers: countValues(without('makers'), (group) => [group.provenance.maker]),
    distributors: countValues(without('distributors'), (group) => [group.provenance.distributor]),
  };
};
