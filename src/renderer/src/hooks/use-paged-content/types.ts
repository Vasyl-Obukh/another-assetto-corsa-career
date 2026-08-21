import type { DisplayableError } from '@/lib/ipc';

/**
 * Everything accumulated for one query, plus which query it belongs to.
 *
 * The key travels with the data rather than beside it, so a page that resolves
 * after the query changed can be recognised and dropped instead of being
 * appended to a list it has nothing to do with.
 */
export interface PagedState<T> {
  /**
   * The query key this state was built from.
   */
  key: string;
  /**
   * Everything loaded so far, in order.
   */
  items: T[];
  /**
   * How many entries matched before paging.
   */
  total: number;
  /**
   * Whether everything that matched has been loaded.
   */
  exhausted: boolean;
  /**
   * Whether a further page is in flight.
   */
  loadingMore: boolean;
  /**
   * The last failure, or null when there is nothing to report.
   */
  error: DisplayableError | null;
}

/**
 * A list that loads itself one page at a time.
 */
export interface PagedList<T> {
  /**
   * Everything loaded for the current query, in order.
   */
  items: T[];
  /**
   * How many entries matched before paging.
   */
  total: number;
  /**
   * Whether the first page for the current query has yet to arrive.
   */
  loading: boolean;
  /**
   * Whether a further page is in flight.
   */
  loadingMore: boolean;
  /**
   * Whether everything that matched has been loaded.
   */
  exhausted: boolean;
  /**
   * The last failure, or null when there is nothing to report.
   */
  error: DisplayableError | null;
  /**
   * Asks for the next page. Does nothing while one is already in flight.
   */
  loadMore(): void;
  /**
   * Throws away what has been loaded and asks for the first page again.
   */
  reload(): void;
  /**
   * Clears the last failure.
   */
  dismissError(): void;
}
