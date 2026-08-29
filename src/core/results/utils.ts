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
 * Whether an order is a usable permutation of a field of the given size.
 *
 * Guards the two places a bad order would do silent damage: AC's own
 * raceResult, and a grid order stored against a field that has changed since.
 * @param order The order to check
 * @param size How many cars there are
 * @returns True when every car appears exactly once
 */
export const isPermutation = (order: readonly number[] | undefined, size: number): boolean => {
  if (!order || order.length !== size) return false;

  const seen = new Set(order.filter((car) => Number.isInteger(car) && car >= 0 && car < size));

  return seen.size === size;
};
