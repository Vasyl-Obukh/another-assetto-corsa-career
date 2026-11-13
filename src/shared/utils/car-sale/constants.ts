/**
 * What `weekdayOf` answers for a Monday, the day a sale week opens on.
 */
export const MONDAY = 1;

/**
 * The day a sale week closes on, counted from its Monday.
 */
export const LAST_DAY_OF_WEEK = 6;

/**
 * What a sale price is rounded to, in whole units of the career's currency.
 */
export const SALE_PRICE_STEP = 100;

/**
 * What the Deal of the week takes off, as whole percentages, inclusive.
 */
export const HEADLINE_OFF = [50, 70] as const;

/**
 * What every other car on sale takes off, as whole percentages, inclusive.
 */
export const DEAL_OFF = [20, 50] as const;

/**
 * The share of the Store on sale each week besides the Deal of the week, as
 * fractions of every car it could draw from, inclusive.
 */
export const SALE_SHARE = [0.05, 0.07] as const;
