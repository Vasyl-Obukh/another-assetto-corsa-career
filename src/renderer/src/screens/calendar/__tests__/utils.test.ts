import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { CalendarEntry } from '../../../../../shared/types';
import { DEFAULT_CRITERIA } from '../constants.ts';
import type { CalendarCriteria } from '../types.ts';
import {
  agendaDays, defaultDay, eventKey, eventRank, monthGrid, monthOf, nextEvent,
  offeredDisciplines, passesFilter, readCriteria, readView, seasonMonths, shiftMonth,
  shownEvents, statusCounts,
} from '../utils.ts';

/**
 * One event of a career's calendar, for a test to move a field or two of.
 * @param overrides What to change about it
 * @returns The event
 */
const event = (overrides: Partial<CalendarEntry> = {}): CalendarEntry => ({
  series: 'sunday-cup',
  seriesName: 'Sunday Cup',
  entry: 'main',
  entryName: 'Main',
  ladder: { discipline: Discipline.ROAD, tier: 5 },
  round: 'magione',
  number: 1,
  roundName: 'Magione',
  track: { id: 'magione' },
  races: [],
  gridSize: 12,
  prize: null,
  multiClass: false,
  date: '2026-03-08',
  status: 'scheduled',
  enrolled: false,
  eligible: true,
  raceable: true,
  clash: false,
  ...overrides,
});

/**
 * The filters, with nothing narrowed unless a test says so.
 * @param overrides What to narrow
 * @returns The criteria
 */
const criteria = (overrides: Partial<CalendarCriteria> = {}): CalendarCriteria => ({
  status: 'all',
  disciplines: [],
  ...overrides,
});

