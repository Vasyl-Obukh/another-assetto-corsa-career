import { describe, expect, it } from '@jest/globals';

import { addDays } from '../../../core/season-calendar/index.ts';
import { Climate, Discipline } from '../../../shared/types/index.ts';
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
  advanceStop,
  calendarEntry,
  clockTime,
  composeCalendar,
  currentSeason,
  enteredEvent,
  eventName,
  eventSessions,
  inProgressEvent,
  launchBlock,
  materialiseEvents,
  readCareer,
  scheduledEvents,
  seasonEndDate,
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
  WEEKEND_DAYS,
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

    it('dates every round of the championship on a Sunday', () => {
      const events = materialiseEvents(makeChampionship(), season, season.startDate);

      expect(events).toHaveLength(2);
      expect(events.every((event) => isSunday(event.raceDay))).toBe(true);
      expect(events[0].firstDay < events[1].firstDay).toBe(true);
    });

    it('carries the race id each round archives its results under', () => {
      const events = materialiseEvents(makeChampionship(), season, season.startDate);

      expect(events.map((event) => event.raceId)).toEqual(['test-cup/one', 'test-cup/two']);
    });

    it('holds the whole calendar inside the career year it is entered in', () => {
      const events = materialiseEvents(makeChampionship(), season, season.startDate);

      expect(events[0].firstDay >= season.startDate).toBe(true);
      expect(events[1].lastDay <= seasonEndDate(season.startDate)).toBe(true);
    });

    it('records a round whose weekend has already closed as missed', () => {
      const dated = materialiseEvents(makeChampionship(), season, season.startDate);
      const events = materialiseEvents(
        makeChampionship(), season, addDays(dated[0].lastDay, 1),
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

    it('opens two championships on different weekends', () => {
      const one = materialiseEvents(makeChampionship({ id: 'alpha-cup' }), season, '2026-01-04');
      const two = materialiseEvents(makeChampionship({ id: 'zebra-trophy' }), season, '2026-01-04');

      expect(one[0].firstDay).not.toBe(two[0].firstDay);
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

    it('orders weekends of different championships earliest first', () => {
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

    it('stops on the opening day of the first enrolled weekend on the way', () => {
      expect(advanceStop(season, '2026-01-04', '2026-06-07')).toBe('2026-03-01');
    });

    it('moves the whole way when nothing entered is on the way', () => {
      expect(advanceStop(season, '2026-01-04', '2026-02-01')).toBe('2026-02-01');
    });

    it('stops at a weekend opening on the day asked for', () => {
      expect(advanceStop(season, '2026-01-04', '2026-03-01')).toBe('2026-03-01');
    });

    // Otherwise the clock could never leave the weekend it is standing in.
    it('does not stop again at the weekend the clock already stands in', () => {
      expect(advanceStop(season, '2026-03-01', '2026-04-05')).toBe('2026-04-05');
    });

    it('ignores a weekend that has already been raced', () => {
      const raced = makeSeason({
        entries: [makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] })],
      });

      expect(advanceStop(raced, '2026-01-04', '2026-06-07')).toBe('2026-06-07');
    });

    it('moves the whole way when there is no season at all', () => {
      expect(advanceStop(null, '2026-01-04', '2026-06-07')).toBe('2026-06-07');
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
    it('finds the weekend that has sessions recorded against it', () => {
      const started = makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] });
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01'), started] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))?.event).toBe(started);
    });

    it('finds nothing when no weekend has been started', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))).toBeNull();
    });

    // A weekend that has been scored is over, whatever it left behind.
    it('ignores the records of a weekend that is already raced', () => {
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

    it('allows the next session of a weekend nothing stands in the way of', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    it('refuses a weekend that has already been raced or passed', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01', { status: 'missed' })]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)?.code)
        .toBe('career.event.closed');
    });

    it('refuses a weekend changed on the Race screen part-way through', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, true)?.code)
        .toBe('career.event.disturbed');
    });

    it('refuses a round the installed content cannot race', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, false, false)?.code)
        .toBe('series.round.unavailable');
    });

    it('refuses a weekend with an earlier one of its own still unraced', () => {
      const { entry, season } = seasonOf([
        makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03'),
      ]);

      const blocked = launchBlock(season, { entry, event: entry.events[1] }, true, false);

      expect(blocked?.code).toBe('career.event.earlierPending');
      expect(blocked?.params).toEqual({ event: 'Test Cup - Round one' });
    });

    it('refuses a weekend while another championship is part-way through one', () => {
      const started = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-05-03', { sessions: [makeRecord(0)] })],
      });
      const entry = makeEntry({ events: [makeEvent('two', '2026-03-01')] });
      const season = makeSeason({ entries: [started, entry] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)?.code)
        .toBe('career.event.otherInProgress');
    });

    it('allows the weekend that is itself part-way through', () => {
      const { entry, season } = seasonOf([
        makeEvent('one', '2026-03-01', { sessions: [makeRecord(0)] }),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    // The checks are ordered so the button and the command always agree on
    // which refusal to say first.
    it('says a weekend is over before it says anything else about it', () => {
      const { entry, season } = seasonOf([
        makeEvent('one', '2026-03-01'),
        makeEvent('two', '2026-05-03', { status: 'raced' }),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[1] }, false, true)?.code)
        .toBe('career.event.closed');
    });

    it('says a weekend was disturbed before it says the content cannot race it', () => {
      const { entry, season } = seasonOf([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, false, true)?.code)
        .toBe('career.event.disturbed');
    });

    it('says the content cannot race a round before it points at an earlier weekend', () => {
      const { entry, season } = seasonOf([
        makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03'),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[1] }, false, false)?.code)
        .toBe('series.round.unavailable');
    });
  });

  describe('clockTime', () => {
    it('says nothing when the weekend does not say when a session starts', () => {
      expect(clockTime(undefined)).toBeNull();
    });

    it('passes a time the weekend already wrote as "HH:MM" through', () => {
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

    const FIRST_DAY = '2026-03-06';

    /**
     * Runs eventSessions over the three-session weekend above.
     * @param records What has run so far
     * @param live Whether the career can still run this weekend
     * @param score What the weekend has paid, when it has been scored
     * @param forecast The round's generated weather, when it has one
     * @returns The sessions as the event page would show them
     */
    const sessionsOf = (
      records: readonly LaunchRecord[],
      live = true,
      score: RoundScore | undefined = undefined,
      forecast: RoundForecast | null = null,
    ) => eventSessions(
      makePlan(SESSIONS), STATED, records, forecast, FIRST_DAY, score, 'seat-2', live,
    );

    it('marks what has run, what runs next and what waits on it', () => {
      expect(sessionsOf([makeRecord(0)]).map((one) => one.status))
        .toEqual(['done', 'next', 'later']);
    });

    it('marks nothing next while the career cannot run the weekend', () => {
      expect(sessionsOf([makeRecord(0)], false).map((one) => one.status))
        .toEqual(['done', 'later', 'later']);
    });

    it('dates each session off the day the weekend opens', () => {
      expect(sessionsOf([]).map((one) => one.date))
        .toEqual(['2026-03-06', '2026-03-07', '2026-03-08']);
    });

    it('says when a session starts only where the weekend says so', () => {
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
      );

      expect(calendar.events).toHaveLength(1);
      expect(calendar.events[0]).toMatchObject({
        seriesName: 'Test Cup (as entered)', firstDay: '2026-03-01', enrolled: true,
      });
    });

    it('draws a class the career did not enter from the library', () => {
      const season = makeSeason();
      const other = makeChampionship({ id: 'other-cup', name: 'Other Cup' });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [makeListing(other)], new Map(),
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
      );

      expect(calendar.events.map((event) => [event.entry, event.enrolled]))
        .toEqual(expect.arrayContaining([['main', true], ['second', false]]));
      expect(calendar.events.filter((event) => event.entry === 'main')).toHaveLength(1);
    });

    it('reports the season it drew and the day the clock stands at', () => {
      const season = makeSeason({ index: 2 });
      const career = makeCareer({ date: '2026-06-07', seasons: [season] });

      expect(composeCalendar(career, season, [], new Map())).toMatchObject({
        season: 2, from: '2026-01-04', to: '2027-01-02', date: '2026-06-07', events: [],
      });
    });

    it('orders events by opening day, then by championship name', () => {
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
      );

      expect(calendar.events.map((event) => [event.firstDay, event.seriesName])).toEqual([
        ['2026-02-01', 'Alpha Cup'],
        ['2026-05-03', 'Alpha Cup'],
        ['2026-05-03', 'Zebra Cup'],
      ]);
    });

    it('marks enrolled weekends that overlap another', () => {
      const first = makeEntry({
        events: [makeEvent('one', '2026-06-07'), makeEvent('two', '2026-07-05')],
      });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', addDays('2026-06-07', WEEKEND_DAYS - 1))],
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
      );

      expect(calendar.events.map((event) => [event.series, event.round, event.clash])).toEqual([
        ['test-cup', 'one', true],
        ['other-cup', 'one', true],
        ['test-cup', 'two', false],
      ]);
    });

    // A season the career pulled out of is not one it can be double-booked
    // against, however its weekends fall.
    it('does not clash a weekend against a championship the career left', () => {
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
      );

      expect(calendar.events).toEqual([]);
    });
  });
});
