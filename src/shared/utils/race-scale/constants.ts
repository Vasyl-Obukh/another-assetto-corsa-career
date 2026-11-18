/**
 * The steps a race may be shortened by, as the factor its laps are divided by,
 * from the full race up. One means the race runs as the championship states it.
 *
 * Named steps rather than any number, so the clock always runs at a whole
 * multiple and a step reads as a share of the race - a half, a quarter, a
 * forty-eighth, which turns a 24-hour race into half an hour.
 */
export const RACE_SCALES = [1, 2, 3, 4, 6, 8, 12, 16, 24, 48] as const;

/**
 * The fewest laps a shortened race may come to. A step that would go under it
 * is not offered, so a sprint stops early and a short race cannot be shortened.
 */
export const MIN_SCALED_LAPS = 5;

/**
 * The fastest the clock is ever sent at, whatever a race's own multiplier and
 * the step it is shortened by come to together.
 *
 * Provisional: equal to the largest step, since where Assetto Corsa itself
 * stops honouring `TIME_MULT` was never measured.
 */
export const MAX_TIME_MULTIPLIER = 48;
