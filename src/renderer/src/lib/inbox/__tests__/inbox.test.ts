import { describe, expect, it } from '@jest/globals';

import type {
  Career, CareerSeason, HistoricDraw, Mail, SeasonEntry,
} from '../../../../../shared/types';
import { makeSeries } from '../../season-results/__tests__/fixtures.ts';
import { INBOX_PAGE_SIZE } from '../constants.ts';
import {
  byMonth, inboxItem, inboxItems, inFolder, matchesSearch, pageCount, pageOf,
} from '../inbox.ts';

const RACE_ID = 'monaco-1967/r1@0.0';

/**
 * A historic event as the season drew it: the test championship cut to its one
 * round at Magione.
 * @param overrides What to change about the event itself
 * @returns The draw
 */
const draw = (overrides: Parameters<typeof makeSeries>[0] = {}): HistoricDraw => {
  const series = makeSeries({ id: 'monaco-1967', name: 'Monaco Grand Prix 1967', ...overrides });

  return {
    series: 'monaco-1967',
    championship: { ...series, rounds: series.rounds.slice(0, 1) },
    round: 'r1',
    raceId: RACE_ID,
    date: '2026-05-07',
    invitations: '2026-04-09',
  };
};

/**
 * The player's own entry into the drawn event.
 * @param overrides What to change about it
 * @returns The entry
 */
const entered = (overrides: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: 'monaco-1967',
  edition: 0,
  championship: draw({ name: 'Monaco Grand Prix 1967 (entered)' }).championship,
  entry: 'main',
  playerSeat: 'main-2',
  car: { model: 'test_car' },
  field: [],
  events: [{
    round: 'r1', raceId: RACE_ID, date: '2026-05-07', status: 'scheduled', sessions: [],
  }],
  standings: { classes: [], updatedAt: '' },
  historic: true,
  ...overrides,
});

/**
 * An invitation to Bo's seat in the drawn event.
 * @param overrides What to change about it
 * @returns The mail
 */
const mail = (overrides: Partial<Mail> = {}): Mail => ({
  id: `invite:${RACE_ID}`,
  kind: 'invitation',
  season: 0,
  arrived: '2026-04-09',
  opened: false,
  deadline: '2026-05-07',
  invitation: {
    series: 'monaco-1967', raceId: RACE_ID, entry: 'main', seat: 'main-2', car: { model: 'test_car' },
  },
  ...overrides,
});

/**
 * A career on its first season, at the date given.
 * @param inbox Its mail
 * @param season What to change about its season
 * @param date The ISO date its clock stands at
 * @returns The career
 */
const career = (
  inbox: readonly Mail[],
  season: Partial<CareerSeason> = {},
  date = '2026-04-20',
): Career => ({
  date,
  inbox,
  seasons: [{
    index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries: [], historicEvents: [draw()], ...season,
  }],
} as unknown as Career);

/**
 * A mail joined to nothing in particular, arriving on the day given.
 * @param id Its id
 * @param arrived The ISO date it arrived
 * @returns The item
 */
const arriving = (id: string, arrived: string) => {
  const one = mail({ id, arrived });

  return inboxItem(career([one]), one);
};

