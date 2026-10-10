import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../types/index.ts';
import type {
  Championship, RacePlace, RoundScore, SeasonEntry, SeasonEvent,
} from '../../../types/index.ts';
import { buildStandings, entryResults, roundResult } from '../standings.ts';

/**
 * A one-class championship of three seats, the last two in one team.
 */
const SERIES: Championship = {
  version: 1,
  id: 'test-cup',
  name: 'Test Cup',
  teams: [{ id: 'works', name: 'Works Racing' }],
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 4 },
    seats: [
      { id: 'seat-1', driver: { name: 'First Driver' } },
      { id: 'seat-2', team: 'works', driver: { name: 'Second Driver' } },
      { id: 'seat-3', team: 'works', driver: { name: 'Named Driver' } },
    ],
    eligibility: { kind: 'cars', cars: ['test_car'] },
  }],
  rounds: [{ id: 'one', name: 'Round one', track: { id: 'track_one' } }],
  eventFormats: [{ id: 'standard', name: 'Standard', sessions: [{ type: 'race', laps: 10 }] }],
  defaultEventFormat: 'standard',
  pointsSystems: [{ id: 'standard', name: 'Standard', positions: [25, 18, 15] }],
  defaultPointsSystem: 'standard',
};

/**
 * A one-class championship of four seats across two named teams, the last seat
 * in none.
 * @param over Whatever the test wants said differently
 * @returns The championship
 */
const fourSeats = (over: Partial<Championship> = {}): Championship => ({
  ...SERIES,
  entries: [{
    ...SERIES.entries[0],
    seats: [
      { id: 'main-1', driver: { name: 'Ada' }, team: 'alpha' },
      { id: 'main-2', driver: { name: 'Bo' }, team: 'alpha' },
      { id: 'main-3', driver: { name: 'Cy' }, team: 'beta' },
      { id: 'main-4', driver: { name: 'Di' } },
    ],
  }],
  teams: [
    { id: 'alpha', name: 'Alpha Racing' },
    { id: 'beta', name: 'Beta Racing' },
  ],
  ...over,
});

/**
 * When the four-seat tables are built.
 */
const AT = '2026-01-01T12:00:00.000Z';

/**
 * One car's place in a race of the main class.
 * @param seat Which seat
 * @param classPosition Where it finished
 * @param points What it paid
 * @param over Whatever the test wants said differently
 * @returns The place
 */
const place = (seat: string, classPosition: number, points: number, over: Partial<RacePlace> = {}): RacePlace => ({
  seat,
  entry: 'main',
  team: seat === 'seat-1' ? null : 'works',
  driver: seat,
  position: classPosition,
  classPosition,
  qualifyingPosition: null,
  fastestLap: false,
  finishPoints: points,
  fastestLapPoints: 0,
  qualifyingPoints: 0,
  points,
  ...over,
});

/**
 * A round of one race.
 * @param places Every place it paid
 * @returns The round's score
 */
const round = (places: RacePlace[]): RoundScore => ({
  round: 'one',
  recordedAt: '2026-03-08T16:00:00.000Z',
  races: [{
    launch: 0, session: null, name: 'Race', pointsSystem: 'standard', places,
  }],
});

/**
 * A dated round of the test championship.
 * @param over Whatever the test wants said differently
 * @returns The event
 */
const makeEvent = (over: Partial<SeasonEvent> = {}): SeasonEvent => ({
  round: 'one',
  raceId: 'test-cup/one',
  date: '2026-03-08',
  status: 'scheduled',
  sessions: [],
  ...over,
});

