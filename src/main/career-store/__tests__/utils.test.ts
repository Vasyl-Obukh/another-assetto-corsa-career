import { describe, expect, it, jest } from '@jest/globals';

import { addDays } from '../../../core/season-calendar/index.ts';
import {
  Climate, Discipline, Hemisphere, Weekday,
} from '../../../shared/types/index.ts';
import type {
  CareerSeason,
  LaunchRecord,
  RacePlace,
  RoundForecast,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeriesSession,
  SessionForecast,
} from '../../../shared/types/index.ts';
import {
  advanceSkips,
  advanceStop,
  calendarEntry,
  clockTime,
  composeCalendar,
  currentSeason,
  enteredEvent,
  eventName,
  eventSessions,
  inProgressEvent,
  issueForecast,
  issueForecasts,
  launchBlock,
  launchSkips,
  markMissed,
  materialiseEvents,
  readCareer,
  scheduledEvents,
  seasonEndDate,
  seasonSalt,
  simulatedEvent,
  skippedRound,
  withSeason,
} from '../utils.ts';
import {
  makeAvailability,
  makeCareer,
  makeChampionship,
  makeClassEntry,
  makeEntry,
  makeEvent,
  makeListing,
  makePlan,
  makeRound,
  makeSeason,
} from './fixtures.ts';

/**
 * A career with one season, one entry and one dated event in it.
 * @returns The career, whole enough for readCareer to accept
 */
const wholeCareer = () => makeCareer({
  seasons: [makeSeason({
    entries: [makeEntry({ events: [makeEvent('one', '2026-03-01')] })],
  })],
});

/**
 * Whether an ISO date falls on a Sunday, which is what a race day is.
 * @param date An ISO YYYY-MM-DD date
 * @returns True when it is a Sunday
 */
const isSunday = (date: string): boolean => new Date(`${date}T00:00:00Z`).getUTCDay() === 0;

/**
 * A record of one launch having run.
 * @param index Which launch it records
 * @param classification Car indices in the order it classified them
 * @returns The record
 */
const makeRecord = (index: number, classification: number[] | null = null): LaunchRecord => ({
  index,
  completedAt: '2026-03-08T16:00:00.000Z',
  archive: `${index}.json`,
  gridOrder: [0, 1, 2, 3],
  classification,
});

