import type {
  Car, CarFacets, CarQuery,
} from '../../../../shared/types';
import type { PagedList } from '../use-paged-content/index.ts';
import type { BrowserView } from '@/lib/browser-memory';

/**
 * Everything the user has chosen, minus the text they are still typing and the
 * paging the list owns - plus the two choices main never sees.
 */
export type CarCriteria = Omit<CarQuery, 'offset' | 'limit' | 'search' | 'ids'> & {
  /**
   * Keep only what a championship races. Sent as the IDs the racing index
   * names, since main does not know which championships a career can enter.
   */
  raced?: boolean;
  /**
   * Whether the results are cards or a table. Remembered with the filters,
   * and never sent.
   */
  view?: BrowserView;
};

/**
 * The car browser's whole surface.
 */
export interface CarBrowser {
  /**
   * The search box's raw text, so the input never lags a debounce behind.
   */
  search: string;
  /**
   * The filters and sort currently applied.
   */
  criteria: CarCriteria;
  /**
   * Counts behind the filter lists, or null before the first response.
   */
  facets: CarFacets | null;
  /**
   * The cars themselves, loaded a page at a time.
   */
  list: PagedList<Car>;
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
  setCriteria(next: CarCriteria): void;
  /**
   * Drops every filter and the search text.
   */
  clear(): void;
  /**
   * Loads the list again from the first page.
   */
  refresh(): void;
}
