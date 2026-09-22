import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { CalendarEntry } from '../../../../../shared/types';
import type { CalendarCriteria } from '../types.ts';
import {
  agendaDays, commitments, offeredDisciplines, passesFilter, shownEvents,
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
  firstDay: '2026-03-06',
  raceDay: '2026-03-08',
  lastDay: '2026-03-08',
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
        event({ round: 'imola', raceDay: '2026-03-08' }),
        event({ round: 'magione', raceDay: '2026-03-08' }),
        event({ round: 'mugello', raceDay: '2026-03-15' }),
      ];

      expect(agendaDays(events)).toEqual([
        { date: '2026-03-08', events: [events[0], events[1]] },
        { date: '2026-03-15', events: [events[2]] },
      ]);
    });

    it('lists no day that has nothing on it', () => {
      expect(agendaDays([])).toEqual([]);
    });
  });

  describe('commitments', () => {
    it('counts the weekends the career entered', () => {
      const events = [event({ enrolled: true }), event({ enrolled: true }), event()];

      expect(commitments(events).enrolled).toBe(2);
    });

    it('counts a clash only on a weekend the career actually entered', () => {
      const events = [event({ enrolled: true, clash: true }), event({ clash: true })];

      expect(commitments(events)).toEqual({ enrolled: 1, clashes: 1 });
    });
  });
});
