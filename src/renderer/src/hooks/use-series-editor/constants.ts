/**
 * How long the draft has to stand still before it is checked.
 *
 * Checking is a whole availability pass over the content scan, so it follows
 * the typing rather than racing it - the same arrangement the search boxes use.
 */
export const CHECK_DEBOUNCE_MS = 300;
