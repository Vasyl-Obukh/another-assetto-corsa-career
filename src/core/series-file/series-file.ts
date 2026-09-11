// Reading a championship off disk, and writing one back.
//
// This is the job a TypeScript library did not have. Authored as a constant,
// CarSpec.GT3_2010S was a real reference and a renamed spec was a compile
// error. A JSON file carries the string "gt3-2010s" instead, and a typo would
// index SPEC_CARS to undefined without a word said - reading as a class nobody
// owns rather than as a mistake. So what the compiler used to do happens here,
// at load, and is reported the way validateSeries reports.
//
// Two layers on purpose. This one answers "is this a Championship at all", and
// validateSeries answers "is it a coherent one". A file that fails here never
// reaches the second, because there is nothing coherent to ask about.

import type { ParsedSeries } from './types.ts';
import {
  migrateSeries,
  readEntry,
  readFormat,
  readOptionalNumber,
  readPoints,
  readPrizes,
  readRound,
  readTeam,
  reporter,
} from './utils.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship } from '../../shared/types/index.ts';
import { isRecord } from '../../shared/utils/coerce/index.ts';

export type { ParsedSeries } from './types.ts';
export { SERIES_FILE_EXTENSION } from './constants.ts';

/**
 * Reads a championship out of parsed JSON.
 *
 * Shallow where the shape is obvious and deep where a value has a closed set
 * behind it: every string that indexes a catalogue - a spec, a discipline, a
 * session type, a weather type - is checked against that catalogue's own
 * members, because those are the ones that fail quietly rather than loudly.
 *
 * Structural only. Whether the championship makes sense is validateSeries, and
 * whether the library can race it is seriesAvailability.
 * @param raw The value JSON.parse returned
 * @param file What to call the file in a problem, usually its name
 * @returns The championship and any problems; the championship is null when the
 * file could not be read as one at all
 */
export const parseSeries = (raw: unknown, file: string): ParsedSeries => {
  const problems: AppErrorInfo[] = [];
  const report = reporter(file, problems);

  if (!isRecord(raw)) {
    problems.push(appErrorInfo('seriesFile.notAnObject', { file }));

    return { series: null, problems };
  }

  // Migrated before it is read rather than after: an older revision is checked
  // against the shape this build understands, so every field path in a problem
  // names where the value is now.
  const record = migrateSeries(raw);

  /**
   * Checks every entry of a list the file has to carry.
   * @param value The list
   * @param field What it is called in the file
   * @param read The check one entry has to pass
   * @returns True when the list is one and every entry reads
   */
  const readList = (
    value: unknown,
    field: string,
    read: (entry: unknown, at: string) => boolean,
  ): boolean => (
    Array.isArray(value)
      // Mapped before every(), so a file with three bad rounds names three.
      ? value.map((entry, at) => read(entry, `${field}[${at}]`)).every(Boolean)
      : report.bad(field, value)
  );

  // Collected rather than short-circuited: a file is read once, and naming one
  // fault at a time would mean fixing it to be told about the next.
  const readable = [
    typeof record.version === 'number' || report.bad('version', record.version),
    (typeof record.id === 'string' && record.id !== '') || report.bad('id', record.id),
    typeof record.name === 'string' || report.bad('name', record.name),
    readList(record.entries, 'entries', (entry, at) => readEntry(entry, at, report)),
    readList(record.rounds, 'rounds', (round, at) => readRound(round, at, report)),
    readList(record.weekendFormats, 'weekendFormats', (format, at) => readFormat(format, at, report)),
    readList(record.pointsSystems, 'pointsSystems', (points, at) => readPoints(points, at, report)),
    record.teams === undefined
      || readList(record.teams, 'teams', (team, at) => readTeam(team, at, report)),
    readPrizes(record.prizes, 'prizes', report),
    readOptionalNumber(record.entryFee, 'entryFee', report),
    readOptionalNumber(record.drops, 'drops', report),
  ].every(Boolean);

  // Cast rather than rebuilt: every value with a catalogue behind it has been
  // checked, and the rest is the shape validateSeries reads next. The same
  // stance readContentCache takes on the content cache, for the same reason.
  return { series: readable ? record as unknown as Championship : null, problems };
};

/**
 * Reads a championship out of the text of a file.
 * @param text The file's contents
 * @param file What to call it in a problem
 * @returns The championship and any problems
 */
export const readSeries = (text: string, file: string): ParsedSeries => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      series: null,
      problems: [appErrorInfo('seriesFile.unparseable', { file, reason: (error as Error).message })],
    };
  }

  return parseSeries(parsed, file);
};

/**
 * Serialises a championship back to the text of a file.
 *
 * Two spaces and a trailing newline, which is how the shipped files are
 * written - so a fork of one diffs against it cleanly.
 * @param series The championship to write
 * @returns The file's contents
 * @throws When the championship holds something JSON cannot carry
 */
export const writeSeries = (series: Championship): string => {
  const text = JSON.stringify(series, null, 2);
  if (text === undefined) throw new AppError('seriesFile.unwritable', { series: series.id });

  return `${text}\n`;
};
