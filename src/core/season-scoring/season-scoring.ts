// Turning a driven event into points, and a season's points into tables.
//
// Pure: the archives are read by whoever owns them and handed in, so nothing
// here touches a disk.
//
// What this deliberately cannot express, because PointsSystem cannot say it and
// a field carried but never applied is worse than no field:
//
//   - dropped scores, where a season counts a driver's best N rounds
//   - a fastest lap that only pays a driver classified in the top ten
//   - points at intermediate hours of an endurance race
//   - points for leading a lap, or for leading the most laps
//   - a team championship counting only its best two cars
//
// All five are real rules of real championships and all five are listed in
// championship-review.md, where they wait for a decision rather than being
// half-built here.
//
// One more is a measurement gap rather than a schema one: Assetto Corsa writes
// no retirement flag, so every car in the classification scores by where it
// finished. There is no 90%-distance cutoff, because a car that stopped cannot
// be told from one that was lapped.

import type { LaunchResult } from './types.ts';
import {
  classOrder, fastestIn, pointsAt, pointsSystemOf,
} from './utils.ts';
import type {
  Championship,
  EventPlan,
  EventState,
  RacePlace,
  RaceScore,
  RoundScore,
} from '../../shared/types/index.ts';
import {
  bestLapTimes, chainOf, composeOrder, lastSessionOf,
} from '../event/index.ts';
import { SESSION_TYPE } from '../race-ini/index.ts';

export type { LaunchResult } from './types.ts';
// Built from scores rather than from an event, and read by the renderer too.
export { buildStandings } from '../../shared/utils/standings/index.ts';

/**
 * Each car's best valid lap, in event-grid order.
 *
 * A result's car indices are positions in the launch's own [CAR_n] list, which
 * a knockout segment makes shorter than the event's - so the times are read
 * in that order and mapped back through it. Getting this wrong would attribute
 * a lap to the wrong driver rather than fail.
 * @param result What the launch wrote, or undefined when nothing was archived
 * @param gridOrder The [CAR_n] order the launch ran with, as event-grid indices
 * @param size How many cars the event fields
 * @returns One time in milliseconds per event-grid car, or null
 */
const lapTimesByCar = (
  result: LaunchResult | undefined,
  gridOrder: readonly number[],
  size: number,
): (number | null)[] => {
  const times: (number | null)[] = Array.from({ length: size }, () => null);
  if (!result) return times;

  const session = lastSessionOf(result.raceOut, SESSION_TYPE.race);
  if (!session) return times;

  bestLapTimes(session, gridOrder.length).forEach((time, at) => {
    const car = gridOrder[at];
    if (car !== undefined) times[car] = time;
  });

  return times;
};

/**
 * Scores one round of a championship from the event that ran it.
 *
 * Every race of the event pays, so a sprint event scores twice and a round
 * is what a season counts. An event with no race in it scores nothing and is
 * still a round that happened.
 * @param series The championship being raced
 * @param round Which round of it, by id
 * @param plan The event as it was planned
 * @param state How it ran, which carries each launch's order and classification
 * @param results What Assetto Corsa wrote, one per launch that wrote anything
 * @param recordedAt When this was scored, as an ISO timestamp
 * @returns The round's score
 */
export const scoreRound = (
  series: Championship,
  round: string,
  plan: EventPlan,
  state: EventState,
  results: readonly LaunchResult[],
  recordedAt: string,
): RoundScore => {
  const size = plan.grid.length;

  const races = plan.launches.flatMap((launch): RaceScore[] => {
    if (launch.session.type !== 'race') return [];

    const record = state.completed.find((one) => one.index === launch.index);
    const finish = record?.classification;
    if (!record || !finish) return [];

    const system = pointsSystemOf(series, launch.session);
    // A race naming a system the championship does not have is reported by
    // validateSeries. Here it simply pays nothing rather than throwing, because
    // an event already driven has to stay recordable.
    if (!system) return [];

    // The order the race started in, composed exactly as the event composed
    // it to set STARTING_POSITION - so qualifying points pay the grid that was
    // actually raced, and a knockout comes out right with no second rule. A
    // reverse-grid race pays on the qualifying order rather than on the
    // reversal, because the reverse is applied after this.
    const started = composeOrder(chainOf(plan, launch.index), state.completed, size);
    const times = lapTimesByCar(
      results.find((one) => one.launch === launch.index),
      record.gridOrder,
      size,
    );

    const places = series.entries.flatMap((entry): RacePlace[] => {
      const cars = classOrder(finish, plan.grid, entry.id);
      const qualified = started === null ? [] : classOrder(started, plan.grid, entry.id);
      const fastest = fastestIn(cars, times);

      return cars.map((car, at) => {
        const row = plan.grid[car];
        const classPosition = at + 1;
        const qualifyingAt = qualified.indexOf(car);
        const qualifyingPosition = qualifyingAt < 0 ? null : qualifyingAt + 1;

        const finishPoints = pointsAt(system.positions, classPosition);
        const fastestLapPoints = car === fastest ? system.fastestLap ?? 0 : 0;
        const qualifyingPoints = qualifyingPosition === null
          ? 0
          : pointsAt(system.qualifying, qualifyingPosition);

        return {
          seat: row.seat ?? '',
          entry: entry.id,
          team: row.team ?? null,
          driver: row.driver,
          position: finish.indexOf(car) + 1,
          classPosition,
          qualifyingPosition,
          fastestLap: car === fastest,
          finishPoints,
          fastestLapPoints,
          qualifyingPoints,
          points: finishPoints + fastestLapPoints + qualifyingPoints,
        };
      });
      // A car with no seat is a hand-authored entry, which no championship
      // scores. Dropped after the map rather than before it, so class positions
      // still count it: it was on the track, and the cars behind it finished
      // behind it.
    }).filter((place) => place.seat !== '');

    return [{
      launch: launch.index,
      session: launch.session.id ?? null,
      name: launch.session.name ?? launch.session.type,
      pointsSystem: system.id,
      places,
    }];
  });

  return { round, recordedAt, races };
};
