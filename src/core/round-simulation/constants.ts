// How much luck a simulated session holds. The units are AI levels, the scale a
// driver's strength offset is drawn on - DRIVER_STRENGTH_SPREAD is 2, so two
// drivers of a class are at most four apart before luck.

/**
 * Either way a car's pace may move in a simulated qualifying session.
 */
export const QUALIFY_JITTER = 2;

/**
 * Either way a car's pace may move in a simulated race. More than qualifying,
 * since a race has traffic, strategy and incidents a single lap does not.
 */
export const RACE_JITTER = 3;

/**
 * What each grid slot further back costs a car over a race, in AI levels. A
 * pole sitter of a 24-car grid is worth about three levels more than whoever
 * starts last, so a reverse grid holds for a while rather than sorting itself
 * out at the first corner.
 */
export const GRID_SLOT_COST = 0.12;

/**
 * Keeps the classes of a multi-class grid in their entry-list order overall.
 * Larger than any spread of strength, so a slower class never finishes ahead
 * of a faster one - points are paid on class positions, and the overall order
 * only has to be believable.
 */
export const CLASS_GAP = 100;

/**
 * A simulated lap's base time in milliseconds. Only the differences between
 * cars matter, since a simulated lap time is used to find the fastest lap and
 * nothing else.
 */
export const LAP_BASE_MS = 90_000;

/**
 * Milliseconds of lap time one AI level of strength is worth.
 */
export const LAP_MS_PER_LEVEL = 150;

/**
 * How much a simulated best lap may vary, in milliseconds.
 */
export const LAP_JITTER_MS = 900;
