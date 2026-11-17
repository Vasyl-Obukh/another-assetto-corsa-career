import { CHAMPIONSHIP_SORT_KEYS, EMPTY_CRITERIA } from './constants.ts';
import type { ChampionshipCriteria, ChampionshipDimension, SearchMore } from './types.ts';
import type { Facet, SeriesListing } from '../../../../shared/types';
import { isRecord, memberOf } from '../../../../shared/utils/coerce';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { SORT_DIRECTIONS } from '@/lib/stored-preference';

/**
 * Reads the filters and sort a championship list saved, dropping anything
 * that is not of the right shape. Picks the list no longer offers are left for
 * `withKnownValues` to set aside, since the list may still be loading.
 * @param stored Whatever the preference held
 * @returns The criteria to open on
 */
export const readChampionshipCriteria = (stored: unknown): ChampionshipCriteria => {
  if (!isRecord(stored)) return EMPTY_CRITERIA;

  const picked = isRecord(stored.picked)
    ? Object.fromEntries(Object.entries(stored.picked).filter(([, values]) => (
      Array.isArray(values) && values.every((one) => typeof one === 'string')
    ))) as ChampionshipCriteria['picked']
    : {};

  return {
    picked,
    sort: memberOf(stored.sort, CHAMPIONSHIP_SORT_KEYS) ?? EMPTY_CRITERIA.sort,
    direction: memberOf(stored.direction, SORT_DIRECTIONS) ?? EMPTY_CRITERIA.direction,
  };
};

/**
 * Whether a championship matches the search text.
 *
 * The class names are searched beside the championship's own, so typing a
 * class finds every championship that races one. Not the description: it is
 * prose, full of years and other series, and "formula 1" would find every
 * junior formula whose description mentions a 2010 season.
 * @param listing The championship
 * @param terms The folded search terms
 * @param more Anything else of it a search should find
 * @returns True when every term is found
 */
const matchesSearch = (listing: SeriesListing, terms: readonly string[], more: SearchMore): boolean => (
  matchesTerms(terms, [
    listing.series.name,
    ...listing.series.entries.map((entry) => entry.name),
    ...more(listing),
  ])
);

/**
 * Nothing searched beyond a championship's own names.
 * @returns No text
 */
const nothingMore: SearchMore = () => [];

/**
 * Whether a championship passes every dimension's pick but one.
 * @param listing The championship
 * @param dimensions Every dimension the list narrows by
 * @param picked The values picked, per dimension
 * @param except The dimension to leave out, so a facet does not count itself away
 * @returns True when it passes
 */
const passes = (
  listing: SeriesListing,
  dimensions: readonly ChampionshipDimension[],
  picked: ChampionshipCriteria['picked'],
  except?: string,
): boolean => dimensions.every((dimension) => {
  const wanted = picked[dimension.key] ?? [];
  if (dimension.key === except || wanted.length === 0) return true;

  return dimension.values(listing).some((value) => wanted.includes(value));
});

/**
 * Drops a picked value no championship carries any more.
 *
 * The list can change under a remembered pick - the only championship of the
 * user's deleted, say - and a value nothing carries is listed nowhere to
 * untick, so the list would read empty for no visible reason.
 * @param criteria The criteria as remembered
 * @param listings The whole list
 * @param dimensions Every dimension the list narrows by
 * @returns The criteria with only values something still carries
 */
export const withKnownValues = (
  criteria: ChampionshipCriteria,
  listings: readonly SeriesListing[],
  dimensions: readonly ChampionshipDimension[],
): ChampionshipCriteria => {
  const picked = Object.fromEntries(dimensions.map((dimension) => {
    const carried = new Set([...listings.flatMap((listing) => dimension.values(listing)), ...dimension.known ?? []]);

    return [dimension.key, (criteria.picked[dimension.key] ?? []).filter((value) => carried.has(value))];
  }));

  return { ...criteria, picked };
};

