// Reading a directory of championship files, writing one back, and putting what
// came back in the order a career would climb them.

import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  MAX_SERIES_ID_LENGTH,
  RESERVED_FILE_NAMES,
  SERIES_ID_PATTERN,
} from './constants.ts';
import type { LoadedSeries } from './types.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship } from '../../shared/types/index.ts';
import { readSeries, SERIES_FILE_EXTENSION } from '../series-file/index.ts';

/**
 * The lowest rung a championship can be entered at.
 *
 * Tier 1 is the top, so the highest number is the way in - a multi-class series
 * is reached at whichever of its classes sits furthest down the ladder.
 * @param series The championship
 * @returns Its entry tier, or 0 when it declares no class at all
 */
export const entryTier = (series: Championship): number => series.entries.reduce(
  (lowest, entry) => Math.max(lowest, entry.ladder.tier),
  0,
);

/**
 * Orders championships the way a career climbs them.
 *
 * Derived from the tiers rather than from the file names or an authored index:
 * a series knows which rung it sits on, and a library that sorted on anything
 * else would have to be renumbered by hand every time one was added.
 * @param left One championship
 * @param right Another
 * @returns Negative when the first is entered lower down the ladder
 */
export const byLadder = (left: LoadedSeries, right: LoadedSeries): number => (
  entryTier(right.series) - entryTier(left.series)
    || left.series.name.localeCompare(right.series.name)
);

/**
 * Reads every championship file in one directory.
 *
 * A directory that is not there is not a problem - the user has simply written
 * no championships yet - but one that cannot be read is, since that is a
 * permission or a disk saying something.
 * @param dir Absolute path to the directory
 * @returns What read, and what did not
 */
export const readSeriesDir = async (
  dir: string,
): Promise<{ series: { series: Championship; file: string }[]; problems: AppErrorInfo[] }> => {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';

    return {
      series: [],
      problems: missing ? [] : [appErrorInfo('seriesFile.directoryUnreadable', {
        dir, reason: (error as Error).message,
      })],
    };
  }

  const files = names.filter((name) => name.endsWith(SERIES_FILE_EXTENSION)).sort();
  const series: { series: Championship; file: string }[] = [];
  const problems: AppErrorInfo[] = [];

  for (const name of files) {
    let text: string;
    try {
      // Sequential: a library is a handful of small files, and reading them in
      // order is what makes a duplicate id report the same way every run.
      text = await readFile(path.join(dir, name), 'utf8');
    } catch (error) {
      problems.push(appErrorInfo('seriesFile.unparseable', {
        file: name, reason: (error as Error).message,
      }));

      continue;
    }

    const read = readSeries(text, name);
    problems.push(...read.problems);
    if (read.series) series.push({ series: read.series, file: name });
  }

  return { series, problems };
};

/**
 * The file a championship is written as, when it has no file already.
 *
 * Only for a championship the folder does not hold yet: anything already on
 * disk is rewritten under the name it was read from, since a file's name and
 * the id inside it are allowed to disagree.
 * @param id The championship's id, which must already be a safe one
 * @returns The file name
 */
export const seriesFileName = (id: string): string => `${id}${SERIES_FILE_EXTENSION}`;

/**
 * Whether an id can safely become a file name.
 * @param id The championship's id
 * @returns True when it may be written
 */
export const isSafeSeriesId = (id: string): boolean => (
  SERIES_ID_PATTERN.test(id)
    && id.length <= MAX_SERIES_ID_LENGTH
    && !RESERVED_FILE_NAMES.has(id)
);

/**
 * Refuses an id that cannot be a file name.
 *
 * Refused rather than repaired: the id is what the library keys on and what
 * `forkedFrom` points at, so rewriting it would leave the file and the document
 * disagreeing about which championship this is.
 * @param id The championship's id
 * @throws When the id is not one a file can be called
 */
export const assertSafeSeriesId = (id: string): void => {
  if (isSafeSeriesId(id)) return;

  // A reserved name passes the pattern perfectly well, so it needs its own
  // sentence - "use lower-case letters" is no help to someone who wrote `nul`.
  throw RESERVED_FILE_NAMES.has(id)
    ? new AppError('seriesFile.idReserved', { series: id })
    : new AppError('seriesFile.idUnsafe', { series: id });
};

/**
 * The first id in a series of candidates that nothing has taken.
 *
 * Unbounded: the loop only runs as long as the user has that many already, and
 * a ceiling would refuse for a reason they could not act on.
 * @param first The candidate to prefer
 * @param nth Builds the candidate after the first, counting from two
 * @param taken Everything already in use, lower-cased
 * @returns The first free candidate
 */
const firstFree = (
  first: string,
  nth: (n: number) => string,
  taken: ReadonlySet<string>,
): string => {
  if (!taken.has(first.toLowerCase())) return first;

  for (let n = 2; ; n += 1) {
    const candidate = nth(n);
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
};

/**
 * An id for a championship the app is about to mint.
 *
 * A UUID rather than something derived from a name, because an id is not a
 * thing anyone reads: the library keys on it, forkedFrom points at it and
 * results are filed under it, so it can never change - and a name-shaped id
 * invites the idea that renaming should move it.
 *
 * A canonical UUID is lower-case hex in hyphenated groups, so it satisfies
 * SERIES_ID_PATTERN and the safety layer needs no exception for it.
 * @returns An id nothing else holds
 */
export const newSeriesId = (): string => randomUUID();

/**
 * A file name for a championship that no other file has spent.
 *
 * Needed because a name and the id inside it may disagree: `lotus-cup.json` can
 * hold something else entirely, and writing a new championship over it would
 * destroy a file of the user's. The id is unchanged - only the name moves.
 * @param id The championship's id, which must already be a safe one
 * @param taken Every file stem already in use, lower-cased
 * @returns A file name nothing holds
 */
export const freeSeriesFileName = (id: string, taken: ReadonlySet<string>): string => (
  seriesFileName(firstFree(id, (n) => `${id}-${n}`, taken))
);

/**
 * Every id the user's folder already spends a file on.
 *
 * Read from the directory rather than from the loaded library, because a file
 * that failed to parse is in neither - and deriving a free name from what
 * loaded would overwrite the very file the user is trying to fix.
 * @param dir Directory the user's own championships live in
 * @returns The file stems, lower-cased, or an empty set when there is no folder
 */
export const takenSeriesIds = async (dir: string): Promise<Set<string>> => {
  try {
    const names = await readdir(dir);

    return new Set(names
      .filter((name) => name.endsWith(SERIES_FILE_EXTENSION))
      .map((name) => name.slice(0, -SERIES_FILE_EXTENSION.length).toLowerCase()));
  } catch {
    // A folder that is not there spends no names, which is the same answer as
    // one that is empty. Anything worse readSeriesDir reports already.
    return new Set();
  }
};
