// What a new career may start with. Shared because main checks a request
// against the same figures the New career page offers.

/**
 * The amounts of money a new career may start with, smallest first - the stops
 * of the New career page's slider.
 *
 * Set against the car prices: the default buys a club racer such as the MX-5
 * Cup with money left for its fees, and the top stop a GT3 car.
 */
export const STARTING_MONEY_STOPS: readonly number[] = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

/**
 * The money a new career starts with unless the player moves the slider.
 */
export const DEFAULT_STARTING_MONEY = 100_000;

/**
 * The earliest year a career's first season may open in.
 */
export const MIN_START_YEAR = 1950;

/**
 * The latest year a career's first season may open in.
 */
export const MAX_START_YEAR = 2100;
