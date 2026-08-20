// Filtering, sorting and paging over scanned content. The queries cross the IPC
// boundary, so a browser screen asks main for one page rather than holding a
// copy of a mod library that runs to thousands of entries.

/**
 * A page of results, plus how many matched before paging.
 */
export interface Page<T> {
  /**
   * The entries on this page.
   */
  items: T[];
  /**
   * How many entries matched the query in total, ignoring offset and limit.
   */
  total: number;
  /**
   * Where this page started.
   */
  offset: number;
  /**
   * How many were returned at most; clamped by the handler, not by the caller.
   */
  limit: number;
}

/**
 * Which direction a sort runs in.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * One value of a facet, and how many entries carry it.
 */
export interface Facet {
  /**
   * The value itself, as written in the mod's metadata.
   */
  value: string;
  /**
   * How many entries carry it.
   */
  count: number;
}

/**
 * What a car list can be sorted by.
 */
export type CarSortKey = 'name' | 'brand' | 'year' | 'bhp' | 'weight' | 'powerToWeight';

/**
 * A filtered, searched, sorted and paged request for cars.
 *
 * Values within one filter are OR'd; separate filters are AND'd. Every field is
 * optional, so an empty object means "everything, default sort, first page".
 */
export interface CarQuery {
  /**
   * Free text. Every whitespace-separated term must match the name, brand,
   * folder ID or one of the tags.
   */
  search?: string;
  /**
   * Keep only cars of these brands.
   */
  brands?: string[];
  /**
   * Keep only cars carrying all of these tags.
   */
  tags?: string[];
  /**
   * Keep only cars from these countries of origin.
   */
  countries?: string[];
  /**
   * Keep only these ui_car.json class values.
   */
  classes?: string[];
  /**
   * Earliest model year, inclusive. Cars with no year are excluded when set.
   */
  yearFrom?: number;
  /**
   * Latest model year, inclusive. Cars with no year are excluded when set.
   */
  yearTo?: number;
  /**
   * Minimum power in bhp, inclusive. Cars with no parsed power are excluded
   * when set.
   */
  bhpFrom?: number;
  /**
   * Maximum power in bhp, inclusive. Cars with no parsed power are excluded
   * when set.
   */
  bhpTo?: number;
  /**
   * Keep only cars that have at least one livery installed.
   */
  hasSkins?: boolean;
  /**
   * What to sort by. Defaults to name.
   */
  sort?: CarSortKey;
  /**
   * Which way to sort. Defaults to ascending.
   */
  direction?: SortDirection;
  /**
   * Where to start. Defaults to 0.
   */
  offset?: number;
  /**
   * How many to return. Defaults to 50 and is clamped to 500.
   */
  limit?: number;
}

/**
 * What a track list can be sorted by.
 */
export type TrackSortKey = 'name' | 'country' | 'pitboxes';

/**
 * A filtered, searched, sorted and paged request for track layouts.
 */
export interface TrackQuery {
  /**
   * Free text. Every whitespace-separated term must match the name, folder ID
   * or country.
   */
  search?: string;
  /**
   * Keep only tracks in these countries.
   */
  countries?: string[];
  /**
   * Minimum grid capacity, inclusive. Tracks with no pitbox count are excluded
   * when set.
   */
  pitboxesFrom?: number;
  /**
   * Maximum grid capacity, inclusive. Tracks with no pitbox count are excluded
   * when set.
   */
  pitboxesTo?: number;
  /**
   * Keep only tracks whose real-world position is known.
   */
  hasGeotags?: boolean;
  /**
   * What to sort by. Defaults to name.
   */
  sort?: TrackSortKey;
  /**
   * Which way to sort. Defaults to ascending.
   */
  direction?: SortDirection;
  /**
   * Where to start. Defaults to 0.
   */
  offset?: number;
  /**
   * How many to return. Defaults to 50 and is clamped to 500.
   */
  limit?: number;
}

/**
 * Every facet a car browser offers, with counts.
 *
 * Counts drill down: each dimension is counted against the search and every
 * other filter but not its own, so ticking a brand does not empty the brand
 * list. Null values are absent rather than collected into a synthetic bucket -
 * naming one would be a UI decision made in the wrong layer.
 */
export interface CarFacets {
  /**
   * Manufacturers, by descending count then name.
   */
  brands: Facet[];
  /**
   * Free-text tags, by descending count then name.
   */
  tags: Facet[];
  /**
   * Countries of origin, by descending count then name.
   */
  countries: Facet[];
  /**
   * ui_car.json class values, by descending count then name.
   */
  classes: Facet[];
  /**
   * Model years, most recent first.
   */
  years: Facet[];
}

/**
 * Every facet a track browser offers, with counts.
 */
export interface TrackFacets {
  /**
   * Countries, by descending count then name.
   */
  countries: Facet[];
}
