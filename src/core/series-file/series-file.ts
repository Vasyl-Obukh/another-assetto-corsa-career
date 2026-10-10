// Reading a championship off disk, and writing one back.
//
// This is the job a TypeScript library did not have. Authored as a constant,
// Discipline.SPORTSCAR is a real reference and a renamed member is a compile
// error. A JSON file carries the string "sportscar" instead, and a typo would
// fail quietly somewhere far from the file. So what the compiler used to do
// happens here, at load, and is reported the way validateSeries reports.
//
// A spec is the exception. The user may make their own, so the set a spec
// belongs to is only known once their class layer is resolved - which is why
// validateSeries checks it, against the catalogue it is handed.
//
// Two layers on purpose. This one answers "is this a Championship at all", and
// validateSeries answers "is it a coherent one". A file that fails here never
// reaches the second, because there is nothing coherent to ask about.

import { SEASON_LENGTHS, WEEKDAYS } from './constants.ts';
import type { ParsedSeries } from './types.ts';
import {
  readEntry,
  readFormat,
  readGeneratedWeather,
  readGrid,
  readOptionalNumber,
  readOptionalString,
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
 * behind it: every string that indexes a closed catalogue - a discipline, a
 * session type, a weather type - is checked against that catalogue's own
 * members, because those are the ones that fail quietly rather than loudly. A
 * spec is checked for shape only, since the user may have made it.
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
    typeof raw.version === 'number' || report.bad('version', raw.version),
    (typeof raw.id === 'string' && raw.id !== '') || report.bad('id', raw.id),
    typeof raw.name === 'string' || report.bad('name', raw.name),
    readList(raw.entries, 'entries', (entry, at) => readEntry(entry, at, report)),
    readList(raw.rounds, 'rounds', (round, at) => readRound(round, at, report)),
    readList(raw.eventFormats, 'eventFormats', (format, at) => readFormat(format, at, report)),
    readList(raw.pointsSystems, 'pointsSystems', (points, at) => readPoints(points, at, report)),
    raw.teams === undefined
      || readList(raw.teams, 'teams', (team, at) => readTeam(team, at, report)),
    readPrizes(raw.prizes, 'prizes', report),
    readGrid(raw.grid, 'grid', report),
    readGeneratedWeather(raw.generatedWeather, 'generatedWeather', report),
    raw.seasonLength === undefined
      || report.closedSet(raw.seasonLength, SEASON_LENGTHS, 'seasonLength'),
    raw.raceWeekday === undefined
      || report.closedSet(raw.raceWeekday, WEEKDAYS, 'raceWeekday'),
    readOptionalNumber(raw.entryFee, 'entryFee', report),
    readOptionalString(raw.description, 'description', report),
  ].every(Boolean);

  // Cast rather than rebuilt: every value with a catalogue behind it has been
  // checked, and the rest is the shape validateSeries reads next. The same
  // stance readContentCache takes on the content cache, for the same reason.
  return { series: readable ? raw as unknown as Championship : null, problems };
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
