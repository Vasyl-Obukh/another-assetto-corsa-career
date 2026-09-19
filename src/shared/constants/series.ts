// Limits and defaults a championship is read against, in the shared layer
// because both the validator in src/core/series/ and the series editor in the
// renderer measure against them - and the renderer may not import core.

/**
 * How many days a race weekend may run over.
 *
 * Friday to Sunday. Anything longer is an authoring mistake rather than a
 * format we cannot express.
 */
export const MAX_WEEKEND_DAYS = 3;

/**
 * The fewest cars a reverse grid may turn round.
 *
 * Reversing one car changes nothing, so a smaller figure is a mistake rather
 * than a format.
 */
export const MIN_REVERSED = 2;

/**
 * How many distinct models a spec needs installed before it is raceable.
 *
 * A spec is a grid, so it is satisfied by whichever of it the user owns - but
 * one installed model is a field of clones rather than the championship, which
 * is a different thing from the series being available.
 */
export const DEFAULT_MIN_MODELS = 3;

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
