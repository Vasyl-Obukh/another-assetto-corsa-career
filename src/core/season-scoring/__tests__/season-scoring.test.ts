import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type {
  GridEntry,
  LaunchRecord,
  RaceDefinition,
  RacePlace,
  RoundScore,
  SeriesSession,
  SessionDefinition,
  WeekendPlan,
  WeekendState,
} from '../../../shared/types/index.ts';
import { buildStandings, scoreRound } from '../season-scoring.ts';
import type { LaunchResult } from '../types.ts';
import { gridRow, makeGrid, makeSeries } from './fixtures.ts';

/**
 * When a round was scored, and when a table was built. Fixed so a test can
 * assert either is carried through unchanged.
 */
const AT = '2026-01-01T12:00:00.000Z';

/**
 * Builds a weekend plan over a grid, one launch per session.
 *
 * The launch's own race is never read by scoring - the plan is consulted for
 * the grid and for the session each launch ran - so it is left empty.
 * @param grid The weekend's entry list
 * @param sessions The sessions, in the order they run
 * @returns The plan
 */
const makePlan = (grid: GridEntry[], sessions: SessionDefinition[]): WeekendPlan => ({
  raceId: 'test-weekend',
  raceName: 'Test Weekend',
  grid,
  launches: sessions.map((session, index) => ({
    index, day: 0, race: {} as RaceDefinition, session,
  })),
});

/**
 * Builds the record one completed launch left behind.
 * @param index Which launch of the plan it was
 * @param classification The order it classified, as weekend-grid car indices
 * @param gridOrder The [CAR_n] order it ran with, defaulting to the whole grid
 * @returns The record
 */
const ran = (
  index: number,
  classification: number[] | null,
  gridOrder: number[] = [0, 1, 2, 3],
): LaunchRecord => ({
  index, completedAt: AT, archive: `archive-${index}`, gridOrder, classification,
});

/**
 * Builds the weekend state out of the launches that have run.
 * @param completed One record per launch that ran, in the order they ran
 * @param launchCount How many launches the plan holds
 * @returns The state
 */
const makeState = (completed: LaunchRecord[], launchCount: number): WeekendState => ({
  raceId: 'test-weekend', launchCount, completed,
});

/**
 * Builds what a race launch wrote, as one race session of lap rows.
 * @param launch Which launch of the plan wrote it
 * @param laps One pair per lap - the car's index in the launch's own [CAR_n]
 * list, and the lap time in milliseconds, negative when invalidated
 * @returns The launch result
 */
const raceOf = (
  launch: number,
  laps: readonly (readonly [number, number])[],
): LaunchResult => ({
  launch,
  raceOut: {
    track: 'test_track',
    number_of_sessions: 1,
    players: [],
    sessions: [{
      event: 0,
      name: 'Race',
      type: 3,
      lapsCount: 0,
      duration: 0,
      lapstotal: [],
      bestLaps: [],
      laps: laps.map(([car, time]) => ({
        lap: 0, car, sectors: [], time, cuts: 0, tyre: 'SM',
      })),
    }],
  },
});

/**
 * Builds one race place, defaulting everything a standings test does not read.
 * @param seat Which seat took it away
 * @param classPosition Where it finished in its class
 * @param points What it scored
 * @returns A complete RacePlace
 */
const place = (seat: string, classPosition: number, points: number): RacePlace => ({
  seat,
  entry: 'main',
  team: null,
  driver: seat,
  position: classPosition,
  classPosition,
  qualifyingPosition: null,
  fastestLap: false,
  finishPoints: points,
  fastestLapPoints: 0,
  qualifyingPoints: 0,
  points,
});

/**
 * Builds a round holding one race, which paid the given places.
 * @param places What that race paid
 * @returns The round score
 */
const roundOf = (places: RacePlace[]): RoundScore => ({
  round: 'magione',
  recordedAt: AT,
  races: [{
    launch: 0, session: null, name: 'Race', pointsSystem: 'race', places,
  }],
});

