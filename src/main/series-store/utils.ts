// The decidable parts of the store's guards, kept pure so they can be read and
// tested without an Electron fake behind them.

import { roundRaceId } from '../../core/series/index.ts';
import type { Championship, SeriesOrigin, SeriesWeekendState } from '../../shared/types/index.ts';
import type { RaceProgress } from '../race-store/index.ts';

/**
 * Which round of a championship a weekend belongs to, if any.
 *
 * Matched exactly against every round's composed id, which roundRaceId keeps
 * unambiguous across championships.
 *
 * A round renamed or deleted since the weekend began stops matching and the
 * lock lifts, the same stale state `assertStateMatches` already discards.
 * @param series The championship to test against
 * @param progress How far through a weekend the race store is, or null
 * @returns The weekend, or null when none of this championship is under way
 */
export const weekendOf = (
  series: Championship,
  progress: RaceProgress | null,
): SeriesWeekendState | null => {
  if (!progress) return null;

  const round = series.rounds.find((one) => roundRaceId(series.id, one.id) === progress.raceId);
  if (!round) return null;

  return { round: round.id, completed: progress.completed, inFlight: progress.inFlight };
};

/**
 * Whether a championship is one the editor may write over.
 *
 * Only the user's own and the user's replacement of a shipped one: the app's
 * own championships are compiled in, so there is no file to write, and taking
 * a copy first is what Customise is for.
 * @param origin Where the championship was loaded from
 * @returns True when saving over it is allowed
 */
export const isEditable = (origin: SeriesOrigin): boolean => origin !== 'shipped';