describe('shared/utils/standings', () => {
  describe('buildStandings', () => {
    it('lists every seat of the class from the start, a driver on nothing included', () => {
      const { classes } = buildStandings(fourSeats(), [], AT);

      expect(classes).toHaveLength(1);
      expect(classes[0].entry).toBe('main');
      expect(classes[0].name).toBe('Main');
      expect(classes[0].drivers.map((row) => row.seat))
        .toEqual(['main-1', 'main-2', 'main-3', 'main-4']);
      expect(classes[0].drivers.map((row) => row.driver)).toEqual(['Ada', 'Bo', 'Cy', 'Di']);
      expect(classes[0].drivers.map((row) => row.position)).toEqual([1, 2, 3, 4]);
      expect(classes[0].drivers[0]).toMatchObject({
        points: 0, wins: 0, podiums: 0, bestFinish: null, races: 0,
      });
    });

    it('puts the most points first', () => {
      const scores = [round([place('main-1', 3, 6), place('main-3', 1, 20)])];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-3', 'main-1', 'main-2', 'main-4']);
      expect(table.drivers[0]).toMatchObject({
        points: 20, wins: 1, podiums: 1, bestFinish: 1, races: 1,
      });
    });

    it('puts a win ahead of the same points scored without one', () => {
      const scores = [round([place('main-1', 4, 10), place('main-2', 1, 10)])];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-2', 'main-1', 'main-3', 'main-4']);
    });

    it('puts a podium ahead when points and wins are level', () => {
      const scores = [round([place('main-1', 5, 10), place('main-3', 3, 10)])];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-3', 'main-1', 'main-2', 'main-4']);
    });

    it('puts the better finish ahead when points, wins and podiums are level', () => {
      const scores = [round([place('main-1', 6, 10), place('main-4', 4, 10)])];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-4', 'main-1', 'main-2', 'main-3']);
    });

    it('falls back to the championship\'s own entry order when nothing separates two seats', () => {
      const scores = [round([place('main-3', 4, 10), place('main-1', 4, 10)])];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-1', 'main-3', 'main-2', 'main-4']);
    });

    it('counts a class top three as a podium and nothing below it', () => {
      const scores = [
        round([place('main-1', 1, 10)]),
        round([place('main-1', 3, 6)]),
        round([place('main-1', 4, 0)]),
      ];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.drivers[0]).toMatchObject({
        seat: 'main-1', points: 16, wins: 1, podiums: 2, bestFinish: 1, races: 3,
      });
    });

    it('sums a team row out of the drivers it fields, by the team each seat names', () => {
      const scores = [round([
        place('main-1', 1, 10),
        place('main-2', 2, 8),
        place('main-3', 3, 6),
      ])];

      const [table] = buildStandings(fourSeats(), scores, AT).classes;

      expect(table.teams).toEqual([
        {
          team: 'alpha', name: 'Alpha Racing', position: 1, points: 18, wins: 1,
        },
        {
          team: 'beta', name: 'Beta Racing', position: 2, points: 6, wins: 0,
        },
      ]);
    });

    it('falls back to a team id when the championship never names the team', () => {
      const scores = [round([place('main-1', 1, 10)])];

      const [table] = buildStandings(fourSeats({ teams: undefined }), scores, AT).classes;

      expect(table.teams.map((row) => row.name)).toEqual(['alpha', 'beta']);
    });

    // The player's seat raced without them: those points are the named driver's
    // and not the player's, so they get a row of their own.
    it('gives the driver who raced the player\'s seat a row of their own', () => {
      const scores = [round([place('seat-3', 1, 25, { substitute: true }), place('seat-1', 2, 18)])];
      const rows = buildStandings(SERIES, scores, '2026-03-08T16:00:00.000Z').classes[0].drivers;
      const ofSeat = rows.filter((row) => row.seat === 'seat-3');

      expect(ofSeat).toHaveLength(2);
      expect(ofSeat.find((row) => row.substitute)).toMatchObject({ points: 25, wins: 1, races: 1 });
      expect(ofSeat.find((row) => !row.substitute)).toMatchObject({ points: 0, races: 0 });
    });

    it('lets the team keep what the stand-in scored', () => {
      const scores = [round([place('seat-3', 1, 25, { substitute: true })])];

      expect(buildStandings(SERIES, scores, '2026-03-08T16:00:00.000Z').classes[0].teams[0])
        .toMatchObject({ points: 25, wins: 1 });
    });

    // The two rows share the seat, so nothing before the last term of the sort
    // tells them apart.
    it('lists the seat\'s own row ahead of its substitute\'s on a full tie', () => {
      const scores = [round([place('seat-3', 2, 18)]), round([place('seat-3', 2, 18, { substitute: true })])];
      const rows = buildStandings(SERIES, scores, '2026-03-08T16:00:00.000Z').classes[0].drivers
        .filter((row) => row.seat === 'seat-3');

      expect(rows.map((row) => row.substitute ?? false)).toEqual([false, true]);
    });

    // The player set the qualifying time, so its points are theirs - and
    // nothing else about the race is.
    it('pays a bonus-only place without counting it as a race or a finish', () => {
      const scores = [round([place('seat-3', 0, 3, { bonusOnly: true })])];
      const row = buildStandings(SERIES, scores, '2026-03-08T16:00:00.000Z').classes[0].drivers
        .find((one) => one.seat === 'seat-3');

      expect(row).toMatchObject({
        points: 3, races: 0, wins: 0, podiums: 0, bestFinish: null,
      });
    });

    it('stamps the tables with when they were built', () => {
      expect(buildStandings(SERIES, [], '2026-03-08T16:00:00.000Z').updatedAt).toBe('2026-03-08T16:00:00.000Z');
    });
  });

  describe('roundResult', () => {
    it('reads a round with what it paid and every launch it ran', () => {
      const score = round([]);
      const sessions = [{
        index: 0, completedAt: '2026-03-08T16:00:00.000Z', archive: '0.json', gridOrder: [0], classification: [0],
      }];

      expect(roundResult(makeEvent({ status: 'raced', score, sessions }))).toEqual({
        round: 'one', date: '2026-03-08', status: 'raced', score, sessions,
      });
    });

    it('has no score for a round nothing of which has run', () => {
      expect(roundResult(makeEvent()).score).toBeNull();
    });
  });

  describe('entryResults', () => {
    it('reads the season\'s own copy of the championship, its rounds and the player\'s seat', () => {
      const entry: SeasonEntry = {
        series: 'test-cup',
        edition: 1,
        championship: SERIES,
        entry: 'main',
        playerSeat: 'seat-3',
        car: { model: 'test_car' },
        field: [],
        events: [makeEvent()],
        standings: { classes: [], updatedAt: '2026-03-01T00:00:00.000Z' },
      };

      expect(entryResults(entry, 2)).toEqual({
        championship: SERIES,
        season: 2,
        edition: 1,
        rounds: [roundResult(entry.events[0])],
        playerSeat: 'seat-3',
        playerEntry: 'main',
      });
    });
  });
});
