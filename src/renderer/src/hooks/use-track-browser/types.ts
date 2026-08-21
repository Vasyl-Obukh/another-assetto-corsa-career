import type { Track, TrackFacets, TrackQuery } from '../../../../shared/types';
import type { PagedList } from '../use-paged-content/index.ts';

/**
 * Everything the user has chosen, minus the text they are still typing and the
 * paging the list owns.
 */
export type TrackCriteria = Omit<TrackQuery, 'offset' | 'limit' | 'search'>;

/**
 * The track browser's whole surface.
 */
export interface TrackBrowser {
  /**
   * The search box's raw text, so the input never lags a debounce behind.
   */
  search: string;
  /**
   * The filters and sort currently applied.
   */
  criteria: TrackCriteria;
  /**
   * Counts behind the filter lists, or null before the first response.
   */
  facets: TrackFacets | null;
  /**
   * The track layouts themselves, loaded a page at a time.
   */
  list: PagedList<Track>;
  /**
   * Whether content changed under a list the user has already scrolled.
   */
  stale: boolean;
  /**
   * Whether any filter is set, so clearing can be offered.
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
  setCriteria(next: TrackCriteria): void;
  /**
   * Drops every filter and the search text.
   */
  clear(): void;
  /**
   * Loads the list again from the first page.
   */
  refresh(): void;
}
