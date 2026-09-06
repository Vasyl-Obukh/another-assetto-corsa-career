// Reading a directory of championship files, and putting what came back in the
// order a career would climb them.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { LoadedSeries } from './types.ts';
import { appErrorInfo } from '../../shared/errors/index.ts';
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
