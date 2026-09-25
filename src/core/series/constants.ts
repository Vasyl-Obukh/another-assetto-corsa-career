// Defaults and limits a championship is read against. The ones the renderer's
// editor measures against as well - MAX_WEEKEND_DAYS, DEFAULT_MIN_MODELS and
// MAX_GRID_OFFSET - live in src/shared/constants/ instead, since the renderer
// may not reach here.

/**
 * How far one driver's skill may sit either side of their class, drawn once a
 * season.
 *
 * Small on purpose: the class is what says how fast a field is, and this only
 * keeps twenty drivers from being twenty copies of one. Two points of AI_LEVEL
 * is roughly a few tenths a lap.
 */
export const DRIVER_STRENGTH_SPREAD = 2;

/**
 * How far one driver's aggression may sit either side of their class.
 */
export const DRIVER_AGGRESSION_SPREAD = 5;
