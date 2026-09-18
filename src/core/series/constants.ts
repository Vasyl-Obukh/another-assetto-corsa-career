// Defaults and limits a championship is read against. The two the renderer's
// editor measures against as well - MAX_WEEKEND_DAYS and DEFAULT_MIN_MODELS -
// live in src/shared/constants/ instead, since the renderer may not reach here.

import type { SeriesGrid } from '../../shared/types/index.ts';

/**
 * AI strength a championship gets when neither it nor its class entries name
 * any.
 */
export const DEFAULT_SERIES_GRID: Required<SeriesGrid> = {
  aiLevel: 92,
  aiLevelMin: 84,
  aiAggression: 30,
};
