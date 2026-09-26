/**
 * The rail's entry for every spec at once. Not a class id: those never start
 * with a slash.
 */
export const ALL_SPECS = '/all';

/**
 * The rail's entry for the specs picked lately.
 */
export const RECENT_SPECS = '/recent';

/**
 * How many specs "Recently used" remembers.
 */
export const RECENT_LIMIT = 6;

/**
 * How many cars of a spec its tile pictures.
 */
export const TILE_CARS = 3;

/**
 * How long the search box waits for typing to stop before asking main which
 * cars match, in milliseconds.
 */
export const SEARCH_DEBOUNCE_MS = 250;

/**
 * The most cars a search asks for. A term that matches more is too broad to
 * narrow the specs by.
 */
export const SEARCH_CARS = 200;
