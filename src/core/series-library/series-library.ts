// The championship library: the ones the app ships, and the ones the user
// wrote, as one list - and the writing of that second half.
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

import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SHIPPED_SERIES } from './shipped/index.ts';
import type { LoadedLibrary, LoadedSeries } from './types.ts';
import {
  assertSafeSeriesId, byLadder, readSeriesDir, seriesFileName,
} from './utils.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship } from '../../shared/types/index.ts';
import { writeSeries } from '../series-file/index.ts';

export { SHIPPED_SERIES } from './shipped/index.ts';
export type { LoadedLibrary, LoadedSeries } from './types.ts';
// Re-exported because callers import the folder, never a file inside it.
export { freeSeriesFileName, nextSeriesId, takenSeriesIds } from './utils.ts';

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

/**
 * Resolves one of the user's own championship files, refusing anything that
 * would land outside their folder.
 *
 * The `file` arguments below are names read off disk rather than ones we
 * derived, which is what this really guards.
 * @param userDir Directory the user's own championships live in
 * @param file The file's name
 * @param series The championship it holds, for naming it in an error
 * @returns The absolute path
 * @throws When the name would reach outside the folder
 */
const inUserDir = (userDir: string, file: string, series: string): string => {
  const target = path.join(userDir, file);
  if (file === '' || path.dirname(path.resolve(target)) !== path.resolve(userDir)) {
    throw new AppError('seriesFile.idUnsafe', { series });
  }

  return target;
};

/**
 * Writes one championship into the user's own folder.
 *
 * Atomic, the way the settings store is: a crash partway through would leave a
 * truncated file, which reads back as a parse problem in the very library the
 * user was editing.
 * @param userDir Directory the user's own championships live in
 * @param series The championship to write
 * @param file The file to overwrite, or undefined to name a new one after the id
 * @returns The name of the file written
 * @throws When the id cannot be a file name, or the write fails
 */
export const saveUserSeries = async (
  userDir: string,
  series: Championship,
  file?: string,
): Promise<string> => {
  assertSafeSeriesId(series.id);

  const name = file ?? seriesFileName(series.id);
  const target = inUserDir(userDir, name, series.id);
  const text = writeSeries(series);

  try {
    await mkdir(userDir, { recursive: true });
    await writeFile(`${target}.tmp`, text, 'utf8');
    await rename(`${target}.tmp`, target);
  } catch (error) {
    throw new AppError('seriesFile.writeFailed', {
      series: series.id, reason: (error as Error).message,
    });
  }

  return name;
};

/**
 * Deletes one of the user's own championship files.
 *
 * Named by its file rather than by an id, because the two are allowed to
 * disagree: readSeriesDir keys on the id inside the document, so a name
 * computed from that id could delete a different file or none at all.
 * @param userDir Directory the user's own championships live in
 * @param file The file's name, as LoadedSeries.file carries it
 * @param series The championship it holds, for naming it in an error
 * @returns Resolves once it is gone, whether or not it was there
 * @throws When it could not be deleted for a reason other than being absent
 */
export const deleteUserSeries = async (
  userDir: string,
  file: string,
  series: string,
): Promise<void> => {
  const target = inUserDir(userDir, file, series);

  try {
    // force, so reverting twice is not an error - the second call asks for a
    // state the folder is already in.
    await rm(target, { force: true });
  } catch (error) {
    throw new AppError('seriesFile.deleteFailed', { series, reason: (error as Error).message });
  }
};
