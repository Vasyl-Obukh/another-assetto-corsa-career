/**
 * What a mod author writes when there is no figure. Compared lowercased and
 * trimmed.
 */
export const NOTHING_TOKENS = new Set(['', '-', '--', '?', 'n/a', 'na', 'n.a.', 'tbd', 'unknown']);

/**
 * The first run of digits and separators in a string.
 */
export const NUMERIC_RUN = /\d[\d.,]*/;

/**
 * How many digits a thousands group has.
 */
export const THOUSANDS_GROUP = 3;
