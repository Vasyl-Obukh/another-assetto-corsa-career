// How a filler championship grows on the rung it repeats, per step up.

/**
 * How much longer every race of a filler runs, per step: a quarter, so Formula
 * Abarth's 28 minutes become 35 and then 42.
 */
export const FILLER_RACE_GROWTH = 0.25;

/**
 * How much the entry fee and the prize money grow, per step.
 */
export const FILLER_MONEY_GROWTH = 0.5;

/**
 * What the grown money is rounded to, so a fee reads as a fee rather than as
 * arithmetic.
 */
export const FILLER_MONEY_ROUNDING = 50;