describe('renderer/screens/calendar/utils', () => {
  describe('passesFilter', () => {
    it('shows every event while nothing is narrowed', () => {
      expect(passesFilter(event({ eligible: false, raceable: false }), criteria())).toBe(true);
    });

    it('shows only the disciplines that are picked', () => {
      const picked = criteria({ disciplines: [Discipline.SINGLE_SEATER] });

      expect(passesFilter(event({ ladder: { discipline: Discipline.SINGLE_SEATER, tier: 3 } }), picked)).toBe(true);
      expect(passesFilter(event(), picked)).toBe(false);
    });

    it('shows only what the career entered under "entered"', () => {
      const entered = criteria({ status: 'entered' });

      expect(passesFilter(event({ enrolled: true }), entered)).toBe(true);
      expect(passesFilter(event(), entered)).toBe(false);
    });

    // Locked is about the ladder alone: a round you are too junior for is a
    // different thing from one whose track you have not installed.
    it('locks an event on the rung alone, whether or not it could be raced', () => {
      const locked = criteria({ status: 'locked' });

      expect(passesFilter(event({ eligible: false, raceable: false }), locked)).toBe(true);
      expect(passesFilter(event({ eligible: true, raceable: false }), locked)).toBe(false);
    });

    it('offers as available only what is reachable, raceable and not already entered', () => {
      const available = criteria({ status: 'available' });

      expect(passesFilter(event(), available)).toBe(true);
      expect(passesFilter(event({ eligible: false }), available)).toBe(false);
      expect(passesFilter(event({ raceable: false }), available)).toBe(false);
      expect(passesFilter(event({ enrolled: true }), available)).toBe(false);
    });
  });

  describe('shownEvents', () => {
    it('drops an event whose championship the user\'s switches leave out', () => {
      const events = [event({ series: 'sunday-cup' }), event({ series: 'lotus-cup' })];

      expect(shownEvents(events, new Set(['sunday-cup']), criteria()))
        .toEqual([events[0]]);
    });

    // A season under way would otherwise vanish from the calendar it is being
    // raced on.
    it('keeps an entered event whose championship was switched off', () => {
      const entered = event({ series: 'lotus-cup', enrolled: true });

      expect(shownEvents([entered], new Set(['sunday-cup']), criteria())).toEqual([entered]);
    });

    it('narrows what is left by the filters as well', () => {
      const events = [event({ enrolled: true }), event({ round: 'imola' })];

      expect(shownEvents(events, new Set(['sunday-cup']), criteria({ status: 'entered' })))
        .toEqual([events[0]]);
    });

    it('leaves the events in the order they were given', () => {
      const events = [event({ round: 'imola' }), event({ round: 'magione' }), event({ round: 'mugello' })];

      expect(shownEvents(events, new Set(['sunday-cup']), criteria()).map((one) => one.round))
        .toEqual(['imola', 'magione', 'mugello']);
    });
  });

  describe('offeredDisciplines', () => {
    it('names each discipline once, in the order it first appears', () => {
      const events = [
        event({ ladder: { discipline: Discipline.TOURING, tier: 4 } }),
        event({ ladder: { discipline: Discipline.ROAD, tier: 5 } }),
        event({ ladder: { discipline: Discipline.TOURING, tier: 2 } }),
      ];

      expect(offeredDisciplines(events)).toEqual([Discipline.TOURING, Discipline.ROAD]);
    });

    it('names nothing for an empty calendar', () => {
      expect(offeredDisciplines([])).toEqual([]);
    });
  });

  describe('agendaDays', () => {
    it('groups the events onto the day they race on, keeping the order given', () => {
      const events = [
        event({ round: 'imola', date: '2026-03-08' }),
        event({ round: 'magione', date: '2026-03-08' }),
        event({ round: 'mugello', date: '2026-03-15' }),
      ];

      expect(agendaDays(events)).toEqual([
        { date: '2026-03-08', events: [events[0], events[1]] },
        { date: '2026-03-15', events: [events[2]] },
      ]);
    });

    it('lists no day that has nothing on it', () => {
      expect(agendaDays([])).toEqual([]);
    });

    it('puts the events the career is in first, then what it could enter', () => {
      const locked = event({ round: 'imola', eligible: false });
      const open = event({ round: 'magione' });
      const yours = event({ round: 'mugello', enrolled: true });

      expect(agendaDays([locked, open, yours])[0].events).toEqual([yours, open, locked]);
    });
  });

  describe('eventKey', () => {
    // One round of a multi-class championship is an event per class entry, so
    // the round alone would key two cards the same.
    it('tells apart two class entries of the same round', () => {
      expect(eventKey(event({ entry: 'gt3' }))).not.toBe(eventKey(event({ entry: 'gt4' })));
    });

    it('gives the same event the same key every time', () => {
      expect(eventKey(event())).toBe(eventKey(event()));
    });
  });

  describe('eventRank', () => {
    it('ranks the events the career is in first', () => {
      expect(eventRank(event({ enrolled: true, eligible: false }))).toBe(0);
    });

    it('ranks what the career could enter next', () => {
      expect(eventRank(event())).toBe(1);
    });

    it('ranks a round above the career, or one the install cannot run, last', () => {
      expect(eventRank(event({ eligible: false }))).toBe(2);
      expect(eventRank(event({ raceable: false }))).toBe(2);
    });
  });

  describe('statusCounts', () => {
    it('counts what every status would leave', () => {
      const events = [
        event({ enrolled: true }),
        event(),
        event({ eligible: false }),
      ];

      expect(statusCounts(events, criteria())).toEqual({
        all: 3, available: 1, entered: 1, locked: 1,
      });
    });

    it('counts under the disciplines already picked, whatever status is on', () => {
      const events = [
        event({ ladder: { discipline: Discipline.ROAD, tier: 5 } }),
        event({ ladder: { discipline: Discipline.TOURING, tier: 5 } }),
      ];

      expect(statusCounts(events, criteria({ status: 'entered', disciplines: [Discipline.ROAD] })).all).toBe(1);
    });
  });

  describe('nextEvent', () => {
    it('goes to the next event the career is in before any other', () => {
      const other = event({ round: 'imola', date: '2026-03-06' });
      const yours = event({ round: 'mugello', date: '2026-03-13', enrolled: true });

      expect(nextEvent([other, yours], '2026-03-01')).toBe(yours);
    });

    it('falls back to the next event at all when the career is in none to come', () => {
      const past = event({ round: 'imola', date: '2026-02-27', enrolled: true });
      const other = event({ round: 'mugello', date: '2026-03-06' });

      expect(nextEvent([past, other], '2026-03-01')).toBe(other);
    });

    // The clock already stands on an event raced today, so moving to it would
    // go nowhere.
    it('passes over an event on the day the clock stands at', () => {
      expect(nextEvent([event({ date: '2026-03-06' })], '2026-03-06')).toBeNull();
    });
  });

  describe('monthOf', () => {
    it('reads the first day of the month a date falls in', () => {
      expect(monthOf('2026-03-18')).toBe('2026-03-01');
    });
  });

  describe('shiftMonth', () => {
    it('moves a month forward and back across a year end', () => {
      expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01');
      expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01');
    });
  });

  describe('seasonMonths', () => {
    it('lists every month from the opening to the close, empty ones too', () => {
      const months = seasonMonths('2026-03-15', '2026-05-10', []);

      expect(months.map((month) => month.start)).toEqual(['2026-03-01', '2026-04-01', '2026-05-01']);
      expect(months.every((month) => month.ticks.length === 0)).toBe(true);
    });

    it('ticks a race day once, however many events share it', () => {
      const months = seasonMonths('2026-03-01', '2026-03-31', [
        event({ round: 'imola', date: '2026-03-08' }),
        event({ round: 'magione', date: '2026-03-08' }),
        event({ round: 'mugello', date: '2026-03-22' }),
      ]);

      expect(months[0].ticks).toEqual(['other', 'other']);
    });

    it('marks a day the career races, and a clash over that', () => {
      const months = seasonMonths('2026-03-01', '2026-03-31', [
        event({ round: 'imola', date: '2026-03-08', enrolled: true }),
        event({ round: 'magione', date: '2026-03-15', enrolled: true, clash: true }),
        event({ round: 'mugello', date: '2026-03-15', enrolled: true }),
      ]);

      expect(months[0].ticks).toEqual(['yours', 'clash']);
    });

    it('reads a clash only on an event the career entered', () => {
      const months = seasonMonths('2026-03-01', '2026-03-31', [
        event({ date: '2026-03-08', clash: true }),
      ]);

      expect(months[0].ticks).toEqual(['other']);
    });
  });

  describe('monthGrid', () => {
    it('draws whole weeks from the Monday before the first to the Sunday after the last', () => {
      // March 2026 opens on a Sunday and closes on a Tuesday.
      const days = monthGrid('2026-03-01');

      expect(days[0]).toBe('2026-02-23');
      expect(days.at(-1)).toBe('2026-04-05');
      expect(days).toHaveLength(42);
    });

    it('starts on the first itself when the month opens on a Monday', () => {
      // June 2026 opens on a Monday and closes on a Tuesday.
      const days = monthGrid('2026-06-01');

      expect(days[0]).toBe('2026-06-01');
      expect(days).toHaveLength(35);
    });

    it('draws four weeks for a February that fills them exactly', () => {
      // February 2027 opens on a Monday and has 28 days.
      expect(monthGrid('2027-02-01')).toHaveLength(28);
    });
  });

  describe('defaultDay', () => {
    const events = [
      event({ round: 'imola', date: '2026-03-08' }),
      event({ round: 'mugello', date: '2026-03-22' }),
      event({ round: 'spa', date: '2026-04-05' }),
    ];

    it('lists the first race day of the month still to come', () => {
      expect(defaultDay(events, '2026-03-01', '2026-03-10')).toBe('2026-03-22');
    });

    it('falls back to the first race day of the month once all of them are past', () => {
      expect(defaultDay(events, '2026-03-01', '2026-03-30')).toBe('2026-03-08');
    });

    it('falls back to the first day of the month when nothing races in it', () => {
      expect(defaultDay(events, '2026-05-01', '2026-03-10')).toBe('2026-05-01');
    });
  });

  describe('readCriteria', () => {
    it('reads back filters saved whole', () => {
      expect(readCriteria({ status: 'entered', disciplines: [Discipline.ROAD] }))
        .toEqual({ status: 'entered', disciplines: [Discipline.ROAD] });
    });

    it('opens on the defaults when nothing usable was saved', () => {
      expect(readCriteria(null)).toEqual(DEFAULT_CRITERIA);
      expect(readCriteria('entered')).toEqual(DEFAULT_CRITERIA);
    });

    it('keeps what is still valid and drops the rest', () => {
      expect(readCriteria({ status: 'withdrawn', disciplines: [Discipline.ROAD, 'rally', Discipline.ROAD] }))
        .toEqual({ status: DEFAULT_CRITERIA.status, disciplines: [Discipline.ROAD] });
    });
  });

  describe('readView', () => {
    it('reads back a layout that was saved', () => {
      expect(readView('month')).toBe('month');
    });

    it('opens on the timeline for anything else', () => {
      expect(readView('week')).toBe('days');
      expect(readView(undefined)).toBe('days');
    });
  });
});
