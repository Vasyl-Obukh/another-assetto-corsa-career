import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type {
  EventPlan,
  EventState,
  GridEntry,
  LaunchRecord,
  RaceDefinition,
  SeriesSession,
  SessionDefinition,
} from '../../../shared/types/index.ts';
import { scoreRound } from '../season-scoring.ts';
import type { LaunchResult } from '../types.ts';
import { gridRow, makeGrid, makeSeries } from './fixtures.ts';

/**
 * When a round was scored. Fixed so a test can assert it is carried through
 * unchanged.
 */
const AT = '2026-01-01T12:00:00.000Z';

/**
 * Builds an event plan over a grid, one launch per session.
 *
 * The launch's own race is never read by scoring - the plan is consulted for
 * the grid and for the session each launch ran - so it is left empty.
 * @param grid The event's entry list
 * @param sessions The sessions, in the order they run
 * @returns The plan
 */
const makePlan = (grid: GridEntry[], sessions: SessionDefinition[]): EventPlan => ({
  raceId: 'test-event',
  raceName: 'Test Event',
  grid,
  launches: sessions.map((session, index) => ({
    index, day: 0, race: {} as RaceDefinition, session,
  })),
});

/**
 * Builds the record one completed launch left behind.
 * @param index Which launch of the plan it was
 * @param classification The order it classified, as event-grid car indices
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
 * Builds the event state out of the launches that have run.
 * @param completed One record per launch that ran, in the order they ran
 * @param launchCount How many launches the plan holds
 * @returns The state
 */
const makeState = (completed: LaunchRecord[], launchCount: number): EventState => ({
  raceId: 'test-event', launchCount, completed,
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

describe('core/season-scoring/season-scoring', () => {
  describe('scoreRound', () => {
    const practice: SessionDefinition = { type: 'practice', name: 'Practice', minutes: 10 };
    const qualify: SessionDefinition = { type: 'qualify', name: 'Qualifying', minutes: 10 };
    const sprint: SessionDefinition = { type: 'race', name: 'Sprint', laps: 2 };
    const feature: SessionDefinition = { type: 'race', name: 'Feature', laps: 6 };

    it('pays every race of the event, so a sprint event scores twice', () => {
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

    it('scores nothing for an event that never ran a race', () => {
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

    it('counts the laps each car had a cut on, read back through the order the launch ran with', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      // The first [CAR_n] slot is car 2, the third car 1.
      const state = makeState([ran(0, [0, 1, 2, 3], [2, 0, 1, 3])], 1);
      const result = raceOf(0, [[0, 60_000], [0, 61_000], [1, 60_500], [3, 62_000], [3, 63_000]]);
      const cuts = [1, 2, 0, 0, 1];
      const laps = result.raceOut.sessions[0].laps.map((lap, at) => ({ ...lap, cuts: cuts[at] }));
      const cut = { ...result, raceOut: { ...result.raceOut, sessions: [{ ...result.raceOut.sessions[0], laps }] } };

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, [cut], AT).races[0];

      expect(places.map((one) => one.cuts)).toEqual([0, 0, 2, 1]);
    });

    it('records no cut count for a race nothing was archived for', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      const state = makeState([ran(0, [0, 1, 2, 3])], 1);

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, [], AT).races[0];

      expect(places.every((one) => !('cuts' in one))).toBe(true);
    });

    it('reports no qualifying position when nothing set the grid', () => {
      const plan = makePlan(makeGrid(), [sprint]);
      const state = makeState([ran(0, [0, 1, 2, 3])], 1);

      const { places } = scoreRound(makeSeries(), 'magione', plan, state, [], AT).races[0];

      expect(places.map((one) => one.qualifyingPosition)).toEqual([null, null, null, null]);
      expect(places.map((one) => one.qualifyingPoints)).toEqual([0, 0, 0, 0]);
    });
  });
});
