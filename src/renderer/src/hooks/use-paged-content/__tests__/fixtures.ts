// Shared fixtures for the paging tests. Entries are the smallest thing that can
// carry an identity, since nothing here cares what is being paged.

import type { Page } from '../../../../../shared/types';

/**
 * The smallest thing a paged list can hold.
 */
export interface Entry {
  /**
   * What idOf reads.
   */
  id: string;
}

/**
 * Reads a fixture entry's identity.
 * @param entry The entry to identify
 * @returns Its id
 */
export const idOf = (entry: Entry): string => entry.id;

/**
 * Builds entries from their ids.
 * @param ids The ids to build
 * @returns One entry per id, in order
 */
export const entries = (...ids: string[]): Entry[] => ids.map((id) => ({ id }));

/**
 * Builds a page as the main process would return one.
 * @param items What the page holds
 * @param total How many matched before paging
 * @returns A complete Page
 */
export const makePage = (items: Entry[], total: number): Page<Entry> => ({
  items,
  total,
  offset: 0,
  limit: 60,
});
