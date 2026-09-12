import { readFile, rename, writeFile } from 'node:fs/promises';

import { ARCHIVE_NAME } from './constants.ts';
import type { RaceProgress } from './types.ts';
import { summarise } from '../../core/results/index.ts';
import type { RaceOut, ResultRecord, WeekendState } from '../../shared/types/index.ts';

/**
 * Reads a JSON file, treating anything unreadable as absent.
 *
 * Tolerant on purpose, and for the same reason the settings store is: a draft
 * race the user hand-edited into nonsense must not be the reason the app
 * refuses to open a screen.
 * @param file Absolute path to the file
 * @returns The parsed value, or null when it could not be read
 */
export const readJson = async <T>(file: string): Promise<T | null> => {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Could not read ${file}; ignoring it.`, error);
    }

    return null;
  }
};

/**
 * Writes a JSON file through a temporary name, so a crash cannot truncate it.
 * @param file Absolute path to write to
 * @param value The value to serialise
 * @returns Resolves once the file is in place, or once the failure is logged
 */
export const writeJson = async (file: string, value: unknown): Promise<void> => {
  const tmp = `${file}.tmp`;
  try {
    await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await rename(tmp, file);
  } catch (error) {
    console.error(`Could not save ${file}.`, error);
  }
};

/**
 * Whether a name is one of our archives rather than a path.
 *
 * Checked before the name is joined onto the results folder, so a crafted
 * request cannot reach outside it. The archive names archiveResults writes are
 * ISO timestamps with the colons and dots replaced, so the alphabet is narrow.
 * @param file The name to check
 * @returns True when it is safe to join
 */
export const isArchiveName = (file: string): boolean => ARCHIVE_NAME.test(file);

/**
 * Reads an archive into the record the results screen renders.
 *
 * The envelope is `{ recordedAt, raceId, raceName, result }`; a file holding a
 * bare race_out.json is read as the payload itself, which is what AC's own
 * out/race_out.json is.
 * @param file The archive's file name, without its folder
 * @param full Absolute path to it
 * @returns The record, or null when the file held no usable result
 */
export const readRecord = async (file: string, full: string): Promise<ResultRecord | null> => {
  const parsed = await readJson<Record<string, unknown>>(full);
  if (!parsed) return null;

  const wrapped = parsed.result as RaceOut | undefined;
  const result = wrapped ?? (parsed as unknown as RaceOut);
  if (!Array.isArray(result.sessions)) return null;

  return {
    file,
    // The file name is the timestamp, so a hand-copied archive with no envelope
    // still sorts and dates correctly.
    recordedAt: (parsed.recordedAt as string | undefined) ?? file.replace(/\.json$/, ''),
    ...(typeof parsed.raceId === 'string' ? { raceId: parsed.raceId } : {}),
    ...(typeof parsed.raceName === 'string' ? { raceName: parsed.raceName } : {}),
    summary: summarise(result),
  };
};

/**
 * How far through a weekend the app is, or null when none is under way.
 *
 * The whole of the series editor's lock. A weekend that has run every launch
 * is finished rather than under way, even though its state stays on disk until
 * a reset or a different race replaces it.
 * @param state The weekend's saved progress, or null when there is none
 * @param raceId What to call the race when there is no state to name it
 * @param inFlight Whether a launch is with Content Manager right now
 * @returns The progress, or null when nothing has started, everything has
 * finished, or both
 */
export const progressOf = (
  state: WeekendState | null,
  raceId: string,
  inFlight: boolean,
): RaceProgress | null => {
  const completed = state?.completed.length ?? 0;
  const finished = state !== null && completed >= state.launchCount;
  if (!inFlight && (completed === 0 || finished)) return null;

  return { raceId: state?.raceId ?? raceId, completed, inFlight };
};
