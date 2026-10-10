import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type {
  CalendarEntry, Career, CareerCalendar, Championship, DriverStanding, SeasonEntry, SeasonEvent,
} from '../../../../../shared/types';
import { clashingWith, seasonProgress, upcomingEvent } from '../utils.ts';

/**
 * A calendar event the career is entered in and has still to race.
 * @param overrides What to change about it
 * @returns The event
 */
const calendarEvent = (overrides: Partial<CalendarEntry> = {}): CalendarEntry => ({
  series: 'cup',
  round: 'r1',
  date: '2026-03-08',
  status: 'scheduled',
  enrolled: true,
  ...overrides,
} as CalendarEntry);

/**
 * A round of an entered championship.
 * @param round The round's id
 * @param status How it stands
 * @returns The event
 */
const event = (round: string, status: SeasonEvent['status']): SeasonEvent => ({
  round, date: `2026-0${round.slice(1)}-01`, status,
} as SeasonEvent);

/**
 * A row of a class's table.
 * @param seat The seat it stands for
 * @param position Where it stands
 * @param points What it has scored
 * @param substitute Whether it is the stand-in's row for the seat
 * @returns The row
 */
const row = (seat: string, position: number, points: number, substitute?: boolean): DriverStanding => ({
  seat, position, points, substitute,
} as DriverStanding);

/**
 * A season entry of a one-class championship, the player in seat "me".
 * @param overrides What to change about it
 * @returns The entry
 */
const entered = (overrides: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: 'cup',
  entry: 'main',
  playerSeat: 'me',
  championship: {
    name: 'Sunday Cup',
    entries: [{ id: 'main', name: 'Main', ladder: { discipline: Discipline.TOURING, tier: 4 } }],
  } as unknown as Championship,
  events: [event('r1', 'raced'), event('r2', 'scheduled'), event('r3', 'scheduled')],
  standings: {
    classes: [{ entry: 'main', drivers: [row('ai', 1, 25), row('me', 2, 18)] }],
  },
  ...overrides,
} as SeasonEntry);

/**
 * A career whose only season holds the entries given.
 * @param entries The season's entries
 * @returns The career and the calendar of that season
 */
const careerWith = (...entries: SeasonEntry[]): [Career, CareerCalendar] => [
  { seasons: [{ index: 0, entries }] } as unknown as Career,
  { season: 0 } as CareerCalendar,
];

describe('renderer/screens/home/utils', () => {
  describe('upcomingEvent', () => {
    it('is the first entered event still to race', () => {
      const later = calendarEvent({ round: 'r2', date: '2026-03-22' });

      expect(upcomingEvent([calendarEvent(), later], '2026-03-01')?.round).toBe('r1');
    });

    it('includes an event on the day the clock stands at', () => {
      expect(upcomingEvent([calendarEvent()], '2026-03-08')?.round).toBe('r1');
    });

    it('passes over events not entered, already run, or behind the clock', () => {
      const events = [
        calendarEvent({ round: 'other', enrolled: false }),
        calendarEvent({ round: 'run', status: 'raced' }),
        calendarEvent({ round: 'gone', date: '2026-02-28' }),
        calendarEvent({ round: 'next', date: '2026-04-05' }),
      ];

      expect(upcomingEvent(events, '2026-03-01')?.round).toBe('next');
    });

    it('is null once nothing entered is left', () => {
      expect(upcomingEvent([calendarEvent({ status: 'missed' })], '2026-03-01')).toBeNull();
    });
  });

  describe('clashingWith', () => {
    it('finds the other entered events on the same day as it', () => {
      const held = calendarEvent({ clash: true });
      const sameDay = calendarEvent({ series: 'gt', clash: true });
      const apart = calendarEvent({ series: 'f4', date: '2026-03-09' });

      expect(clashingWith([held, sameDay, apart], held)).toEqual([sameDay]);
    });

    it('finds nothing for an event the calendar did not mark as clashing', () => {
      const held = calendarEvent();

      expect(clashingWith([held, calendarEvent({ series: 'gt' })], held)).toEqual([]);
    });

    it('never clashes an event with itself, nor with one not entered or given up', () => {
      const held = calendarEvent({ clash: true });

      expect(clashingWith([
        held,
        calendarEvent({ series: 'gt', enrolled: false }),
        calendarEvent({ series: 'f4', status: 'missed' }),
      ], held)).toEqual([]);
    });

    // The day is already taken by it, which is what keeps this one from being raced.
    it('counts an event already raced on the same day', () => {
      const held = calendarEvent({ clash: true });
      const raced = calendarEvent({ series: 'gt', status: 'raced' });

      expect(clashingWith([held, raced], held)).toEqual([raced]);
    });
  });

  describe('seasonProgress', () => {
    it('says how far through each championship the player is and where they stand', () => {
      const [career, calendar] = careerWith(entered());

      expect(seasonProgress(career, calendar)).toEqual([{
        series: 'cup',
        entry: 'main',
        name: 'Sunday Cup',
        className: null,
        ladder: { discipline: Discipline.TOURING, tier: 4 },
        marks: ['raced', 'next', 'later'],
        position: 2,
        field: 2,
        points: 18,
        next: event('r2', 'scheduled'),
      }]);
    });

    it('marks a missed round apart from a raced one', () => {
      const [career, calendar] = careerWith(entered({
        events: [event('r1', 'missed'), event('r2', 'raced'), event('r3', 'scheduled')],
      }));

      expect(seasonProgress(career, calendar)[0].marks).toEqual(['missed', 'raced', 'next']);
    });

    it('names the class only in a championship of several', () => {
      const championship = {
        name: 'Endurance',
        entries: [
          { id: 'pro', name: 'Pro', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 } },
          { id: 'main', name: 'Am', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } },
        ],
      } as unknown as Championship;
      const [career, calendar] = careerWith(entered({ championship }));

      expect(seasonProgress(career, calendar)[0]).toMatchObject({
        className: 'Am', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      });
    });

    it('gives no position before anything is raced, and no next round once the season is done', () => {
      const [before, calendar] = careerWith(entered({
        events: [event('r1', 'scheduled')],
      }));
      const [after] = careerWith(entered({
        events: [event('r1', 'raced')],
      }));

      expect(seasonProgress(before, calendar)[0].position).toBeNull();
      expect(seasonProgress(after, calendar)[0]).toMatchObject({ marks: ['raced'], next: null });
    });

    it('leaves out a championship the career withdrew from', () => {
      const [career, calendar] = careerWith(entered(), entered({ series: 'gone', withdrawn: true }));

      expect(seasonProgress(career, calendar).map((one) => one.series)).toEqual(['cup']);
    });

    // Found in review: the stand-in who raced the player's seat has a row under
    // the same seat id, and when it ranked higher Home showed its place and
    // points as the player's - and counted it as one more driver in the field.
    it('reads the player\'s own row and field, never the stand-in\'s in their seat', () => {
      const [career, calendar] = careerWith(entered({
        standings: {
          classes: [{
            entry: 'main',
            drivers: [row('ai', 1, 40), row('me', 2, 30, true), row('me', 3, 4)],
          }],
        } as unknown as SeasonEntry['standings'],
      }));

      expect(seasonProgress(career, calendar)[0]).toMatchObject({ position: 3, points: 4, field: 2 });
    });
  });
});
