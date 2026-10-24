import type { ChampionshipCriteria, ChampionshipDimension } from './types.ts';
import type { Facet, SeriesListing } from '../../../../shared/types';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';

/**
 * Whether a championship matches the search text.
 *
 * The class names are searched beside the championship's own, so typing a
 * class finds every championship that races one. Not the description: it is
 * prose, full of years and other series, and "formula 1" would find every
 * junior formula whose description mentions a 2010 season.
 * @param listing The championship
 * @param terms The folded search terms
 * @returns True when every term is found
 */
const matchesSearch = (listing: SeriesListing, terms: readonly string[]): boolean => (
  matchesTerms(terms, [
    listing.series.name,
    ...listing.series.entries.map((entry) => entry.name),
  ])
);

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
 * @returns The championships that pass, still in ladder order
 */
export const filterChampionships = (
  listings: readonly SeriesListing[],
  dimensions: readonly ChampionshipDimension[],
  criteria: ChampionshipCriteria,
  search: string,
): SeriesListing[] => {
  const terms = searchTerms(search);

  return listings.filter((listing) => (
    matchesSearch(listing, terms) && passes(listing, dimensions, criteria.picked)
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
 * @returns The counts, keyed as the dimensions are
 */
export const championshipFacets = (
  listings: readonly SeriesListing[],
  dimensions: readonly ChampionshipDimension[],
  criteria: ChampionshipCriteria,
  search: string,
): Record<string, Facet[]> => {
  const terms = searchTerms(search);
  const searched = listings.filter((listing) => matchesSearch(listing, terms));

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
