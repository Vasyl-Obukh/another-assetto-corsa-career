// Filtering, sorting, paging and counting over scanned content. Pure: arrays in,
// arrays out. It runs in the main process, but nothing about it needs to, which
// is what keeps it testable without an Electron app around it.

import {
  anyOfLists, countValues, fromAnyOf, groupLength, groupPitboxes, groupTracks, inBounds, isOneOf, matchesTerms,
  paginate, searchTerms, sortBy, spreadOf,
} from './utils.ts';
import type { SortValue } from './utils.ts';
import type {
  Car,
  CarFacets,
  CarPricing,
  CarQuery,
  CarSortKey,
  ClassCatalogue,
  Page,
  Track,
  TrackFacets,
  TrackGroup,
  TrackQuery,
  TrackSortKey,
} from '../../shared/types/index.ts';
import { carClassesOf, carSpecsOf, SHIPPED_CATALOGUE } from '../../shared/utils/car-classes/index.ts';
import { carPrice, priceOrigin } from '../../shared/utils/car-prices/index.ts';
import { salePrice } from '../../shared/utils/car-sale/index.ts';
import { nationOfCountry } from '../../shared/utils/nations/index.ts';
import { percentOf } from '../../shared/utils/sponsors/index.ts';

/**
 * A named test an entry has to pass, so a facet can leave its own one out.
 */
type Filters<T> = Record<string, (item: T) => boolean>;

/**
 * Nothing priced by the user and nothing added.
 */
const NO_PRICING: CarPricing = { prices: {}, added: [] };

/**
 * Where a car's price comes from, for the filter on it.
 * @param car The car
 * @param pricing The user's prices and the cars they added
 * @returns The price list's or the user's, a suggestion for a car they added,
 * or null for one they have not added
 */
const pricedAs = (car: Car, pricing: CarPricing): string | null => {
  const origin = priceOrigin(car.id, pricing.prices);

  return origin === 'suggested' && !pricing.added.includes(car.id) ? null : origin;
};

/**
 * What each car costs, worked out once per car for one query: a sort reads it
 * on every comparison and the facets once per filter, and a mod's derivation
 * walks the class catalogue.
 * @param catalogue The class catalogue a mod's price is derived over
 * @param pricing The user's prices and the cars they added
 * @param sale What a career's sale takes off each car this week, by folder ID
 * @returns A car's price, after the sale
 */
const pricesFor = (
  catalogue: ClassCatalogue,
  pricing: CarPricing,
  sale: Readonly<Record<string, number>> = {},
): ((car: Car) => number) => {
  const known = new Map<string, number>();

  return (car) => {
    const cached = known.get(car.id);
    if (cached !== undefined) return cached;
    const listed = carPrice(car, catalogue, pricing.prices);
    const off = sale[car.id];
    const price = off === undefined ? listed : salePrice(listed, off);
    known.set(car.id, price);

    return price;
  };
};

/**
 * What each car sort key reads off a car.
 * @param priceOf What a car costs
 * @param sale What a career's sale takes off each car this week, by folder ID
 * @returns The readers, by key
 */
const carSorts = (
  priceOf: (car: Car) => number,
  sale: Readonly<Record<string, number>> = {},
): Record<CarSortKey, (car: Car) => SortValue> => ({
  name: (car) => car.name,
  brand: (car) => car.brand,
  year: (car) => car.year,
  bhp: (car) => car.performance.bhp,
  weight: (car) => car.performance.weightKg,
  powerToWeight: (car) => car.performance.powerToWeight,
  price: priceOf,
  // The largest discount first, as the cheapest price is, and a car not on sale
  // after every one that is.
  discount: (car) => {
    const off = sale[car.id];

    return off === undefined ? null : -off;
  },
});

/**
 * What each track sort key reads off a track.
 *
 * Length and pit boxes take the largest of the track's layouts: sorting by grid
 * size is asking what will fit here, and one layout being able to hold it is
 * the answer.
 */
const TRACK_SORTS: Record<TrackSortKey, (group: TrackGroup) => SortValue> = {
  name: (group) => group.name,
  country: (group) => group.country,
  length: groupLength,
  pitboxes: groupPitboxes,
};

/**
 * Builds the tests a car has to pass, one per filter the query can set.
 * @param query What the caller asked for
 * @param catalogue The class catalogue classes and specs resolve against
 * @param pricing The user's prices and the cars they added
 * @param priceOf What a car costs
 * @returns The tests, keyed by the filter they come from
 */
