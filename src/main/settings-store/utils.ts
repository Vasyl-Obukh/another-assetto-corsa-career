import { constants } from 'node:fs';
import { copyFile, unlink } from 'node:fs/promises';

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
      // Copied rather than renamed: on Windows a rename replaces whatever is at
      // the target, so it would overwrite the last file quarantined.
      await copyFile(file, target, constants.COPYFILE_EXCL);
      try {
        await unlink(file);
      } catch {
        // The copy already holds the user's file; the original is written over later.
      }

      return target;
    } catch (error) {
      // A taken name is how a free one is found; anything else no name will fix.
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') return null;
    }
  }

  return null;
};
