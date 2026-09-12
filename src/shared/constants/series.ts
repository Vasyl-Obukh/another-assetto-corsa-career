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
 * How many distinct models a spec needs installed before it is raceable.
 *
 * A spec is a grid, so it is satisfied by whichever of it the user owns - but
 * one installed model is a field of clones rather than the championship, which
 * is a different thing from the series being available.
 */
export const DEFAULT_MIN_MODELS = 3;
