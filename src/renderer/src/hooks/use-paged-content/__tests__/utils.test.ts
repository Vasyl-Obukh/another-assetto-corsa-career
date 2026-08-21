import { describe, expect, it } from '@jest/globals';

import {
  entries, idOf, makePage,
} from './fixtures.ts';
import { appendPage, emptyState, firstPage } from '../utils.ts';

describe('renderer/hooks/use-paged-content/utils', () => {
  describe('emptyState', () => {
    it('carries the key it was built for, so a later page can be matched to it', () => {
      expect(emptyState('{"sort":"name"}').key).toBe('{"sort":"name"}');
    });

    it('is not exhausted, so the first page is still asked for', () => {
      const state = emptyState('key');

      expect(state.items).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.exhausted).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('firstPage', () => {
    it('takes the page whole and records what it matched', () => {
      const state = firstPage('key', makePage(entries('a', 'b'), 10));

      expect(state.items).toEqual(entries('a', 'b'));
      expect(state.total).toBe(10);
    });

    it('is exhausted when the page already holds everything that matched', () => {
      expect(firstPage('key', makePage(entries('a', 'b'), 2)).exhausted).toBe(true);
    });

    it('is not exhausted when more matched than came back', () => {
      expect(firstPage('key', makePage(entries('a', 'b'), 3)).exhausted).toBe(false);
    });

    it('is exhausted when nothing matched at all', () => {
      expect(firstPage('key', makePage([], 0)).exhausted).toBe(true);
    });

    it('clears any error the previous query left behind', () => {
      expect(firstPage('key', makePage(entries('a'), 1)).error).toBeNull();
    });
  });

  describe('appendPage', () => {
    it('adds the new page after what was already held', () => {
      const previous = firstPage('key', makePage(entries('a', 'b'), 4));
      const next = appendPage(previous, makePage(entries('c', 'd'), 4), 'key', idOf);

      expect(next.items).toEqual(entries('a', 'b', 'c', 'd'));
    });

    // A page that resolves after the filters changed belongs to a query nobody
    // is looking at any more. Appending it would mix two result sets together.
    it('drops a page whose query is no longer the one being shown', () => {
      const previous = firstPage('old', makePage(entries('a'), 4));
      const next = appendPage(previous, makePage(entries('b'), 4), 'new', idOf);

      expect(next).toBe(previous);
    });

    // Content installed between two pages shifts every offset after it, so the
    // same entry can come back twice. A repeated React key is a hard error.
    it('does not append an entry it is already holding', () => {
      const previous = firstPage('key', makePage(entries('a', 'b'), 4));
      const next = appendPage(previous, makePage(entries('b', 'c'), 4), 'key', idOf);

      expect(next.items).toEqual(entries('a', 'b', 'c'));
    });

    it('leaves the list unchanged when the whole page was already held', () => {
      const previous = firstPage('key', makePage(entries('a', 'b'), 4));
      const next = appendPage(previous, makePage(entries('a', 'b'), 4), 'key', idOf);

      expect(next.items).toEqual(entries('a', 'b'));
    });

    it('adopts the total from the newest page, which may have moved', () => {
      const previous = firstPage('key', makePage(entries('a'), 10));
      const next = appendPage(previous, makePage(entries('b'), 7), 'key', idOf);

      expect(next.total).toBe(7);
    });

    it('is exhausted once everything that matched is held', () => {
      const previous = firstPage('key', makePage(entries('a', 'b'), 4));
      const next = appendPage(previous, makePage(entries('c', 'd'), 4), 'key', idOf);

      expect(next.exhausted).toBe(true);
    });

    it('is not exhausted while the count says there is more', () => {
      const previous = firstPage('key', makePage(entries('a', 'b'), 6));
      const next = appendPage(previous, makePage(entries('c', 'd'), 6), 'key', idOf);

      expect(next.exhausted).toBe(false);
    });

    // Guards a scroll that would otherwise never stop: if the library shrinks
    // under a scrolled list, the count can stay above what is held while the
    // pages themselves have run out.
    it('is exhausted on an empty page even when the count disagrees', () => {
      const previous = firstPage('key', makePage(entries('a'), 99));
      const next = appendPage(previous, makePage([], 99), 'key', idOf);

      expect(next.exhausted).toBe(true);
    });

    it('is exhausted when every entry in the page was a duplicate', () => {
      const previous = firstPage('key', makePage(entries('a', 'b'), 99));
      const next = appendPage(previous, makePage(entries('a', 'b'), 2), 'key', idOf);

      expect(next.exhausted).toBe(true);
    });

    it('stops reporting a page in flight', () => {
      const previous = { ...firstPage('key', makePage(entries('a'), 4)), loadingMore: true };

      expect(appendPage(previous, makePage(entries('b'), 4), 'key', idOf).loadingMore).toBe(false);
    });

    it('does not mutate what it was given', () => {
      const previous = firstPage('key', makePage(entries('a'), 4));
      appendPage(previous, makePage(entries('b'), 4), 'key', idOf);

      expect(previous.items).toEqual(entries('a'));
    });
  });
});
