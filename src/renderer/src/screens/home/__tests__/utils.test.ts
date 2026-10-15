import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type {
  CalendarEntry, Career, CareerCalendar, CareerSeason, Championship, DriverStanding, SeasonEntry, SeasonEvent,
} from '../../../../../shared/types';
import { HISTORIC_BEHIND, HISTORIC_SHOWN } from '../constants.ts';
import {
  clashingWith, editionAhead, racedLastSeason, recentlyFinished, seasonProgress, stripRows, upcomingEvent,
} from '../utils.ts';
import { makeSeries } from '@/lib/season-results/__tests__/fixtures.ts';
import type { HistoricRow } from '@/lib/season-review';

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
  edition: 0,
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
  {
    date: '2026-03-01',
    seasons: [{
      index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries,
    }],
  } as unknown as Career,
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
        season: 0,
        edition: 0,
        editions: 1,
        year: 2026,
        over: false,
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

    it('says an edition is over once every round has run, and names the edition', () => {
      const [career, calendar] = careerWith(entered({
        edition: 2,
        events: [event('r1', 'raced'), event('r2', 'raced'), event('r3', 'missed')],
      }));

      expect(seasonProgress(career, calendar)[0]).toMatchObject({ edition: 2, over: true, next: null });
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

    // A historic event is a season entry too, with a strip of its own on Home.
    it("leaves out the season's historic events", () => {
      const [career, calendar] = careerWith(entered(), entered({ series: 'british-gp', historic: true }));

      expect(seasonProgress(career, calendar).map((one) => one.series)).toEqual(['cup']);
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

  describe('recentlyFinished', () => {
    /**
     * A season holding the entries given.
     * @param entries Its entries
     * @returns The season
     */
    const season = (...entries: SeasonEntry[]): CareerSeason => ({
      index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries,
    });
    // A whole championship, since an announcement reads the edition's review.
    // Its last round is r3, on 1 March.
    const over = entered({
      championship: makeSeries(), events: [event('r1', 'raced'), event('r2', 'raced'), event('r3', 'raced')],
    });

    it('announces an edition whose last round ran within the fortnight', () => {
      expect(recentlyFinished(season(over), '2026-03-10').map((one) => one.series)).toEqual(['cup']);
    });

    it('stops announcing it once a fortnight has gone by', () => {
      expect(recentlyFinished(season(over), '2026-03-16')).toEqual([]);
    });

    it('announces nothing still running, nor an edition the career pulled out of', () => {
      expect(recentlyFinished(season(entered()), '2026-03-10')).toEqual([]);
      expect(recentlyFinished(season({ ...over, withdrawn: true }), '2026-03-10')).toEqual([]);
    });

    it('announces no historic event, however lately it ran', () => {
      expect(recentlyFinished(season({ ...over, series: 'british-gp', historic: true }), '2026-03-10')).toEqual([]);
    });

    it('announces the latest to finish first', () => {
      const earlier = entered({
        series: 'early-cup', championship: makeSeries(), events: [{ ...event('r1', 'raced'), date: '2026-02-25' }],
      });

      expect(recentlyFinished(season(earlier, over), '2026-03-02').map((one) => one.series))
        .toEqual(['cup', 'early-cup']);
    });
  });

  describe('racedLastSeason', () => {
    it('lists each championship and class raced once, by its latest edition', () => {
      const spring = entered({ edition: 0, events: [event('r1', 'raced')] });
      const autumn = entered({ edition: 3, events: [event('r9', 'raced')] });
      const other = entered({ series: 'other-cup', events: [event('r5', 'raced')] });
      const season: CareerSeason = {
        index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries: [autumn, other, spring],
      };

      expect(racedLastSeason(season)).toEqual([other, autumn]);
    });

    // Entering a historic event again is not a thing: the next season draws its own.
    it("leaves out the season's historic events", () => {
      const raced = entered({ events: [event('r1', 'raced')] });
      const drawn = entered({ series: 'british-gp', historic: true, events: [event('r2', 'raced')] });
      const season: CareerSeason = {
        index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries: [drawn, raced],
      };

      expect(racedLastSeason(season)).toEqual([raced]);
    });
  });

  describe('editionAhead', () => {
    const quarters = [
      calendarEvent({ edition: 0, date: '2027-01-10' }),
      calendarEvent({ edition: 0, round: 'r2', date: '2027-03-14' }),
      calendarEvent({ edition: 1, date: '2027-04-11' }),
      calendarEvent({ edition: 1, round: 'r2', date: '2027-06-13' }),
    ];

    it('offers the first edition while its rounds are still to come', () => {
      expect(editionAhead(quarters, 'cup', '2027-01-01')).toEqual({ edition: 0, opens: '2027-01-10' });
    });

    // Guards a bug: the first edition was offered all year, opening a page on
    // an edition already over with nothing left to enter.
    it('passes an edition already over for the next one still to come', () => {
      expect(editionAhead(quarters, 'cup', '2027-03-20')).toEqual({ edition: 1, opens: '2027-04-11' });
    });

    it('says when the edition offered opened, though it is already under way', () => {
      expect(editionAhead(quarters, 'cup', '2027-05-01')).toEqual({ edition: 1, opens: '2027-04-11' });
    });

    it('offers nothing once every edition of the season is behind the clock', () => {
      expect(editionAhead(quarters, 'cup', '2027-07-01')).toBeNull();
      expect(editionAhead(quarters, 'other-cup', '2027-01-01')).toBeNull();
    });
  });

  describe('stripRows', () => {
    // Twelve historic events, one on the first of each month.
    const year = Array.from({ length: 12 }, (unused, at) => ({
      series: `h${at}`, date: `2026-${String(at + 1).padStart(2, '0')}-01`,
    }) as HistoricRow);
    const ids = (rows: readonly HistoricRow[]): string[] => rows.map((one) => one.series);

    it('shows a few behind the clock and the rest of the strip ahead of it', () => {
      const shown = stripRows(year, '2026-06-15');

      expect(shown).toHaveLength(HISTORIC_SHOWN);
      expect(shown.filter((one) => one.date < '2026-06-15')).toHaveLength(HISTORIC_BEHIND);
      expect(ids(shown)[HISTORIC_BEHIND]).toBe('h6');
    });

    it('counts an event on the day of the clock as still ahead', () => {
      expect(ids(stripRows(year, '2026-07-01'))[HISTORIC_BEHIND]).toBe('h6');
    });

    it('starts at the first at the start of the season', () => {
      expect(ids(stripRows(year, '2026-01-01'))).toEqual(ids(year.slice(0, HISTORIC_SHOWN)));
    });

    // Near the end of the season there are too few ahead to fill the strip, so
    // it shows more of what is behind instead of running short.
    it('fills the strip from behind the clock when little is left ahead', () => {
      expect(ids(stripRows(year, '2026-12-01'))).toEqual(ids(year.slice(-HISTORIC_SHOWN)));
      expect(ids(stripRows(year, '2027-01-01'))).toEqual(ids(year.slice(-HISTORIC_SHOWN)));
    });

    it('shows every one of a season that drew fewer than the strip holds', () => {
      expect(ids(stripRows(year.slice(0, 3), '2026-02-15'))).toEqual(['h0', 'h1', 'h2']);
      expect(stripRows([], '2026-02-15')).toEqual([]);
    });
  });
});
