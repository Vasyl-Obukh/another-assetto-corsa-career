// The ladder's figures and the rating's. Shared because main moves a career's
// rating on them and the renderer draws the ladder and explains every change
// with the same numbers.

/**
 * The rating each rung opens at, the top rung first.
 *
 * Each rung is 500 wider than the one below it - 1,000, 1,500, 2,000, 2,500 -
 * so leaving Rookie takes a few months and reaching Platinum takes years. A
 * career opens on the floor of the rung New career picked. Every rung below
 * the fifth shares Rookie's floor, as it shares its colour.
 */
export const RATING_FLOORS: readonly number[] = [8000, 5500, 3500, 2000, 1000];

/**
 * How wide the top rung is taken to be, for the one figure that needs it: its
 * field, at its middle. 500 wider than the rung below, as every rung is.
 */
export const TOP_RUNG_WIDTH = 3000;

/**
 * What a field ahead of you by this much is expected to beat you 10 times in
 * 11 - Elo's 400, on this ladder's scale.
 */
export const RATING_SPREAD = 3500;

/**
 * The most one race can move a rating, when it is won from a field expected to
 * beat you every time. Times the session's weight and the rating speed.
 */
export const RATING_K = 300;

/**
 * The most one race can take away, at a rating speed of 1: a third of
 * `RATING_K`, so a crash costs a bad afternoon rather than a season. Times the
 * session's weight and the rating speed, as K is.
 */
export const RATING_MAX_LOSS = 100;

/**
 * What a qualifying counts for beside a race.
 */
export const QUALIFYING_WEIGHT = 0.25;

/**
 * How much each point of AI strength over the player's own Opponents setting
 * rates a driver above their rung's field - and each point under, below it.
 */
export const RATING_PER_POINT = 75;

/**
 * The lowest a rating can fall. There is no ceiling: high enough, a win earns
 * next to nothing while a crash still costs the most a race can take.
 */
export const MIN_RATING = 1;

/**
 * The typical entry fee a round of each rung charges, 1 being the top - what
 * sponsor figures, a historic purse raced from a lower rung and a rented car's
 * rent are scaled by. Every rung below the last shares its figure, as it
 * shares its colour.
 */
export const RUNG_FEE: readonly number[] = [25_000, 10_000, 5_000, 3_000, 700];
