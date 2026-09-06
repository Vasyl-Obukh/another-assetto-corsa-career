import { stat } from 'node:fs/promises';

/**
 * Reads a file's last modified time.
 * @param file Absolute path to the file
 * @returns Milliseconds since the epoch, or null when the file is not there
 */
export const mtimeOf = async (file: string): Promise<number | null> => {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return null;
  }
};

/**
 * Sleeps for a while, or until something pushes onto the wakeup list.
 * @param ms How long to sleep for, in milliseconds
 * @param wakeups Shared list a watcher can call into to cut the sleep short
 * @returns Resolves once the delay elapses or a wakeup fires
 */
export const sleepUntilEvent = (ms: number, wakeups: (() => void)[]): Promise<void> => (
  new Promise((resolve) => {
    const finish = (): void => {
      const index = wakeups.indexOf(finish);
      if (index !== -1) wakeups.splice(index, 1);
      resolve();
    };

    // Left to expire on its own rather than cleared; resolving twice is a no-op
    // and unref keeps a pending timer from holding the process open.
    setTimeout(finish, ms).unref();
    wakeups.push(finish);
  })
);

/**
 * How many distinct, real car indices an order names.
 * @param order The order to count
 * @param size How many cars the field has
 * @returns The count, ignoring duplicates and anything outside the field
 */
const distinctCars = (order: readonly number[], size: number): number => (
  new Set(order.filter((car) => Number.isInteger(car) && car >= 0 && car < size)).size
);

/**
 * Whether an order is a usable permutation of a field of the given size.
 *
 * Guards the two places a bad order would do silent damage: AC's own
 * raceResult, and a grid order stored against a field that has changed since.
 * @param order The order to check
 * @param size How many cars there are
 * @returns True when every car appears exactly once
 */
export const isPermutation = (order: readonly number[] | undefined, size: number): boolean => (
  order !== undefined && order.length === size && distinctCars(order, size) === size
);

/**
 * Whether an order is a usable subset of a field of the given size.
 *
 * The looser sibling of isPermutation, for a qualifying segment: a knockout
 * eliminates, so a segment's classification covers only the cars that were
 * still in it. Every car must still be a real, distinct index - a duplicate or
 * a stray one means the order cannot be mapped back at all.
 *
 * A type guard, so a caller that has checked an order can go on to read it
 * without asking again what to do about a missing one.
 * @param order The order to check
 * @param size How many cars the whole field has
 * @returns True when it names distinct cars of that field, and at least one
 */
export const isDistinctSubset = (
  order: readonly number[] | null | undefined,
  size: number,
): order is readonly number[] => (
  order != null
    && order.length > 0
    && order.length <= size
    && distinctCars(order, size) === order.length
);
