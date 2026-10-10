// The decidable parts of scoring, kept apart from the fold that walks an event.

import type {
  Championship, GridEntry, PointsSystem, SeriesSession, SessionDefinition,
} from '../../shared/types/index.ts';

/**
 * Which points system a race pays.
 *
 * The cast is the price of the inert field: a session reaches here as a plain
 * SessionDefinition, because src/core/event/ knows nothing about series, and
 * `pointsSystem` rides on it unread - see the note on SeriesSession. Done once,
 * here, rather than at each call site.
 * @param series The championship being scored
 * @param session The race session that ran
 * @returns The points system it pays, or null when it names one the
 * championship does not have
 */
export const pointsSystemOf = (
  series: Championship,
  session: SessionDefinition,
): PointsSystem | null => {
  const named = (session as SeriesSession).pointsSystem ?? series.defaultPointsSystem;

  return series.pointsSystems.find((system) => system.id === named) ?? null;
};

/**
 * Narrows an order to the cars of one class entry, keeping the order they are in.
 *
 * What turns an overall finishing order into a class one: a multi-class grid
 * runs one race and settles several championships in it, so an LMGT3 car that
 * crossed the line twenty-fifth may still have won what it was racing for.
 * @param order Car indices into the event's grid, in classified order
 * @param grid The event's entry list
 * @param entry The class entry's id
 * @returns The car indices of that class alone, in the same order
 */
export const classOrder = (
  order: readonly number[],
  grid: readonly GridEntry[],
  entry: string,
): number[] => order.filter((car) => grid[car]?.entry === entry);

/**
 * Which car of a class set the fastest lap of a race.
 *
 * Per class rather than across the grid, because the point belongs to the
 * championship the car is scoring in.
 * @param cars The class's car indices, in any order
 * @param times Each car's best valid lap, by car index, null where there is none
 * @returns The car index, or null when nobody in the class set a valid lap
 */
export const fastestIn = (
  cars: readonly number[],
  times: readonly (number | null)[],
): number | null => cars.reduce<number | null>((best, car) => {
  const time = times[car];
  if (time == null) return best;
  const standing = best === null ? null : times[best];

  return standing == null || time < standing ? car : best;
}, null);

/**
 * What a table pays at a position.
 *
 * Off the end of the table pays nothing, which is what a points table means by
 * ending: a championship scoring ten places pays the eleventh nothing rather
 * than repeating the last figure.
 * @param table The points by position, the winner first
 * @param position Where the car finished, counting from one
 * @returns The points, or zero
 */
export const pointsAt = (table: readonly number[] | undefined, position: number): number => (
  table?.[position - 1] ?? 0
);
