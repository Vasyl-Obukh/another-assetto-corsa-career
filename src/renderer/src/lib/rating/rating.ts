// A career's rating log read for the screens that show it: the seasons it
// holds, the ratings as they stood after any line, a season's change and what
// each championship came to. Derived on every read - the log itself, and the
// ratings it ends on, are the only things stored.

import type {
  RatingFilter, RatingPoint, RatingSeriesTotal, RatingSnapshot,
} from './types.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Career, Discipline, RatingLine } from '../../../../shared/types';
import { ratingFloor } from '../../../../shared/utils/career-eligibility';

/**
 * The lines a session moved a rating with.
 */
const SESSION_KINDS: readonly RatingLine['kind'][] = ['race', 'qualifying'];

/**
 * The lines that moved a level.
 */
const LEVEL_KINDS: readonly RatingLine['kind'][] = ['opening', 'promotion', 'drop', 'lift'];

/**
 * Whether a line is one a filter shows.
 * @param line The line
 * @param filter The filter
 * @returns True when it is shown
 */
export const ratingShownBy = (line: RatingLine, filter: RatingFilter): boolean => {
  if (filter === 'sessions') return SESSION_KINDS.includes(line.kind);
  if (filter === 'levels') return LEVEL_KINDS.includes(line.kind);

  return true;
};

/**
 * Every season a log has a line in, newest first.
 * @param log The career's rating log
 * @returns The seasons' indices
 */
export const ratingSeasons = (log: readonly RatingLine[]): number[] => (
  [...new Set(log.map((line) => line.season))].sort((left, right) => right - left)
);

/**
 * Every rating as it stood after each line, oldest first.
 *
 * A line carries the rating it left only for the discipline it moved, so the
 * rest are carried along from the line before - from the opening, where every
 * discipline starts on its rung's floor.
 * @param log The career's rating log
 * @returns A snapshot per line, in the log's order
 */
export const ratingSnapshots = (log: readonly RatingLine[]): RatingSnapshot[] => {
  const opening = log.find((line) => line.kind === 'opening');
  const start = opening?.global ?? ratingFloor(opening?.tier ?? 1);
  const disciplines = Object.fromEntries(DISCIPLINES.map((one) => [one, start])) as Record<Discipline, number>;
  let global = start;

  return log.map((line) => {
    if (line.discipline && line.rating !== undefined) disciplines[line.discipline] = line.rating;
    global = line.global;

    return { disciplines: { ...disciplines }, global };
  });
};

/**
 * The chart's points: the opening, and every session that moved a rating.
 * @param log The career's rating log
 * @returns The points, oldest first
 */
export const ratingPoints = (log: readonly RatingLine[]): RatingPoint[] => {
  const snapshots = ratingSnapshots(log);

  return log.flatMap((line, at) => (
    line.kind === 'opening' || SESSION_KINDS.includes(line.kind) ? [{ line, ratings: snapshots[at] }] : []
  ));
};

/**
 * Every rating as a season opened: as the season before it closed, or as the
 * career opened.
 * @param career The career
 * @param season The season's index
 * @returns The ratings
 */
export const seasonOpening = (career: Pick<Career, 'ratingLog' | 'rating' | 'globalRating'>, season: number): RatingSnapshot => {
  const snapshots = ratingSnapshots(career.ratingLog);
  const before = career.ratingLog.findLastIndex((line) => line.season < season);
  const first = career.ratingLog.findIndex((line) => line.season === season);
  if (before >= 0) return snapshots[before];
  // A season that opened the career starts where the opening line put it.
  if (first >= 0 && career.ratingLog[first].kind === 'opening') return snapshots[first];

  return { disciplines: career.rating, global: career.globalRating };
};

/**
 * Whether a discipline has been raced: whether any session ever moved it.
 * @param log The career's rating log
 * @param discipline The discipline
 * @returns True once it has
 */
export const hasRaced = (log: readonly RatingLine[], discipline: Discipline): boolean => (
  log.some((line) => line.discipline === discipline && SESSION_KINDS.includes(line.kind))
);

/**
 * What each championship and historic event moved its discipline by, most
 * first.
 * @param lines The lines to total
 * @returns The totals
 */
export const ratingSeriesTotals = (lines: readonly RatingLine[]): RatingSeriesTotal[] => {
  const totals = new Map<string, RatingSeriesTotal>();
  for (const line of lines) {
    if (!SESSION_KINDS.includes(line.kind) || !line.series || !line.discipline) continue;
    const key = `${line.season}:${line.series}:${line.edition ?? 0}`;
    const held = totals.get(key) ?? {
      series: line.series,
      name: line.seriesName ?? line.series,
      season: line.season,
      edition: line.edition ?? 0,
      discipline: line.discipline,
      historic: line.historic === true,
      sessions: 0,
      change: 0,
    };
    totals.set(key, { ...held, sessions: held.sessions + 1, change: held.change + line.change });
  }

  return [...totals.values()].sort((left, right) => right.change - left.change);
};

/**
 * The lines one round of a championship moved, as its page shows them.
 * @param log The career's rating log
 * @param run Which run of the championship, and which round
 * @param run.series The championship, by id
 * @param run.season The season's index
 * @param run.edition Which of the season's editions
 * @param run.round The round, by id
 * @returns The round's lines, oldest first
 */
export const roundRatingLines = (
  log: readonly RatingLine[],
  run: { series: string; season: number; edition: number; round: string },
): RatingLine[] => log.filter((line) => (
  line.series === run.series && line.season === run.season && line.edition === run.edition
  && line.round === run.round && (SESSION_KINDS.includes(line.kind) || line.kind === 'promotion')
));
