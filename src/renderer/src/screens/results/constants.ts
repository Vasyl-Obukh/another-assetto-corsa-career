import type { SessionFilter } from './types.ts';

/**
 * The session kinds the Results page filters by, in the order offered.
 */
export const SESSION_FILTERS: readonly SessionFilter[] = ['all', 'practice', 'qualify', 'race'];

/**
 * The championship filter's value for every weekend.
 */
export const ALL_CHAMPIONSHIPS = 'all';

/**
 * The championship filter's value for the weekends no championship ran.
 */
export const NO_CHAMPIONSHIP = 'none';

/**
 * How many weekend cards the page's skeleton holds while the archives are read.
 */
export const WEEKEND_SKELETON = 4;

/**
 * How many session rows each skeleton card holds.
 */
export const SESSION_SKELETON = 3;

/**
 * How many rows a result's skeleton lists while its archive is read.
 */
export const RESULT_ROWS = 8;

/**
 * How tall a weekend card's list of sessions grows before it scrolls: three
 * rows of h-9, so a long weekend does not stretch every card on its row.
 */
export const SESSION_SCROLL = 'max-h-27 overflow-y-auto';