/**
 * Narrows a list to what the search and the picks let through.
 * @param listings The whole list, in ladder order
 * @param dimensions Every dimension the list narrows by
 * @param criteria The picks
 * @param search The search text
 * @param more Anything else of a championship the search should find
 * @returns The championships that pass, still in ladder order
 */
export const filterChampionships = (
  listings: readonly SeriesListing[],
  dimensions: readonly ChampionshipDimension[],
  criteria: ChampionshipCriteria,
  search: string,
  more: SearchMore = nothingMore,
): SeriesListing[] => {
  const terms = searchTerms(search);

  return listings.filter((listing) => (
    matchesSearch(listing, terms, more) && passes(listing, dimensions, criteria.picked)
  ));
};

/**
 * Counts every dimension's values over what the search and the other
 * dimensions' picks let through, which is what a car browser's facets count
 * too: a pick narrows the other lists but never empties its own.
 * @param listings The whole list
 * @param dimensions Every dimension the list narrows by
 * @param criteria The picks
 * @param search The search text
 * @param more Anything else of a championship the search should find
 * @returns The counts, keyed as the dimensions are
 */
export const championshipFacets = (
  listings: readonly SeriesListing[],
  dimensions: readonly ChampionshipDimension[],
  criteria: ChampionshipCriteria,
  search: string,
  more: SearchMore = nothingMore,
): Record<string, Facet[]> => {
  const terms = searchTerms(search);
  const searched = listings.filter((listing) => matchesSearch(listing, terms, more));

  return Object.fromEntries(dimensions.map((dimension) => {
    const counts = new Map<string, number>();

    searched
      .filter((listing) => passes(listing, dimensions, criteria.picked, dimension.key))
      // Once per championship, however many of its classes carry the value.
      .forEach((listing) => new Set(dimension.values(listing)).forEach((value) => {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }));

    return [dimension.key, [...counts].map(([value, count]) => ({ value, count }))];
  }));
};

/**
 * Puts a narrowed list in the order asked for.
 * @param listings The list, in ladder order
 * @param criteria The sort and its direction
 * @param compare The locale's own string comparison
 * @returns A sorted copy
 */
export const sortChampionships = (
  listings: readonly SeriesListing[],
  criteria: ChampionshipCriteria,
  compare: (a: string, b: string) => number,
): SeriesListing[] => {
  const sorted = criteria.sort === 'name'
    ? [...listings].sort((a, b) => compare(a.series.name, b.series.name))
    : [...listings];

  return criteria.direction === 'desc' ? sorted.reverse() : sorted;
};

/**
 * Whether anything has been narrowed, so Clear is worth offering.
 * @param criteria The picks
 * @param search The search text
 * @returns True when either would change the list
 */
export const isChampionshipFiltered = (criteria: ChampionshipCriteria, search: string): boolean => (
  search.trim() !== '' || Object.values(criteria.picked).some((values) => values.length > 0)
);

/**
 * The criteria to save after a change made to them as shown.
 *
 * What is shown is the saved criteria checked against the list, so a dimension
 * the change left alone is taken as saved rather than as shown - a list still
 * loading, or a page without that dimension, would otherwise wipe its picks.
 * @param saved The criteria as saved
 * @param shown The criteria as shown, which the change was made to
 * @param next The criteria after the change
 * @returns The criteria to save
 */
export const withUnshownPicks = (
  saved: ChampionshipCriteria,
  shown: ChampionshipCriteria,
  next: ChampionshipCriteria,
): ChampionshipCriteria => {
  const keys = new Set([...Object.keys(saved.picked), ...Object.keys(next.picked)]);
  const picked = Object.fromEntries([...keys].flatMap((key) => {
    const value = next.picked[key] === shown.picked[key] ? saved.picked[key] : next.picked[key];

    return value === undefined ? [] : [[key, value]];
  }));

  return { ...next, picked };
};