const carFilters = (
  query: CarQuery,
  catalogue: ClassCatalogue,
  pricing: CarPricing,
  priceOf: (car: Car) => number,
): Filters<Car> => {
  const terms = searchTerms(query.search);
  const { payable } = query;
  const backed = new Set(payable?.models);
  const canPay = (car: Car): boolean => {
    if (!payable) return true;
    const price = priceOf(car);

    return price - (backed.has(car.id) ? percentOf(price, payable.share) : 0) <= payable.money;
  };

  return {
    search: (car) => matchesTerms(terms, [car.name, car.brand, car.id]),
    ids: (car) => isOneOf(car.id, query.ids),
    brands: (car) => isOneOf(car.brand, query.brands),
    countries: (car) => isOneOf(nationOfCountry(car.country), query.countries),
    // Class and spec are one tree in the browser, so like provenance they are one
    // filter - and a car races on as many grids as the catalogue gives it.
    classification: (car) => anyOfLists([
      [carClassesOf(car.id, catalogue), query.classes],
      [carSpecsOf(car.id, catalogue), query.specs],
    ]),
    provenance: (car) => fromAnyOf(car.provenance, query),
    year: (car) => inBounds(car.year, query.yearFrom, query.yearTo),
    bhp: (car) => inBounds(car.performance.bhp, query.bhpFrom, query.bhpTo),
    price: (car) => inBounds(priceOf(car), query.priceFrom, query.priceTo) && canPay(car),
    priceOrigin: (car) => isOneOf(pricedAs(car, pricing), query.priceOrigins),
    onSale: (car) => query.onSale !== true || query.sale?.[car.id] !== undefined,
    except: (car) => !(query.except ?? []).includes(car.id),
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
    ids: (track) => isOneOf(track.id, query.ids),
    countries: (track) => isOneOf(nationOfCountry(track.country), query.countries),
    provenance: (track) => fromAnyOf(track.provenance, query),
    length: (track) => inBounds(track.lengthM, query.lengthFrom, query.lengthTo),
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
 * @param pricing The user's prices and the cars they added
 * @returns One page, with the full match count beside it
 */
export const queryCars = (
  cars: readonly Car[],
  query: CarQuery = {},
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
  pricing: CarPricing = NO_PRICING,
): Page<Car> => {
  const priceOf = pricesFor(catalogue, pricing, query.sale);
  const matched = applyFilters(cars, carFilters(query, catalogue, pricing, priceOf));
  const sorted = sortBy(matched, carSorts(priceOf, query.sale)[query.sort ?? 'name'], (car) => car.name, query.direction);

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
 * One circuit, with every layout installed under it.
 * @param tracks Every installed track layout
 * @param id The circuit's folder name
 * @returns The circuit, or null when nothing is installed under that ID
 */
export const circuitOf = (tracks: readonly Track[], id: string): TrackGroup | null => (
  groupTracks(tracks.filter((track) => track.id === id), tracks)[0] ?? null
);

/**
 * Counts the values behind a car browser's filter lists.
 *
 * Each dimension is counted against the search and every other filter but not
 * its own, so ticking one brand leaves the rest of the brand list visible and
 * pickable instead of collapsing it to the single choice already made.
 *
 * Class and spec are counted against neither of the two, since they are one
 * filter and the browser shows them as one tree.
 * @param cars Every installed car
 * @param query The filters currently applied
 * @param catalogue The class catalogue classes and specs resolve against
 * @param pricing The user's prices and the cars they added
 * @returns Counts per brand, country, class, spec, provenance and where a price
 *   comes from, and how year, power and price are spread
 */
export const carFacets = (
  cars: readonly Car[],
  query: CarQuery = {},
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
  pricing: CarPricing = NO_PRICING,
): CarFacets => {
  const priceOf = pricesFor(catalogue, pricing, query.sale);
  // A car left out to stand above the list is still one the rail counts, or
  // ticking a filter that brings it back would find one more than it said.
  const filters = carFilters({ ...query, except: undefined }, catalogue, pricing, priceOf);
  const without = (except: string): Car[] => applyFilters(cars, filters, except);

  return {
    brands: countValues(without('brands'), (car) => [car.brand]),
    countries: countValues(without('countries'), (car) => [nationOfCountry(car.country)]),
    classes: countValues(without('classification'), (car) => carClassesOf(car.id, catalogue)),
    specs: countValues(without('classification'), (car) => carSpecsOf(car.id, catalogue)),
    sources: countValues(without('provenance'), (car) => [car.provenance.source]),
    packs: countValues(without('provenance'), (car) => [car.provenance.pack]),
    makers: countValues(without('provenance'), (car) => [car.provenance.maker]),
    distributors: countValues(without('provenance'), (car) => [car.provenance.distributor]),
    years: spreadOf(cars, without('year'), (car) => car.year),
    power: spreadOf(cars, without('bhp'), (car) => car.performance.bhp),
    priceOrigins: countValues(without('priceOrigin'), (car) => [pricedAs(car, pricing)]),
    // Over the price's logarithm, since prices run from thousands to tens of
    // millions and a linear scale would crowd every road car into one bar.
    prices: spreadOf(cars, without('price'), (car) => Math.log10(priceOf(car))),
  };
};

/**
 * Counts the values behind a track browser's filter lists.
 *
 * Counted over tracks rather than layouts, so the numbers match the cards: a
 * Nordschleife with eight layouts is one German track, not eight.
 * @param tracks Every installed track layout
 * @param query The filters currently applied
 * @returns Counts per country and provenance, and how length and pit boxes
 *   are spread over layouts
 */
export const trackFacets = (
  tracks: readonly Track[],
  query: TrackQuery = {},
): TrackFacets => {
  const filters = trackFilters(query);
  const without = (except: string): TrackGroup[] => (
    groupTracks(applyFilters(tracks, filters, except), tracks)
  );

  // The spreads are drawn over layouts, the one level a length belongs to.
  return {
    countries: countValues(without('countries'), (group) => [nationOfCountry(group.country)]),
    sources: countValues(without('provenance'), (group) => [group.provenance.source]),
    packs: countValues(without('provenance'), (group) => [group.provenance.pack]),
    makers: countValues(without('provenance'), (group) => [group.provenance.maker]),
    distributors: countValues(without('provenance'), (group) => [group.provenance.distributor]),
    length: spreadOf(tracks, applyFilters(tracks, filters, 'length'), (track) => track.lengthM),
    pitboxes: spreadOf(tracks, applyFilters(tracks, filters, 'pitboxes'), (track) => track.pitboxes),
  };
};
