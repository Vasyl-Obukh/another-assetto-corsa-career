import type { PagedState } from './types.ts';
import type { Page } from '../../../../shared/types';

/**
 * The state a list starts in, before anything has been asked for.
 * @param key The query key it will belong to
 * @returns An empty state carrying that key
 */
export const emptyState = <T>(key: string): PagedState<T> => ({
  key,
  items: [],
  total: 0,
  exhausted: false,
  loadingMore: false,
  error: null,
});

/**
 * The state a freshly loaded first page lands in.
 * @param key The query key the page was loaded for
 * @param page The page that came back
 * @returns A state holding just that page
 */
export const firstPage = <T>(key: string, page: Page<T>): PagedState<T> => ({
  key,
  items: page.items,
  total: page.total,
  exhausted: page.items.length >= page.total,
  loadingMore: false,
  error: null,
});

/**
 * Merges a further page into what has already accumulated.
 *
 * Extracted from the hook because this is where paging can go quietly wrong, and
 * it is worth being able to test the two rules it encodes directly: a page that
 * arrives after the query changed is dropped rather than appended to a list it
 * has nothing to do with, and entries already held are not appended twice.
 * @param previous What has accumulated so far
 * @param page The page that came back
 * @param key The query key the page was loaded for
 * @param idOf Reads an entry's identity
 * @returns The merged state, or the previous one untouched when the page is stale
 */
export const appendPage = <T>(
  previous: PagedState<T>,
  page: Page<T>,
  key: string,
  idOf: (item: T) => string,
): PagedState<T> => {
  if (previous.key !== key) return previous;

  // Content can be installed between two pages, which shifts every offset after
  // it. A repeated entry would be a duplicate React key, which is a hard error
  // rather than a cosmetic one.
  const seen = new Set(previous.items.map(idOf));
  const items = [...previous.items, ...page.items.filter((item) => !seen.has(idOf(item)))];

  return {
    ...previous,
    items,
    total: page.total,
    // An empty page ends the list even when the count disagrees: without it, a
    // total that shrank under a scrolled list would scroll for ever.
    exhausted: items.length >= page.total || page.items.length === 0,
    loadingMore: false,
  };
};
