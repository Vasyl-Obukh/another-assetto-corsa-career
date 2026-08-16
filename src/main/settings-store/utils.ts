import { rename } from 'node:fs/promises';

import { MAX_QUARANTINE_ATTEMPTS } from './constants.ts';

/**
 * Moves a bad settings file aside rather than overwriting evidence of the
 * problem.
 * @param file Absolute path to the file to move
 * @returns Where it was moved to, or null when no free name was found
 */
export const quarantine = async (file: string): Promise<string | null> => {
  for (let n = 1; n <= MAX_QUARANTINE_ATTEMPTS; n += 1) {
    const target = file.replace(/\.json$/, `.corrupt-${n}.json`);
    try {
      // Fails if the name is taken, which is how we find a free one.
      await rename(file, target);
      return target;
    } catch {
      // Either the target exists or the source vanished; try the next name.
    }
  }

  return null;
};
