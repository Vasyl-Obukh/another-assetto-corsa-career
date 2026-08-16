/**
 * How long to coalesce move and resize events before saving, in milliseconds.
 */
export const SAVE_DEBOUNCE_MS = 400;

/**
 * Narrowest the window may be dragged.
 */
export const MIN_WIDTH = 940;

/**
 * Shortest the window may be dragged.
 */
export const MIN_HEIGHT = 620;

/**
 * How much of the window's width must land on a display for the saved position
 * to be reused. Enough of the title bar has to be reachable to drag it back.
 */
export const MIN_VISIBLE_WIDTH = 120;

/**
 * How much of the window's height must land on a display for the saved position
 * to be reused.
 */
export const MIN_VISIBLE_HEIGHT = 40;
