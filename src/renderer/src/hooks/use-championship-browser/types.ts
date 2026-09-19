import type { Facet, SeriesListing, SortDirection } from '../../../../shared/types';

/**
 * What a championship list can be sorted by. The ladder is the library's own
 * order, derived from the tiers.
 */
export type ChampionshipSortKey = 'ladder' | 'name';

/**
 * One thing a championship list can be narrowed by, such as its discipline.
 *
 * Handed in by the screen rather than fixed here, because the settings tab
 * narrows on more than the Championships page does - whether a championship
 * is switched on, whether it can be raced - and those answers come from
 * settings the hook has no business reading.
 */
export interface ChampionshipDimension {
  /**
   * Its key in the criteria and in the facet counts.
   */
  key: string;
  /**
   * Every value one championship carries on it. A championship may carry
   * several - a class per discipline, a pack per car - and matches a pick
   * when any of them was picked.
   * @param listing The championship
   * @returns Its values, which may be empty
   */
  values(listing: SeriesListing): readonly string[];
}

/**
 * Everything the user has chosen but the text they are typing.
 */
export interface ChampionshipCriteria {
  /**
   * The values picked, per dimension key. A dimension with nothing picked
   * narrows nothing.
   */
  picked: Readonly<Record<string, readonly string[]>>;
  /**
   * What the list is sorted by.
   */
  sort: ChampionshipSortKey;
  /**
   * Which way the sort runs.
   */
  direction: SortDirection;
}

/**
 * A championship list's whole surface.
 */
export interface ChampionshipBrowser {
  /**
   * The search box's text.
   */
  search: string;
  /**
   * The filters and sort currently applied.
   */
  criteria: ChampionshipCriteria;
  /**
   * Counts behind each dimension's list, keyed as the dimensions are.
   */
  facets: Readonly<Record<string, Facet[]>>;
  /**
   * The championships that pass, in the order asked for.
   */
  shown: SeriesListing[];
  /**
   * How many there were before anything was narrowed.
   */
  total: number;
  /**
   * Whether anything is narrowed, so clearing can be offered.
   */
  filtered: boolean;
  /**
   * Replaces the search text.
   * @param next What the user has typed
   */
  setSearch(next: string): void;
  /**
   * Replaces the filters and sort wholesale.
   * @param next The criteria to apply
   */
  setCriteria(next: ChampionshipCriteria): void;
  /**
   * Drops every filter and the search text, keeping the sort.
   */
  clear(): void;
  /**
   * Hands over the list's scrolling element, which the hook records the
   * position of and puts back once the list is there to scroll.
   * @param element The element, or null once it unmounts
   */
  scrollRef(element: HTMLDivElement | null): void;
}
