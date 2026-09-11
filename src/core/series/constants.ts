// Defaults and limits a championship is read against.

import type { SeriesGrid } from '../../shared/types/index.ts';

/**
 * Which revision of the series schema this build reads.
 *
 * A championship declaring anything else is refused rather than guessed at:
 * a series is a document users fork, export and import, and reading an unknown
 * revision leniently is how a field silently means two things.
 *
 * Revision 3 replaced a class entry's `entrants` count with its seat list;
 * migrateSeries carries a revision 2 file across, which is what the field was
 * put here for in the first place.
 */
export const SERIES_FORMAT_VERSION = 3;

/**
 * How many days a race weekend may run over.
 *
 * Friday to Sunday. Anything longer is an authoring mistake rather than a
 * format we cannot express.
 */
export const MAX_WEEKEND_DAYS = 3;

/**
 * How many distinct models a spec needs installed before it is raceable.
 *
 * A spec is a grid, so it is satisfied by whichever of it the user owns - but
 * one installed model is a field of clones rather than the championship, which
 * is a different thing from the series being available.
 */
export const DEFAULT_MIN_MODELS = 3;

/**
 * AI strength a championship gets when neither it nor its class entries name
 * any.
 */
export const DEFAULT_SERIES_GRID: Required<SeriesGrid> = {
  aiLevel: 92,
  aiLevelMin: 84,
  aiAggression: 30,
};
