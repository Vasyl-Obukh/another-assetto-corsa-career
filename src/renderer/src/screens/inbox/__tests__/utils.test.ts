import { describe, expect, it } from '@jest/globals';

import type { Career, Championship, Mail } from '../../../../../shared/types';
import { eventLink, folderOf, pageNumber } from '../utils.ts';
import type { InboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';

/**
 * A career that has run to the season given.
 * @param seasons How many seasons it holds
 * @returns The career
 */
const career = (seasons: number): Career => ({
  seasons: Array.from({ length: seasons }, (_, index) => ({ index, entries: [] })),
} as unknown as Career);

/**
 * A mail of a season about the Monaco event's one round, or about nothing.
 * @param season Which season it arrived in
 * @param about Whether the season still holds the event
 * @returns The item
 */
const item = (season: number, about = true): InboxItem => ({
  mail: { id: 'invite:monaco', season } as Mail,
  status: 'awaiting',
  event: about ? { id: 'monaco 1967' } as Championship : null,
  draw: null,
  round: about ? { id: 'r1', name: 'Monaco', track: { id: 'monaco' } } : null,
  entry: null,
  seat: null,
  team: null,
  entered: null,
});

describe('renderer/screens/inbox/utils', () => {
  describe('folderOf', () => {
    it('reads the folder a URL names', () => {
      expect(folderOf('all')).toBe('all');
      expect(folderOf('unread')).toBe('unread');
      expect(folderOf('awaiting')).toBe('awaiting');
      expect(folderOf('invitation')).toBe('invitation');
    });

    // A hand-edited URL opens on All mail rather than on a folder listing nothing.
    it('opens on All mail for a URL naming no folder, or one there is not', () => {
      expect(folderOf(null)).toBe('all');
      expect(folderOf('')).toBe('all');
      expect(folderOf('spam')).toBe('all');
    });
  });

  describe('pageNumber', () => {
    it('reads the page a URL names', () => {
      expect(pageNumber('1')).toBe(1);
      expect(pageNumber('4')).toBe(4);
    });

    it('reads the first page for anything that is not a page', () => {
      expect(pageNumber(null)).toBe(1);
      expect(pageNumber('')).toBe(1);
      expect(pageNumber('0')).toBe(1);
      expect(pageNumber('-2')).toBe(1);
      expect(pageNumber('1.5')).toBe(1);
      expect(pageNumber('two')).toBe(1);
    });
  });

  describe('eventLink', () => {
    it("links the event's round in the season under way without naming it", () => {
      expect(eventLink(career(2), item(1))).toBe(path.event({ series: 'monaco 1967', round: 'r1' }));
      expect(eventLink(career(2), item(1))).toBe('/calendar/monaco%201967/r1');
    });

    it('names the season of a mail from a season gone by', () => {
      expect(eventLink(career(2), item(0))).toBe('/calendar/monaco%201967/r1?season=0');
    });

    it('links nothing when the season no longer holds the event', () => {
      expect(eventLink(career(1), item(0, false))).toBeNull();
    });
  });
});
