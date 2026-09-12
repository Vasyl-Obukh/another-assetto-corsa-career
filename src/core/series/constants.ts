// Defaults and limits a championship is read against. The two the renderer's
// editor measures against as well - MAX_WEEKEND_DAYS and DEFAULT_MIN_MODELS -
// live in src/shared/constants/ instead, since the renderer may not reach here.

import type { SeriesGrid } from '../../shared/types/index.ts';

/**
 * Which revision of the series schema this build reads.
 *
 * A championship declaring anything else is refused rather than guessed at: a
 * series is a document users fork, export and import, and reading an unknown
 * revision leniently is how a field silently means two things.
 *
 * Stays 1 until the app is released: before then a format change means
 * deleting the out-of-date file rather than writing a migration (see CLAUDE.md).
 * The field stays on the document so a future migration has something to read.
 */
export const SERIES_FORMAT_VERSION = 1;

/**
 * AI strength a championship gets when neither it nor its class entries name
 * any.
 */
export const DEFAULT_SERIES_GRID: Required<SeriesGrid> = {
  aiLevel: 92,
  aiLevelMin: 84,
  aiAggression: 30,
};