describe('main/career-store/utils', () => {
  describe('readCareer', () => {
    it('accepts a career this build wrote', () => {
      const career = wholeCareer();

      expect(readCareer(career)).toBe(career);
    });

    it('refuses anything that is not an object', () => {
      expect(readCareer(null)).toBeNull();
      expect(readCareer('career')).toBeNull();
      expect(readCareer(42)).toBeNull();
      expect(readCareer(undefined)).toBeNull();
    });

    it('refuses a career written against another revision of the format', () => {
      expect(readCareer({ ...wholeCareer(), version: 2 })).toBeNull();
    });

    it('refuses a career missing anything the clock is read from', () => {
      expect(readCareer({ ...wholeCareer(), id: undefined })).toBeNull();
      expect(readCareer({ ...wholeCareer(), date: undefined })).toBeNull();
      expect(readCareer({ ...wholeCareer(), startDate: undefined })).toBeNull();
    });

    // typeof null is "object", so a level of null has to be refused by name or
    // it reads as a whole record of discipline levels.
    it('refuses a career whose ladder levels are missing or null', () => {
      expect(readCareer({ ...wholeCareer(), level: undefined })).toBeNull();
      expect(readCareer({ ...wholeCareer(), level: null })).toBeNull();
    });

    it('refuses a career whose seasons are not a list', () => {
      expect(readCareer({ ...wholeCareer(), seasons: undefined })).toBeNull();
      expect(readCareer({ ...wholeCareer(), seasons: {} })).toBeNull();
    });

    it('refuses a season whose entries are not a list', () => {
      const season = { ...makeSeason(), entries: undefined } as unknown as CareerSeason;

      expect(readCareer(makeCareer({ seasons: [season] }))).toBeNull();
    });

    // Checked at load rather than the first time a round is opened, which is
    // where a half-understood file would otherwise fail.
    it('refuses an entry carrying no championship of its own', () => {
      const entry = { ...makeEntry(), championship: undefined } as unknown as SeasonEntry;

      expect(readCareer(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
      expect(readCareer(makeCareer({
        seasons: [makeSeason({
          entries: [{ ...makeEntry(), championship: null } as unknown as SeasonEntry],
        })],
      }))).toBeNull();
    });

    it('refuses an entry whose events are not a list', () => {
      const entry = { ...makeEntry(), events: undefined } as unknown as SeasonEntry;

      expect(readCareer(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    it('refuses an event carrying no session records', () => {
      const event = {
        ...makeEvent('one', '2026-03-01'), sessions: undefined,
      } as unknown as SeasonEvent;
      const entry = makeEntry({ events: [event] });

      expect(readCareer(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    // A career written while an event spanned several days dates its events
    // with firstDay and lastDay, and its championships' formats under another
    // name - quarantined at load rather than failing on the first sort.
    it('refuses an event with no day to race on', () => {
      const event = {
        ...makeEvent('one', '2026-03-01'), date: undefined, firstDay: '2026-02-27',
      } as unknown as SeasonEvent;
      const entry = makeEntry({ events: [event] });

      expect(readCareer(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    it('refuses an entry whose championship holds no event formats', () => {
      const { eventFormats: unused, ...championship } = makeChampionship();
      const entry = makeEntry({ championship: championship as unknown as SeasonEntry['championship'] });

      expect(readCareer(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    it('accepts a career that has entered nothing yet', () => {
      const career = makeCareer({ seasons: [makeSeason()] });

      expect(readCareer(career)).toBe(career);
    });
  });

  describe('seasonEndDate', () => {
    it('closes a season fifty-two weeks after the day it opens', () => {
      expect(seasonEndDate('2026-01-04')).toBe('2027-01-02');
    });

    // Fifty-two weeks is a whole number of them, so the season after opens on
    // the same weekday however the calendar year falls.
    it('leaves the season after it opening on the same weekday', () => {
      expect(isSunday('2026-01-04')).toBe(true);
      expect(isSunday(addDays(seasonEndDate('2026-01-04'), 1))).toBe(true);
    });

    it('counts days rather than calendar years across a leap year', () => {
      expect(seasonEndDate('2024-01-07')).toBe('2025-01-04');
    });
  });

  describe('currentSeason', () => {
    it('reads the season a career is in as its last', () => {
      const first = makeSeason({ index: 0 });
      const second = makeSeason({ index: 1, startDate: '2027-01-03' });

      expect(currentSeason(makeCareer({ seasons: [first, second] }))).toBe(second);
    });

    it('reads nothing from a career with no season yet', () => {
      expect(currentSeason(makeCareer())).toBeNull();
    });
  });

  describe('materialiseEvents', () => {
    const season = makeSeason();

    it('dates every round on the day of the week its championship races', () => {
      const events = materialiseEvents(makeChampionship({ raceWeekday: Weekday.SUNDAY }), season, season.startDate);

      expect(events).toHaveLength(2);
      expect(events.every((event) => isSunday(event.date))).toBe(true);
      expect(events[0].date < events[1].date).toBe(true);
    });

    it('carries the race id each round archives its results under', () => {
      const events = materialiseEvents(makeChampionship(), season, season.startDate);

      expect(events.map((event) => event.raceId)).toEqual(['test-cup/one', 'test-cup/two']);
    });

    it('holds the whole calendar inside the career year it is entered in', () => {
      const events = materialiseEvents(makeChampionship(), season, season.startDate);

      expect(events[0].date >= season.startDate).toBe(true);
      expect(events[1].date <= seasonEndDate(season.startDate)).toBe(true);
    });

    it('records a round whose day has already gone by as missed', () => {
      const dated = materialiseEvents(makeChampionship(), season, season.startDate);
      const events = materialiseEvents(
        makeChampionship(), season, addDays(dated[0].date, 1),
      );

      expect(events.map((event) => event.status)).toEqual(['missed', 'scheduled']);
    });

    it('records every round as missed for a season already over', () => {
      const events = materialiseEvents(makeChampionship(), season, '2099-01-01');

      expect(events.map((event) => event.status)).toEqual(['missed', 'missed']);
    });

    it('takes a round entry fee over the championship-wide one', () => {
      const series = makeChampionship({
        entryFee: 500,
        rounds: [makeRound('one'), makeRound('two', { entryFee: 750 })],
      });

      expect(materialiseEvents(series, season, season.startDate).map((one) => one.entryFee))
        .toEqual([500, 750]);
    });

    // The offset is seeded off the championship's id, so the forecast shown and
    // the season entered have to be one draw however often it is asked for.
    it('dates a championship identically every time it is asked', () => {
      const series = makeChampionship();

      expect(materialiseEvents(series, season, season.startDate))
        .toEqual(materialiseEvents(series, season, season.startDate));
    });

    it('opens two championships on different days', () => {
      const one = materialiseEvents(makeChampionship({ id: 'alpha-cup' }), season, '2026-01-04');
      const two = materialiseEvents(makeChampionship({ id: 'zebra-trophy' }), season, '2026-01-04');

      expect(one[0].date).not.toBe(two[0].date);
    });
  });

  describe('scheduledEvents', () => {
    it('returns only the events still to be raced', () => {
      const entry = makeEntry({
        events: [
          makeEvent('one', '2026-03-01', { status: 'raced' }),
          makeEvent('two', '2026-04-05'),
          makeEvent('three', '2026-05-03', { status: 'missed' }),
        ],
      });

      expect(scheduledEvents(makeSeason({ entries: [entry] })).map(({ event }) => event.round))
        .toEqual(['two']);
    });

    it('leaves out a championship the career pulled out of', () => {
      const raced = makeEntry({ series: 'other-cup', events: [makeEvent('x', '2026-03-01')], withdrawn: true });
      const kept = makeEntry({ events: [makeEvent('one', '2026-04-05')] });

      expect(scheduledEvents(makeSeason({ entries: [raced, kept] })).map(({ event }) => event.round))
        .toEqual(['one']);
    });

    it('orders events of different championships earliest first', () => {
      const late = makeEntry({ series: 'late-cup', events: [makeEvent('late', '2026-06-07')] });
      const early = makeEntry({ series: 'early-cup', events: [makeEvent('early', '2026-02-01')] });

      expect(scheduledEvents(makeSeason({ entries: [late, early] })).map(({ event }) => event.round))
        .toEqual(['early', 'late']);
    });

    it('carries the entry each event belongs to', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-04-05')] });

      expect(scheduledEvents(makeSeason({ entries: [entry] }))[0].entry).toBe(entry);
    });
  });

  describe('advanceStop', () => {
    const season = makeSeason({
      entries: [makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      })],
    });

    it('stops on the day of the first enrolled event on the way', () => {
      expect(advanceStop(season, '2026-01-04', '2026-06-07')).toBe('2026-03-01');
    });

    it('moves the whole way when nothing entered is on the way', () => {
      expect(advanceStop(season, '2026-01-04', '2026-02-01')).toBe('2026-02-01');
    });

    it('stops at an event on the day asked for', () => {
      expect(advanceStop(season, '2026-01-04', '2026-03-01')).toBe('2026-03-01');
    });

    // Otherwise the clock could never leave the event it is standing in.
    it('does not stop again at the event on the day the clock stands at', () => {
      expect(advanceStop(season, '2026-03-01', '2026-04-05')).toBe('2026-04-05');
    });

    it('ignores an event that has already been raced', () => {
      const raced = makeSeason({
        entries: [makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] })],
      });

      expect(advanceStop(raced, '2026-01-04', '2026-06-07')).toBe('2026-06-07');
    });

    it('moves the whole way when there is no season at all', () => {
      expect(advanceStop(null, '2026-01-04', '2026-06-07')).toBe('2026-06-07');
    });
  });

  describe('seasonSalt', () => {
    it('salts each season of each career differently', () => {
      const career = makeCareer();
      const other = { ...career, id: 'another-career' };

      expect(seasonSalt(career, 0)).not.toBe(seasonSalt(career, 1));
      expect(seasonSalt(career, 0)).not.toBe(seasonSalt(other, 0));
    });

    it('is the same salt every time it is asked for one season', () => {
      expect(seasonSalt(makeCareer(), 2)).toBe(seasonSalt(makeCareer(), 2));
    });
  });

  describe('issueForecast', () => {
    const GENERATED = makeChampionship({ generatedWeather: { climate: Climate.OCEANIC } });
    const CLOCK = '2026-03-01';

    it('draws an event the clock has come within a week of', () => {
      const issued = issueForecast(makeCareer(), 0, GENERATED, makeEvent('one', addDays(CLOCK, 7)), CLOCK);

      expect(issued.forecast).toMatchObject({ series: 'test-cup', round: 'one', climate: Climate.OCEANIC });
      expect(issued.forecast?.sessions).toHaveLength(3);
    });

    it('leaves an event further out than a week undrawn', () => {
      const event = makeEvent('one', addDays(CLOCK, 8));

      expect(issueForecast(makeCareer(), 0, GENERATED, event, CLOCK)).toBe(event);
    });

    it('never redraws a forecast already issued', () => {
      const event = issueForecast(makeCareer(), 0, GENERATED, makeEvent('one', CLOCK), CLOCK);

      expect(issueForecast(makeCareer({ id: 'career-2' }), 1, GENERATED, event, CLOCK)).toBe(event);
    });

    it('draws an event the clock has already passed, so it shows the weather it had', () => {
      const event = makeEvent('one', '2026-02-01', { status: 'missed' });

      expect(issueForecast(makeCareer(), 0, GENERATED, event, CLOCK).forecast).toBeDefined();
    });

    it('draws nothing for a championship that authors its weather', () => {
      const event = makeEvent('one', CLOCK);

      expect(issueForecast(makeCareer(), 0, makeChampionship(), event, CLOCK)).toBe(event);
    });

    it('draws nothing for a round the championship no longer has', () => {
      const event = makeEvent('gone', CLOCK);

      expect(issueForecast(makeCareer(), 0, GENERATED, event, CLOCK)).toBe(event);
    });

    it('draws each career and each season its own weather', () => {
      const draw = (career: string, season: number): string => JSON.stringify(
        issueForecast(makeCareer({ id: career }), season, GENERATED, makeEvent('one', CLOCK), CLOCK)
          .forecast,
      );

      expect(draw('career-1', 0)).toBe(draw('career-1', 0));
      expect(draw('career-1', 0)).not.toBe(draw('career-2', 0));
      expect(draw('career-1', 0)).not.toBe(draw('career-1', 1));
    });

    it('draws a southern round for its own season', () => {
      const south = makeChampionship({
        generatedWeather: { climate: Climate.OCEANIC, hemisphere: Hemisphere.SOUTH },
      });
      const ambientOf = (series: typeof south): number | undefined => (
        issueForecast(makeCareer(), 0, series, makeEvent('one', '2026-01-16'), '2026-01-16')
          .forecast?.sessions[0].ambient
      );

      // January is midsummer in the south, and the swing is several degrees.
      expect(ambientOf(south)).toBeGreaterThan(ambientOf(GENERATED) ?? Infinity);
    });
  });

  describe('issueForecasts', () => {
    it('draws every event of every entry that is close enough, and no other', () => {
      const championship = makeChampionship({ generatedWeather: { climate: Climate.OCEANIC } });
      const season = makeSeason({
        entries: [makeEntry({
          championship,
          events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-04-05')],
        })],
      });

      const issued = issueForecasts(makeCareer(), season, '2026-02-25');

      expect(issued.entries[0].events.map((event) => event.forecast !== undefined))
        .toEqual([true, false]);
    });
  });

  describe('withSeason', () => {
    it('replaces the season with the same index and leaves the rest alone', () => {
      const first = makeSeason({ index: 0 });
      const second = makeSeason({ index: 1, startDate: '2027-01-03' });
      const replaced = makeSeason({ index: 1, startDate: '2027-01-10' });

      expect(withSeason(makeCareer({ seasons: [first, second] }), replaced).seasons)
        .toEqual([first, replaced]);
    });
  });

  describe('enteredEvent', () => {
    const event = makeEvent('one', '2026-03-01');
    const entry = makeEntry({ events: [event, makeEvent('two', '2026-05-03')] });
    const season = makeSeason({ entries: [entry] });

    it('finds the entry and the round by their ids', () => {
      expect(enteredEvent(season, 'test-cup', 'one')).toEqual({ entry, event });
    });

    it('finds nothing in a championship the career never entered', () => {
      expect(enteredEvent(season, 'other-cup', 'one')).toBeNull();
    });

    it('finds nothing in a championship the career pulled out of', () => {
      const gone = makeSeason({ entries: [makeEntry({ events: [event], withdrawn: true })] });

      expect(enteredEvent(gone, 'test-cup', 'one')).toBeNull();
    });

    it('finds nothing for a round that championship does not run', () => {
      expect(enteredEvent(season, 'test-cup', 'three')).toBeNull();
    });
  });

  describe('inProgressEvent', () => {
    it('finds the event that has sessions recorded against it', () => {
      const started = makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] });
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01'), started] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))?.event).toBe(started);
    });

    it('finds nothing when no event has been started', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))).toBeNull();
    });

    // An event that has been scored is over, whatever it left behind.
    it('ignores the records of an event that is already raced', () => {
      const done = makeEvent('one', '2026-03-01', { status: 'raced', sessions: [makeRecord(0)] });
      const entry = makeEntry({ events: [done] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))).toBeNull();
    });
  });

  describe('eventName', () => {
    it('names the championship and the round it belongs to', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

      expect(eventName({ entry, event: entry.events[0] })).toBe('Test Cup - Round one');
    });

    it('falls back to the round id when the championship no longer runs it', () => {
      const entry = makeEntry({ events: [makeEvent('bygone', '2026-03-01')] });

      expect(eventName({ entry, event: entry.events[0] })).toBe('Test Cup - bygone');
    });
  });

  describe('launchBlock', () => {
    /**
     * A season holding one championship over the events given.
     * @param events The dated events, in calendar order
     * @returns The season and the entry inside it
     */
    const seasonOf = (events: readonly SeasonEvent[]) => {
      const entry = makeEntry({ events });

      return { entry, season: makeSeason({ entries: [entry] }) };
    };

    it('allows the next session of an event nothing stands in the way of', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    it('refuses an event that has already been raced or passed', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01', { status: 'missed' })]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)?.code)
        .toBe('career.event.closed');
    });

    it('refuses a round the installed content cannot race', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, false, false)?.code)
        .toBe('series.round.unavailable');
    });

    it('allows the event that is itself part-way through', () => {
      const { entry, season } = seasonOf([
        makeEvent('one', '2026-03-01', { sessions: [makeRecord(0)] }),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    // Racing one event of a day gives up the rest of it, so one entered after
    // the day was already raced cannot be driven as well.
    it('refuses an event on a day the career has already raced', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01', { status: 'raced' })],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toMatchObject({
        code: 'career.event.sameDay', params: { event: 'Other Cup - Round one' },
      });
    });

    it('allows an event on a raced day while two events on one day are allowed', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01', { status: 'raced' })],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, true)).toBeNull();
    });

    it('ignores a day raced in a championship the career left', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const left = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01', { status: 'raced' })],
        withdrawn: true,
      });
      const season = makeSeason({ entries: [entry, left] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    // The checks are ordered so the button and the command always agree on
    // which refusal to say first.
    it('says an event is over before it says anything else about it', () => {
      const { entry, season } = seasonOf([
        makeEvent('one', '2026-03-01'),
        makeEvent('two', '2026-05-03', { status: 'raced' }),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[1] }, false, false)?.code)
        .toBe('career.event.closed');
    });
  });

  describe('skippedRound', () => {
    it('names and numbers the round, dated as the season holds it', () => {
      const event = makeEvent('two', '2026-05-03');

      expect(skippedRound(makeChampionship(), 'main', event, 'skipped')).toEqual({
        series: 'test-cup',
        seriesName: 'Test Cup',
        round: 'two',
        roundName: 'Round two',
        number: 2,
        ladder: { discipline: Discipline.ROAD, tier: 4 },
        date: '2026-05-03',
        reason: 'skipped',
      });
    });

    it('wears the ladder of the class the career is in', () => {
      const series = makeChampionship({
        entries: [
          makeClassEntry(),
          makeClassEntry({ id: 'pro', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 } }),
        ],
      });

      expect(skippedRound(series, 'pro', makeEvent('one', '2026-03-01'), 'behind').ladder)
        .toEqual({ discipline: Discipline.SPORTSCAR, tier: 2 });
    });

    it('falls back to the round id for a round the championship no longer runs', () => {
      const lost = skippedRound(makeChampionship(), 'main', makeEvent('bygone', '2026-03-01'), 'clash');

      expect(lost.roundName).toBe('bygone');
      expect(lost.number).toBe(0);
    });
  });

  describe('advanceSkips', () => {
    const entry = makeEntry({
      events: [
        makeEvent('one', '2026-03-01'),
        makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] }),
      ],
    });
    const season = makeSeason({ entries: [entry] });

    it('lists every event of the career\'s over by the date', () => {
      expect(advanceSkips(season, '2026-06-01').map((one) => [one.round, one.reason]))
        .toEqual([['one', 'skipped'], ['two', 'partway']]);
    });

    it('costs nothing for an event on the date itself', () => {
      expect(advanceSkips(season, '2026-03-01')).toEqual([]);
    });

    it('leaves out what is already raced and what was given up', () => {
      const withdrawn = makeEntry({ withdrawn: true, events: [makeEvent('one', '2026-03-01')] });
      const raced = makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] });

      expect(advanceSkips(makeSeason({ entries: [withdrawn, raced] }), '2026-06-01')).toEqual([]);
    });
  });

  describe('launchSkips', () => {
    it('loses every earlier event still unraced', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });

      expect(launchSkips(season, { entry, event: entry.events[1] }, false).map((one) => [one.round, one.reason]))
        .toEqual([['one', 'skipped']]);
    });

    it('loses an event left part-way, even one later than this', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] })],
      });
      const season = makeSeason({ entries: [entry] });

      expect(launchSkips(season, { entry, event: entry.events[0] }, false).map((one) => [one.round, one.reason]))
        .toEqual([['two', 'partway']]);
    });

    it('loses an event on the same day as a clash', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchSkips(season, { entry, event: entry.events[0] }, false).map((one) => [one.series, one.reason]))
        .toEqual([['other-cup', 'clash']]);
    });

    it('leaves an event on the same day alone while two on one day are allowed', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchSkips(season, { entry, event: entry.events[0] }, true)).toEqual([]);
    });

    it('costs nothing for an event raced in its turn', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });

      expect(launchSkips(makeSeason({ entries: [entry] }), { entry, event: entry.events[0] }, false)).toEqual([]);
    });
  });

  describe('markMissed', () => {
    it('marks the rounds listed as non-starts and leaves the rest', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });
      const marked = markMissed(season, [skippedRound(entry.championship, 'main', entry.events[0], 'skipped')]);

      expect(marked.entries[0].events.map((one) => one.status)).toEqual(['missed', 'scheduled']);
    });

    it('touches only scheduled rounds, never one already raced', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] });
      const season = makeSeason({ entries: [entry] });
      const marked = markMissed(season, [skippedRound(entry.championship, 'main', entry.events[0], 'skipped')]);

      expect(marked.entries[0].events[0].status).toBe('raced');
    });

    it('leaves a withdrawn entry as it is', () => {
      const entry = makeEntry({ withdrawn: true, events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [entry] });

      expect(markMissed(season, [skippedRound(entry.championship, 'main', entry.events[0], 'skipped')]).entries[0])
        .toBe(entry);
    });

    it('matches on the championship as well as the round', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [entry] });
      const elsewhere = { ...skippedRound(entry.championship, 'main', entry.events[0], 'skipped'), series: 'other-cup' };

      expect(markMissed(season, [elsewhere]).entries[0].events[0].status).toBe('scheduled');
    });
  });

  describe('clockTime', () => {
    it('says nothing when the event does not say when a session starts', () => {
      expect(clockTime(undefined)).toBeNull();
    });

    it('passes a time the event already wrote as "HH:MM" through', () => {
      expect(clockTime('08:45')).toBe('08:45');
    });

    it('writes a whole number of hours as a clock time', () => {
      expect(clockTime(14)).toBe('14:00');
    });

    it('writes a half hour as thirty minutes past', () => {
      expect(clockTime(14.5)).toBe('14:30');
    });

    it('pads an hour before ten to two digits', () => {
      expect(clockTime(9.25)).toBe('09:15');
      expect(clockTime(0)).toBe('00:00');
    });

    it('wraps midnight round to the start of the day', () => {
      expect(clockTime(24)).toBe('00:00');
    });
  });

  describe('eventSessions', () => {
    const SESSIONS: SeriesSession[] = [
      { type: 'practice', name: 'Practice', minutes: 30 },
      {
        type: 'qualify', id: 'q', name: 'Qualifying', minutes: 15, day: 1,
      },
      {
        type: 'race',
        name: 'Race',
        laps: 78,
        day: 2,
        inherit: { from: 'q' },
        conditions: { timeOfDay: 14.5 },
      },
    ];

    // What the round states, before its distance was turned into laps.
    const STATED: SeriesSession[] = [
      SESSIONS[0],
      SESSIONS[1],
      {
        type: 'race', name: 'Race', day: 2, distance: 305, inherit: { from: 'q' },
      },
    ];


    /**
     * Runs eventSessions over the three-session event above.
     * @param records What has run so far
     * @param live Whether the career can still run this event
     * @param score What the event has paid, when it has been scored
     * @param forecast The round's generated weather, when it has one
     * @param pending Whether that weather is generated but not yet forecast
     * @returns The sessions as the event page would show them
     */
    const sessionsOf = (
      records: readonly LaunchRecord[],
      live = true,
      score: RoundScore | undefined = undefined,
      forecast: RoundForecast | null = null,
      pending = false,
    ) => eventSessions(
      makePlan(SESSIONS), STATED, records, forecast, pending, score, 'seat-2', live,
    );

    it('marks what has run, what runs next and what waits on it', () => {
      expect(sessionsOf([makeRecord(0)]).map((one) => one.status))
        .toEqual(['done', 'next', 'later']);
    });

    it('marks nothing next while the career cannot run the event', () => {
      expect(sessionsOf([makeRecord(0)], false).map((one) => one.status))
        .toEqual(['done', 'later', 'later']);
    });

    it('says which day of the event each session runs on', () => {
      expect(sessionsOf([]).map((one) => one.day)).toEqual([0, 1, 2]);
    });

    it('says when a session starts only where the event says so', () => {
      expect(sessionsOf([]).map((one) => one.startsAt)).toEqual([null, null, '14:30']);
    });

    it('names the session a race takes its grid from', () => {
      const sessions = sessionsOf([]);

      expect(sessions[0].inherit).toBeNull();
      expect(sessions[1].inherit).toBeNull();
      expect(sessions[2].inherit).toEqual({ from: 'Qualifying', reverse: undefined });
    });

    it('keeps the distance a race was stated as alongside its lap count', () => {
      const race = sessionsOf([])[2];

      expect(race.laps).toBe(78);
      expect(race.distance).toBe(305);
      expect(race.minutes).toBeUndefined();
    });

    it('measures a timed session in minutes rather than laps', () => {
      const practice = sessionsOf([])[0];

      expect(practice.minutes).toBe(30);
      expect(practice.laps).toBeUndefined();
    });

    it('says where the player starts only for the race that runs next', () => {
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0])]);

      expect(sessions.map((one) => one.status)).toEqual(['done', 'done', 'next']);
      expect(sessions[2].startSlot).toBe(4);
      expect(sessions[0].startSlot).toBeNull();
    });

    it('hands back the record of a session that has run', () => {
      const record = makeRecord(0);

      expect(sessionsOf([record])[0].record).toBe(record);
      expect(sessionsOf([record])[1].record).toBeNull();
    });

    it('carries the forecast drawn for each session', () => {
      const forecast: RoundForecast = {
        series: 'test-cup',
        round: 'one',
        climate: Climate.TEMPERATE,
        sessions: [{ index: 1, ambient: 18 } as SessionForecast],
      };
      const sessions = sessionsOf([], true, undefined, forecast);

      expect(sessions[1].forecast).toEqual({ index: 1, ambient: 18 });
      expect(sessions[0].forecast).toBeNull();
    });

    it('says on every session that a forecast is still to come', () => {
      expect(sessionsOf([], true, undefined, null, true).map((one) => one.pending))
        .toEqual([true, true, true]);
      expect(sessionsOf([]).map((one) => one.pending)).toEqual([false, false, false]);
    });

    it('carries what the player took from a race that has been scored', () => {
      const score: RoundScore = {
        round: 'one',
        recordedAt: '2026-03-08T16:00:00.000Z',
        races: [{
          launch: 2,
          session: null,
          name: 'Race',
          pointsSystem: 'standard',
          places: [
            { seat: 'seat-1', position: 1, points: 25 } as RacePlace,
            { seat: 'seat-2', position: 3, points: 15 } as RacePlace,
          ],
        }],
      };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1), makeRecord(2)], true, score);

      expect(sessions[2].place).toMatchObject({ seat: 'seat-2', position: 3 });
      expect(sessions[2].points).toEqual([{ position: 1, points: 25 }, { position: 3, points: 15 }]);
      expect(sessions[0].place).toBeNull();
      expect(sessions[0].points).toEqual([]);
    });

    it('hands the race\'s score to the race and nothing to any other session', () => {
      const score: RoundScore = {
        round: 'one',
        recordedAt: '2026-03-08T16:00:00.000Z',
        races: [{
          launch: 2, session: null, name: 'Race', pointsSystem: 'standard', places: [],
        }],
      };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1), makeRecord(2)], true, score);

      expect(sessions[2].score).toBe(score.races[0]);
      expect(sessions[1].score).toBeNull();
    });

    it('never calls a place the player\'s when the driver their seat names took it', () => {
      const score: RoundScore = {
        round: 'one',
        recordedAt: '2026-03-08T16:00:00.000Z',
        races: [{
          launch: 2,
          session: null,
          name: 'Race',
          pointsSystem: 'standard',
          places: [{
            seat: 'seat-2', position: 1, points: 25, substitute: true,
          } as RacePlace],
        }],
      };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1), makeRecord(2)], true, score);

      expect(sessions[2].place).toBeNull();
      expect(sessions[2].points).toEqual([{ position: 1, points: 25 }]);
    });

    it('starts a driven race in the order its qualifying set', () => {
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0]), makeRecord(2, [1, 2, 3, 0])]);

      expect(sessions[2].startOrder).toEqual([1, 2, 3, 0]);
    });

    // A simulated launch's car order is its grid already: no [CAR_n] list put
    // the player first.
    it('starts a simulated race in the order it records', () => {
      const simulated = { ...makeRecord(2, [3, 2, 1, 0]), gridOrder: [3, 1, 2, 0], skipped: true };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0]), simulated]);

      expect(sessions[2].startOrder).toEqual([3, 1, 2, 0]);
    });

    it('gives no start order to anything but a race that has run', () => {
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0])]);

      expect(sessions.map((one) => one.startOrder)).toEqual([null, null, null]);
    });
  });

  describe('calendarEntry', () => {
    const career = makeCareer();

    it('reads a round into the row the calendar shows', () => {
      const series = makeChampionship();
      const event = makeEvent('two', '2026-05-03');

      const row = calendarEntry(
        series, makeAvailability(series), series.entries[0], event, career, true,
      );

      expect(row).toMatchObject({
        series: 'test-cup',
        seriesName: 'Test Cup',
        entry: 'main',
        round: 'two',
        roundName: 'Round two',
        track: { id: 'track_two' },
        gridSize: 2,
        enrolled: true,
        eligible: true,
        raceable: true,
        clash: false,
      });
    });

    it('numbers a round by where it sits in the calendar', () => {
      const series = makeChampionship();
      const availability = makeAvailability(series);

      const numbers = series.rounds.map((round) => calendarEntry(
        series,
        availability,
        series.entries[0],
        makeEvent(round.id, '2026-05-03'),
        career,
        true,
      ).number);

      expect(numbers).toEqual([1, 2]);
    });

    // A round already raced must not disappear off the calendar because the
    // championship was edited under it.
    it('keeps a round the season copy no longer runs, under its own id', () => {
      const series = makeChampionship();
      const event = makeEvent('bygone', '2026-05-03');

      const row = calendarEntry(
        series, makeAvailability(series), series.entries[0], event, career, true,
      );

      expect(row.round).toBe('bygone');
      expect(row.roundName).toBe('bygone');
      expect(row.number).toBe(1);
      expect(row.track).toEqual({ id: '' });
      expect(row.races).toEqual([]);
      expect(row.raceable).toBe(false);
    });

    it('pays a class its own purse over the championship-wide one', () => {
      const entry = makeClassEntry({ prizes: { positions: [9000] } });
      const series = makeChampionship({ prizes: { positions: [100] }, entries: [entry] });

      const paid = calendarEntry(
        series,
        makeAvailability(series),
        entry,
        makeEvent('one', '2026-05-03'),
        career,
        true,
      );

      expect(paid.prize).toBe(9000);
    });

    it('pays the championship purse to a class stating none of its own', () => {
      const series = makeChampionship({ prizes: { positions: [100] } });

      const paid = calendarEntry(
        series,
        makeAvailability(series),
        series.entries[0],
        makeEvent('one', '2026-05-03'),
        career,
        true,
      );

      expect(paid.prize).toBe(100);
    });

    it('says when a class shares its calendar with another of the championship', () => {
      const single = makeChampionship();
      const multi = makeChampionship({
        entries: [makeClassEntry(), makeClassEntry({ id: 'second', name: 'Second' })],
      });
      const event = makeEvent('one', '2026-05-03');

      expect(calendarEntry(
        single, makeAvailability(single), single.entries[0], event, career, true,
      ).multiClass).toBe(false);
      expect(calendarEntry(
        multi, makeAvailability(multi), multi.entries[0], event, career, true,
      ).multiClass).toBe(true);
    });

    it('says a class above the career level is not one it may enter', () => {
      const entry = makeClassEntry({ ladder: { discipline: Discipline.ROAD, tier: 1 } });
      const series = makeChampionship({ entries: [entry] });

      expect(calendarEntry(
        series,
        makeAvailability(series),
        entry,
        makeEvent('one', '2026-05-03'),
        career,
        false,
      ).eligible).toBe(false);
    });
  });

  describe('composeCalendar', () => {
    it('draws a class the career entered from the season own copy of it', () => {
      const entered = makeChampionship({ name: 'Test Cup (as entered)' });
      const held = makeEntry({
        championship: entered, events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [held] });
      const library = [makeListing(makeChampionship({ name: 'Test Cup (edited since)' }))];

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        library,
        new Map([[held, makeAvailability(entered)]]),
        false,
      );

      expect(calendar.events).toHaveLength(1);
      expect(calendar.events[0]).toMatchObject({
        seriesName: 'Test Cup (as entered)', date: '2026-03-01', enrolled: true,
      });
    });

    it('draws a class the career did not enter from the library', () => {
      const season = makeSeason();
      const other = makeChampionship({ id: 'other-cup', name: 'Other Cup' });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [makeListing(other)], new Map(), false,
      );

      expect(calendar.events).toHaveLength(2);
      expect(calendar.events.every((event) => !event.enrolled)).toBe(true);
      expect(calendar.events.map((event) => event.round)).toEqual(['one', 'two']);
    });

    it('lists the other class of a championship the career is already in', () => {
      const series = makeChampionship({
        entries: [makeClassEntry(), makeClassEntry({ id: 'second', name: 'Second' })],
        rounds: [makeRound('one')],
      });
      const held = makeEntry({ championship: series, events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [held] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [makeListing(series)],
        new Map([[held, makeAvailability(series)]]),
        false,
      );

      expect(calendar.events.map((event) => [event.entry, event.enrolled]))
        .toEqual(expect.arrayContaining([['main', true], ['second', false]]));
      expect(calendar.events.filter((event) => event.entry === 'main')).toHaveLength(1);
    });

    it('reports the season it drew and the day the clock stands at', () => {
      const season = makeSeason({ index: 2 });
      const career = makeCareer({ date: '2026-06-07', seasons: [season] });

      expect(composeCalendar(career, season, [], new Map(), false)).toMatchObject({
        season: 2, from: '2026-01-04', to: '2027-01-02', date: '2026-06-07', events: [],
      });
    });

    it('orders events by day, then by championship name', () => {
      const zebra = makeEntry({
        series: 'zebra-cup',
        championship: makeChampionship({ id: 'zebra-cup', name: 'Zebra Cup' }),
        events: [makeEvent('one', '2026-05-03')],
      });
      const alpha = makeEntry({
        series: 'alpha-cup',
        championship: makeChampionship({ id: 'alpha-cup', name: 'Alpha Cup' }),
        events: [makeEvent('one', '2026-05-03'), makeEvent('two', '2026-02-01')],
      });
      const season = makeSeason({ entries: [zebra, alpha] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [zebra, makeAvailability(zebra.championship)],
          [alpha, makeAvailability(alpha.championship)],
        ]),
        false,
      );

      expect(calendar.events.map((event) => [event.date, event.seriesName])).toEqual([
        ['2026-02-01', 'Alpha Cup'],
        ['2026-05-03', 'Alpha Cup'],
        ['2026-05-03', 'Zebra Cup'],
      ]);
    });

    it('marks enrolled events on the same day as another', () => {
      const first = makeEntry({
        events: [makeEvent('one', '2026-06-07'), makeEvent('two', '2026-07-05')],
      });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07')],
      });
      const season = makeSeason({ entries: [first, second] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [first, makeAvailability(first.championship)],
          [second, makeAvailability(second.championship)],
        ]),
        false,
      );

      expect(calendar.events.map((event) => [event.series, event.round, event.clash])).toEqual([
        ['other-cup', 'one', true],
        ['test-cup', 'one', true],
        ['test-cup', 'two', false],
      ]);
    });

    // Once one of the two was given up there is nothing left to choose.
    it('does not mark a pair one of which was given up', () => {
      const first = makeEntry({ events: [makeEvent('one', '2026-06-07', { status: 'raced' })] });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07', { status: 'missed' })],
      });
      const season = makeSeason({ entries: [first, second] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [first, makeAvailability(first.championship)],
          [second, makeAvailability(second.championship)],
        ]),
        false,
      );

      expect(calendar.events.every((event) => !event.clash)).toBe(true);
    });

    it('marks nothing while two events on one day are allowed', () => {
      const first = makeEntry({ events: [makeEvent('one', '2026-06-07')] });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07')],
      });
      const season = makeSeason({ entries: [first, second] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [first, makeAvailability(first.championship)],
          [second, makeAvailability(second.championship)],
        ]),
        true,
      );

      expect(calendar.events.every((event) => !event.clash)).toBe(true);
    });

    // A season the career pulled out of is not one it can be double-booked
    // against, however its events fall.
    it('does not clash an event against a championship the career left', () => {
      const kept = makeEntry({ events: [makeEvent('one', '2026-06-07')] });
      const left = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07')],
        withdrawn: true,
      });
      const season = makeSeason({ entries: [kept, left] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [kept, makeAvailability(kept.championship)],
          [left, makeAvailability(left.championship)],
        ]),
        false,
      );

      expect(calendar.events.every((event) => !event.clash)).toBe(true);
    });

    it('leaves out an entry whose class the championship copy no longer holds', () => {
      const held = makeEntry({ entry: 'gone', events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [held] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([[held, makeAvailability(held.championship)]]),
        false,
      );

      expect(calendar.events).toEqual([]);
    });
  });

  describe('simulatedEvent', () => {
    const missed = makeEvent('one', '2026-03-01', { status: 'missed' });

    it('races a round behind the clock and pays it', () => {
      const event = simulatedEvent(makeChampionship(), missed, 'salt');

      expect(event.simulated).toBe(true);
      expect(event.sessions).toHaveLength(3);
      expect(event.score?.races[0].places.map((place) => place.seat).sort()).toEqual(['seat-1', 'seat-2']);
    });

    // Nobody is the player in a championship the career is not in, so no seat
    // is raced by a stand-in.
    it('marks no place as a substitute\'s', () => {
      const event = simulatedEvent(makeChampionship(), missed, 'salt');

      expect(event.score?.races.flatMap((race) => race.places).some((place) => place.substitute)).toBe(false);
    });

    it('comes out the same every time it is asked', () => {
      const once = simulatedEvent(makeChampionship(), missed, 'salt');
      const again = simulatedEvent(makeChampionship(), missed, 'salt');

      expect(again.sessions.map((one) => one.classification)).toEqual(once.sessions.map((one) => one.classification));
    });

    it('leaves a round still to come as it is', () => {
      const scheduled = makeEvent('one', '2026-03-01');

      expect(simulatedEvent(makeChampionship(), scheduled, 'salt')).toBe(scheduled);
    });

    it('leaves a round it cannot simulate as a plain non-start', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const unknown = makeEvent('bygone', '2026-03-01', { status: 'missed' });

      expect(simulatedEvent(makeChampionship(), unknown, 'salt')).toBe(unknown);
    });
  });
});
