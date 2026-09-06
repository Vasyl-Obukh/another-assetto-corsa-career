// The championship library: the ones the app ships, and the ones the user
// wrote, as one list.
//
// The two halves are stored differently on purpose. A shipped championship is a
// TypeScript constant, so CarSpec.GT3_2010S is a real reference and a renamed
// spec is a compile error rather than a load-time report. A user's is a JSON
// file, because it has to be - they are written outside the build. Both end up
// as the same `Championship`, and everything above this module is blind to
// which was which except for the `origin` that says so.
//
// Later sources win: a user's file carrying a shipped championship's id
// replaces it rather than sitting beside it, which is what "I adjusted the
// app's one" means. Deleting that file puts the original back, because the
// override is the file's existence and nothing else.

import { SHIPPED_SERIES } from './shipped/index.ts';
import type { LoadedLibrary, LoadedSeries } from './types.ts';
import { byLadder, readSeriesDir } from './utils.ts';
import { appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';

export { SHIPPED_SERIES } from './shipped/index.ts';
export type { LoadedLibrary, LoadedSeries } from './types.ts';

/**
 * Reads the championship library.
 *
 * Tolerant of the user's half, the way the content scan is: a file that cannot
 * be read is reported and skipped, never thrown. One bad championship must not
 * be the reason the list is empty - and the shipped half is compiled in, so it
 * cannot fail to load at all.
 * @param userDir Directory the user's own championships live in, if any
 * @returns Every championship, in ladder order, and everything wrong with the
 * user files that did not read
 */
export const loadSeriesLibrary = async (userDir?: string): Promise<LoadedLibrary> => {
  const byId = new Map<string, LoadedSeries>(
    SHIPPED_SERIES.map((series) => [series.id, { series, origin: 'shipped', file: null }]),
  );

  const read = userDir === undefined
    ? { series: [], problems: [] as AppErrorInfo[] }
    : await readSeriesDir(userDir);
  const problems = [...read.problems];

  read.series.forEach(({ series, file }) => {
    const held = byId.get(series.id);
    // Two of the user's own files claiming one id is an authoring mistake
    // rather than an override, so the first read keeps it and the second is
    // reported. Colliding with a shipped id is the override, which is the point.
    if (held && held.origin !== 'shipped') {
      problems.push(appErrorInfo('seriesFile.duplicateId', {
        file, series: series.id, taken: held.file ?? series.id,
      }));

      return;
    }

    byId.set(series.id, { series, file, origin: held ? 'adjusted' : 'user' });
  });

  return { series: [...byId.values()].sort(byLadder), problems };
};

/**
 * Finds a championship by its id in a loaded library.
 *
 * Null rather than an error, matching the single-content lookups: a deep link
 * to a series that has been deleted is an ordinary outcome rather than a
 * failure.
 * @param library What loadSeriesLibrary returned
 * @param id The championship's id
 * @returns It, or null when the library holds none with that id
 */
export const seriesById = (
  library: LoadedLibrary,
  id: string,
): LoadedSeries | null => library.series.find((held) => held.series.id === id) ?? null;