describe('renderer/lib/inbox/inbox', () => {
  describe('inboxItem', () => {
    it("joins an invitation to the season's draw and the class, seat and team it offers", () => {
      const offer = mail();
      const drawn = draw();
      const item = inboxItem(career([offer], { historicEvents: [drawn] }), offer);

      expect(item.event).toBe(drawn.championship);
      expect(item.draw).toBe(drawn);
      expect(item).toMatchObject({
        mail: offer,
        status: 'awaiting',
        round: { id: 'r1' },
        entry: { id: 'main' },
        seat: { id: 'main-2', driver: { name: 'Bo' } },
        team: { id: 'alpha', name: 'Alpha Racing' },
        entered: null,
      });
    });

    it("reads the player's own copy of the event once they are in it", () => {
      const offer = mail({ reply: { answer: 'accepted', on: '2026-04-10' } });
      const own = entered();
      const item = inboxItem(career([offer], { entries: [own] }), offer);

      expect(item.entered).toBe(own);
      expect(item.event).toBe(own.championship);
      expect(item.event?.name).toBe('Monaco Grand Prix 1967 (entered)');
      expect(item.draw?.raceId).toBe(RACE_ID);
      expect(item.status).toBe('accepted');
    });

    it('reads the drawn copy again once the player has withdrawn', () => {
      const offer = mail();
      const item = inboxItem(career([offer], { entries: [entered({ withdrawn: true })] }), offer);

      expect(item.entered).toBeNull();
      expect(item.event?.name).toBe('Monaco Grand Prix 1967');
    });

    it('takes no championship of the season for the event, even one racing the same day', () => {
      const offer = mail();
      const championship = entered({ historic: undefined });
      const item = inboxItem(career([offer], { entries: [championship] }), offer);

      expect(item.entered).toBeNull();
    });

    it('says where the mail stands against the clock', () => {
      expect(inboxItem(career([], {}, '2026-05-07'), mail()).status).toBe('awaiting');
      expect(inboxItem(career([], {}, '2026-05-08'), mail()).status).toBe('lapsed');
      expect(inboxItem(career([]), mail({ reply: { answer: 'declined', on: '2026-04-10' } })).status)
        .toBe('declined');
    });

    it('joins to nothing when the season no longer holds the event', () => {
      expect(inboxItem(career([], { historicEvents: [] }), mail())).toMatchObject({
        event: null, draw: null, round: null, entry: null, seat: null, team: null, entered: null,
      });
      expect(inboxItem(career([]), mail({ season: 4 })).event).toBeNull();
    });

    it('joins no seat or team the event does not hold', () => {
      const offer = mail({
        invitation: {
          series: 'monaco-1967', raceId: RACE_ID, entry: 'main', seat: 'gone', car: { model: 'test_car' },
        },
      });
      const item = inboxItem(career([offer]), offer);

      expect(item.entry?.id).toBe('main');
      expect(item.seat).toBeNull();
      expect(item.team).toBeNull();
    });
  });

  describe('inboxItems', () => {
    it('lists every mail newest first, joined to what it is about', () => {
      const old = mail({ id: 'a', arrived: '2026-02-01' });
      const recent = mail({ id: 'b', arrived: '2026-04-09' });
      const items = inboxItems(career([old, recent]));

      expect(items.map((item) => item.mail.id)).toEqual(['b', 'a']);
      expect(items[0].event?.name).toBe('Monaco Grand Prix 1967');
    });

    it('orders mail arriving the same day the same way however it was stored', () => {
      const first = mail({ id: 'invite:a' });
      const second = mail({ id: 'invite:b' });
      const ids = (inbox: Mail[]) => inboxItems(career(inbox)).map((item) => item.mail.id);

      expect(ids([first, second])).toEqual(ids([second, first]));
    });

    it('reads an empty inbox as no mail', () => {
      expect(inboxItems(career([]))).toEqual([]);
    });
  });

  describe('inFolder', () => {
    const unread = arriving('unread', '2026-04-09');
    const read = inboxItem(career([]), mail({ opened: true, reply: { answer: 'declined', on: '2026-04-10' } }));

    it('lists everything in All mail', () => {
      expect(inFolder(unread, 'all')).toBe(true);
      expect(inFolder(read, 'all')).toBe(true);
    });

    it('lists only what is unopened under Unread', () => {
      expect(inFolder(unread, 'unread')).toBe(true);
      expect(inFolder(read, 'unread')).toBe(false);
    });

    it('lists only what still wants an answer under Awaiting reply', () => {
      expect(inFolder(unread, 'awaiting')).toBe(true);
      expect(inFolder(read, 'awaiting')).toBe(false);
      expect(inFolder(inboxItem(career([], {}, '2026-06-01'), mail()), 'awaiting')).toBe(false);
    });

    it('lists every invitation under its kind, answered or not', () => {
      expect(inFolder(unread, 'invitation')).toBe(true);
      expect(inFolder(read, 'invitation')).toBe(true);
    });
  });

  describe('matchesSearch', () => {
    const item = inboxItem(career([]), mail());

    it('matches the event, the team and the driver of the seat', () => {
      expect(matchesSearch(item, 'monaco')).toBe(true);
      expect(matchesSearch(item, 'alpha')).toBe(true);
      expect(matchesSearch(item, 'bo')).toBe(true);
    });

    it('matches only where every word is found, folding case and accents', () => {
      expect(matchesSearch(item, 'MONACO 1967 alpha')).toBe(true);
      expect(matchesSearch(item, 'Mônaco')).toBe(true);
      expect(matchesSearch(item, 'monaco beta')).toBe(false);
    });

    it('matches anything when nothing is typed', () => {
      expect(matchesSearch(item, '')).toBe(true);
      expect(matchesSearch(item, '   ')).toBe(true);
    });

    it('matches no words for a mail joined to nothing', () => {
      const orphan = inboxItem(career([], { historicEvents: [] }), mail());

      expect(matchesSearch(orphan, 'monaco')).toBe(false);
      expect(matchesSearch(orphan, '')).toBe(true);
    });
  });

  describe('pageCount', () => {
    it('runs to a page per thirty mail, rounding up', () => {
      expect(pageCount(INBOX_PAGE_SIZE)).toBe(1);
      expect(pageCount(INBOX_PAGE_SIZE + 1)).toBe(2);
      expect(pageCount(INBOX_PAGE_SIZE * 3)).toBe(3);
    });

    it('runs to one page for an empty inbox', () => {
      expect(pageCount(0)).toBe(1);
    });
  });

  describe('pageOf', () => {
    const items = Array.from({ length: 65 }, (_, index) => index);

    it('cuts thirty mail to a page, counting from one', () => {
      expect(pageOf(items, 1)).toEqual(items.slice(0, 30));
      expect(pageOf(items, 2)).toEqual(items.slice(30, 60));
      expect(pageOf(items, 3)).toEqual([60, 61, 62, 63, 64]);
    });

    it('holds a page past the last to the last', () => {
      expect(pageOf(items, 9)).toEqual(pageOf(items, 3));
    });

    it('holds a page before the first to the first', () => {
      expect(pageOf(items, 0)).toEqual(pageOf(items, 1));
      expect(pageOf(items, -2)).toEqual(pageOf(items, 1));
    });

    it('reads an empty list as one empty page', () => {
      expect(pageOf([], 1)).toEqual([]);
      expect(pageOf([], 4)).toEqual([]);
    });
  });

  describe('byMonth', () => {
    it('cuts the mail into the months it arrived in, newest first', () => {
      const months = byMonth([
        arriving('d', '2026-05-20'),
        arriving('c', '2026-05-02'),
        arriving('b', '2026-04-30'),
        arriving('a', '2025-04-10'),
      ]);

      expect(months.map((one) => [one.month, one.items.map((item) => item.mail.id)])).toEqual([
        ['2026-05-20', ['d', 'c']],
        ['2026-04-30', ['b']],
        ['2025-04-10', ['a']],
      ]);
    });

    it('reads no mail as no months', () => {
      expect(byMonth([])).toEqual([]);
    });
  });
});
