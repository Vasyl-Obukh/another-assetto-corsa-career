// What a new career may start with. Shared because main checks a request
// against the same figures the New career page offers.

/**
 * The amounts of money a new career may start with, smallest first - the stops
 * of the New career page's slider.
 *
 * Placeholders until the economy (Phase 7) prices the cars and entries they
 * have to pay for.
 */
export const STARTING_MONEY_STOPS: readonly number[] = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

/**
 * The money a new career starts with unless the player moves the slider.
 */
export const DEFAULT_STARTING_MONEY = 100_000;

/**
 * The lowest rating of the ladder's top rung.
 *
 * A placeholder, like `RATING_PER_TIER`, until rating (Phase 8) sets the real
 * figures. Nothing reads a rating yet.
 */
export const TOP_RATING_FLOOR = 1800;

/**
 * How much lower each rung's lowest rating is than the rung above it.
 */
export const RATING_PER_TIER = 200;

/**
 * The earliest year a career's first season may open in.
 */
export const MIN_START_YEAR = 1950;

/**
 * The latest year a career's first season may open in.
 */
export const MAX_START_YEAR = 2100;