describe('core/season-scoring/season-scoring', () => {
  describe('scoreRound', () => {
    const practice: SessionDefinition = { type: 'practice', name: 'Practice', minutes: 10 };
    const qualify: SessionDefinition = { type: 'qualify', name: 'Qualifying', minutes: 10 };
    const sprint: SessionDefinition = { type: 'race', name: 'Sprint', laps: 2 };
    const feature: SessionDefinition = { type: 'race', name: 'Feature', laps: 6 };

    it('pays every race of the weekend, so a sprint weekend scores twice', () => {
      const plan = makePlan(makeGrid(), [qualify, sprint, feature]);
      const state = makeState(
        [ran(0, [2, 0, 1, 3]), ran(1, [0, 1, 2, 3]), ran(2, [3, 2, 1, 0])],
        3,
      );

      const score = scoreRound(makeSeries(), 'magione', plan, state, [], AT);

      expect(score.round).toBe('magione');
      expect(score.recordedAt).toBe(AT);
      expect(score.races.map((race) => race.name)).toEqual(['Sprint', 'Feature']);
      expect(score.races.map((race) => race.launch)).toEqual([1, 2]);
      expect(score.races[0].pointsSystem).toBe('race');
      expect(score.races[0].session).toBeNull();
      expect(score.races[0].places.map((one) => one.seat))
        .toEqual(['main-1', 'main-2', 'main-3', 'main-4']);
      expect(score.races[0].places.map((one) => one.points)).toEqual([10, 8, 6, 0]);
      expect(score.races[1].places.map((one) => one.seat))
        .toEqual(['main-4', 'main-3', 'main-2', 'main-1']);
      expect(score.races[1].places.map((one) => one.points)).toEqual([10, 8, 6, 0]);
    });

    it('names the team and the driver each seat raced as', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      const state = makeState([ran(0, [0, 1, 2, 3])], 1);

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, [], AT).races[0];

      expect(places.map((one) => one.driver)).toEqual(['Ada', 'Bo', 'Cy', 'Di']);
      expect(places.map((one) => one.team)).toEqual(['alpha', 'alpha', 'beta', null]);
    });

    it('scores nothing for a weekend that never ran a race', () => {
      const plan = makePlan(makeGrid(), [practice, qualify]);
      const state = makeState([ran(0, null), ran(1, [2, 0, 1, 3])], 2);

      expect(scoreRound(makeSeries(), 'magione', plan, state, [], AT).races).toEqual([]);
    });

    it('skips a race whose launch classified nothing', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      const state = makeState([ran(0, null)], 1);

      expect(scoreRound(makeSeries(), 'magione', plan, state, [], AT).races).toEqual([]);
    });

    it('skips a race whose launch has not run yet', () => {
      const plan = makePlan(makeGrid(), [sprint]);

      expect(scoreRound(makeSeries(), 'magione', plan, makeState([], 1), [], AT).races)
        .toEqual([]);
    });

    it('pays nothing rather than throwing when a race names a points system that is not there', () => {
      const unknown: SeriesSession = { type: 'race', name: 'Sprint', pointsSystem: 'endurance' };
      const plan = makePlan(makeGrid(), [unknown]);
      const state = makeState([ran(0, [0, 1, 2, 3])], 1);

      expect(() => scoreRound(makeSeries(), 'magione', plan, state, [], AT)).not.toThrow();
      expect(scoreRound(makeSeries(), 'magione', plan, state, [], AT).races).toEqual([]);
    });

    it('settles each class on its own, so a car well down overall can win its class', () => {
      const series = makeSeries({
        entries: [
          {
            id: 'gtp',
            name: 'GTP',
            ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
            seats: [{ id: 'gtp-1' }, { id: 'gtp-2' }],
            eligibility: { kind: 'cars', cars: ['test_car'] },
          },
          {
            id: 'gt3',
            name: 'GT3',
            ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
            seats: [{ id: 'gt3-1' }, { id: 'gt3-2' }],
            eligibility: { kind: 'cars', cars: ['test_car'] },
          },
        ],
      });
      const grid = [
        gridRow({ seat: 'gtp-1', entry: 'gtp' }),
        gridRow({ seat: 'gt3-1', entry: 'gt3' }),
        gridRow({ seat: 'gtp-2', entry: 'gtp' }),
        gridRow({ seat: 'gt3-2', entry: 'gt3' }),
      ];
      const plan = makePlan(grid, [sprint]);
      // Overall: the two GTPs, then gt3-2 third and gt3-1 fourth.
      const state = makeState([ran(0, [0, 2, 3, 1])], 1);

      const { places } = scoreRound(series, 'magione', plan, state, [], AT).races[0];
      const winner = places.find((one) => one.seat === 'gt3-2');

      expect(places.map((one) => one.seat)).toEqual(['gtp-1', 'gtp-2', 'gt3-2', 'gt3-1']);
      expect(winner?.position).toBe(3);
      expect(winner?.classPosition).toBe(1);
      expect(winner?.points).toBe(10);
    });

    it('leaves a car with no seat out of the places while still counting it ahead of the cars behind it', () => {
      const grid = [
        gridRow({ seat: 'main-1', entry: 'main' }),
        gridRow({ entry: 'main' }),
        gridRow({ seat: 'main-2', entry: 'main' }),
      ];
      const plan = makePlan(grid, [sprint]);
      // The seatless car won, so the two seats that scored finished second and
      // third in class rather than first and second.
      const state = makeState([ran(0, [1, 0, 2], [0, 1, 2])], 1);

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, [], AT).races[0];

      expect(places.map((one) => one.seat)).toEqual(['main-1', 'main-2']);
      expect(places.map((one) => one.classPosition)).toEqual([2, 3]);
      expect(places.map((one) => one.points)).toEqual([8, 6]);
    });

    it('adds the fastest lap and the qualifying table into what a place took away', () => {
      const series = makeSeries({
        pointsSystems: [{
          id: 'race',
          name: 'Race points',
          positions: [10, 8, 6],
          fastestLap: 1,
          qualifying: [2, 1],
        }],
      });
      const plan = makePlan(makeGrid(), [qualify, sprint]);
      const state = makeState([ran(0, [2, 0, 1, 3]), ran(1, [0, 1, 2, 3])], 2);
      // Car 2's only lap was invalidated, so the fastest goes to car 1.
      const results = [raceOf(1, [[0, 60_000], [1, 59_000], [2, -1]])];

      const { places } = scoreRound(series, 'magione', plan, state, results, AT).races[0];

      expect(places.map((one) => one.fastestLap)).toEqual([false, true, false, false]);
      expect(places.map((one) => one.qualifyingPosition)).toEqual([2, 3, 1, 4]);
      expect(places.map((one) => one.finishPoints)).toEqual([10, 8, 6, 0]);
      expect(places.map((one) => one.fastestLapPoints)).toEqual([0, 1, 0, 0]);
      expect(places.map((one) => one.qualifyingPoints)).toEqual([1, 0, 2, 0]);
      expect(places.map((one) => one.points)).toEqual([11, 9, 8, 0]);
    });

    it('reads lap times back through the order the launch ran with', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      // The race went out with car 2 on pole, so the first [CAR_n] slot is it.
      const state = makeState([ran(0, [0, 1, 2, 3], [2, 0, 1, 3])], 1);
      const results = [raceOf(0, [[0, 58_000], [1, 60_000]])];

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, results, AT).races[0];

      expect(places.map((one) => one.fastestLap)).toEqual([false, false, true, false]);
    });

    it('reports no qualifying position when nothing set the grid', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      const state = makeState([ran(0, [0, 1, 2, 3])], 1);

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, [], AT).races[0];

      expect(places.map((one) => one.qualifyingPosition)).toEqual([null, null, null, null]);
      expect(places.map((one) => one.qualifyingPoints)).toEqual([0, 0, 0, 0]);
    });
  });

  describe('buildStandings', () => {
    it('lists every seat of the class from the start, a driver on nothing included', () => {
      const { classes, updatedAt } = buildStandings(makeSeries(), [], AT);

      expect(updatedAt).toBe(AT);
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
      const scores = [roundOf([place('main-1', 3, 6), place('main-3', 1, 20)])];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-3', 'main-1', 'main-2', 'main-4']);
      expect(table.drivers[0]).toMatchObject({
        points: 20, wins: 1, podiums: 1, bestFinish: 1, races: 1,
      });
    });

    it('puts a win ahead of the same points scored without one', () => {
      const scores = [roundOf([place('main-1', 4, 10), place('main-2', 1, 10)])];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-2', 'main-1', 'main-3', 'main-4']);
    });

    it('puts a podium ahead when points and wins are level', () => {
      const scores = [roundOf([place('main-1', 5, 10), place('main-3', 3, 10)])];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-3', 'main-1', 'main-2', 'main-4']);
    });

    it('puts the better finish ahead when points, wins and podiums are level', () => {
      const scores = [roundOf([place('main-1', 6, 10), place('main-4', 4, 10)])];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-4', 'main-1', 'main-2', 'main-3']);
    });

    it('falls back to the championship\'s own entry order when nothing separates two seats', () => {
      const scores = [roundOf([place('main-3', 4, 10), place('main-1', 4, 10)])];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

      expect(table.drivers.map((row) => row.seat))
        .toEqual(['main-1', 'main-3', 'main-2', 'main-4']);
    });

    it('counts a class top three as a podium and nothing below it', () => {
      const scores = [
        roundOf([place('main-1', 1, 10)]),
        roundOf([place('main-1', 3, 6)]),
        roundOf([place('main-1', 4, 0)]),
      ];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

      expect(table.drivers[0]).toMatchObject({
        seat: 'main-1', points: 16, wins: 1, podiums: 2, bestFinish: 1, races: 3,
      });
    });

    it('sums a team row out of the drivers it fields', () => {
      const scores = [roundOf([
        place('main-1', 1, 10),
        place('main-2', 2, 8),
        place('main-3', 3, 6),
      ])];

      const [table] = buildStandings(makeSeries(), scores, AT).classes;

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
      const series = makeSeries({ teams: undefined });
      const scores = [roundOf([place('main-1', 1, 10)])];

      const [table] = buildStandings(series, scores, AT).classes;

      expect(table.teams.map((row) => row.name)).toEqual(['alpha', 'beta']);
    });
  });
});
