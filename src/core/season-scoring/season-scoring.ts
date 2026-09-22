// Turning a driven weekend into points, and a season's points into tables.
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
  ClassStandings,
  DriverStanding,
  RacePlace,
  RaceScore,
  RoundScore,
  SeasonStandings,
  TeamStanding,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import { SESSION_TYPE } from '../race-ini/index.ts';
import {
  bestLapTimes, chainOf, composeOrder, lastSessionOf,
} from '../weekend/index.ts';

export type { LaunchResult } from './types.ts';

/**
 * How many places count as a podium.
 */
const PODIUM = 3;

/**
 * Each car's best valid lap, in weekend-grid order.
 *
 * A result's car indices are positions in the launch's own [CAR_n] list, which
 * a knockout segment makes shorter than the weekend's - so the times are read
 * in that order and mapped back through it. Getting this wrong would attribute
 * a lap to the wrong driver rather than fail.
 * @param result What the launch wrote, or undefined when nothing was archived
 * @param gridOrder The [CAR_n] order the launch ran with, as weekend-grid indices
 * @param size How many cars the weekend fields
 * @returns One time in milliseconds per weekend-grid car, or null
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
 * Scores one round of a championship from the weekend that ran it.
 *
 * Every race of the weekend pays, so a sprint weekend scores twice and a round
 * is what a season counts. A weekend with no race in it scores nothing and is
 * still a round that happened.
 * @param series The championship being raced
 * @param round Which round of it, by id
 * @param plan The weekend as it was planned
 * @param state How it ran, which carries each launch's order and classification
 * @param results What Assetto Corsa wrote, one per launch that wrote anything
 * @param recordedAt When this was scored, as an ISO timestamp
 * @returns The round's score
 */
export const scoreRound = (
  series: Championship,
  round: string,
  plan: WeekendPlan,
  state: WeekendState,
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
    // a weekend already driven has to stay recordable.
    if (!system) return [];

    // The order the race started in, composed exactly as the weekend composed
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

/**
 * Orders a class's driver rows and numbers them.
 * @param rows The rows in any order
 * @param seatOrder Where each seat sits in the championship's own entry list
 * @returns The rows, best placed first, each carrying its position
 */
const placeDrivers = (
  rows: readonly Omit<DriverStanding, 'position'>[],
  seatOrder: ReadonlyMap<string, number>,
): DriverStanding[] => [...rows]
  // Points, then wins, then podiums, then the best finish anyone managed, with
  // the entry list's own order last so the sort is total. Deliberately no
  // countback by round: a season that really settles ties that way says so in
  // its own rules, and guessing is worse than a stable order.
  //
  // The best-finish term must stay ahead of the entry-list one. Two drivers who
  // have both scored nothing give Infinity - Infinity, and it is only because
  // NaN is falsy that the chain falls through to the order that settles it;
  // last in the chain it would be the answer, and the sort would not be total.
  .sort((left, right) => (
    right.points - left.points
    || right.wins - left.wins
    || right.podiums - left.podiums
    || (left.bestFinish ?? Infinity) - (right.bestFinish ?? Infinity)
    || (seatOrder.get(left.seat) ?? 0) - (seatOrder.get(right.seat) ?? 0)
  ))
  .map((row, at) => ({ ...row, position: at + 1 }));

/**
 * Builds a season's tables from the rounds scored so far.
 *
 * Every seat of every class starts in its table on nothing, so a table is the
 * field rather than only the drivers who have scored: a championship shows who
 * is in it from the first round, and a driver on zero is a fact about them
 * rather than an absence.
 * Every row carries the name the championship's own document gives that seat,
 * the player's included. Which seat is the player's, and what to call them, is
 * the career's and settings' to say where the table is shown - so renaming
 * yourself renames every table rather than the ones written after it.
 * @param series The championship
 * @param scores Every round of it scored so far, in any order
 * @param updatedAt When this was built, as an ISO timestamp
 * @returns One table per class entry
 */
export const buildStandings = (
  series: Championship,
  scores: readonly RoundScore[],
  updatedAt: string,
): SeasonStandings => {
  const teamName = new Map((series.teams ?? []).map((team) => [team.id, team.name]));
  const places = scores.flatMap((score) => score.races.flatMap((race) => race.places));

  const classes = series.entries.map((entry): ClassStandings => {
    const seatOrder = new Map(entry.seats.map((seat, at) => [seat.id, at]));

    const drivers = entry.seats.map((seat) => {
      const own = places.filter((place) => place.entry === entry.id && place.seat === seat.id);
      const finishes = own.map((place) => place.classPosition);

      return {
        seat: seat.id,
        driver: seat.driver?.name ?? '',
        team: seat.team ?? null,
        points: own.reduce((sum, place) => sum + place.points, 0),
        wins: finishes.filter((position) => position === 1).length,
        podiums: finishes.filter((position) => position <= PODIUM).length,
        bestFinish: finishes.length ? Math.min(...finishes) : null,
        races: own.length,
      };
    });

    const placed = placeDrivers(drivers, seatOrder);
    const teamIds = [...new Set(placed.map((row) => row.team).filter((id) => id !== null))];

    const teams = teamIds
      .map((id): Omit<TeamStanding, 'position'> => {
        const own = placed.filter((row) => row.team === id);

        return {
          team: id,
          name: teamName.get(id) ?? id,
          points: own.reduce((sum, row) => sum + row.points, 0),
          wins: own.reduce((sum, row) => sum + row.wins, 0),
        };
      })
      .sort((left, right) => right.points - left.points || right.wins - left.wins)
      .map((row, at) => ({ ...row, position: at + 1 }));

    return {
      entry: entry.id, name: entry.name, drivers: placed, teams,
    };
  });

  return { classes, updatedAt };
};
