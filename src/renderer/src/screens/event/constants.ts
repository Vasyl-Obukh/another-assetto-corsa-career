/**
 * How many sessions the event list of a round's skeleton holds - practice,
 * qualifying and two races, a common event.
 */
export const EVENT_SKELETON = 4;

/**
 * What the event list selects to show the round's own results rather than
 * one session's.
 */
export const SUMMARY = -1;

/**
 * How many cars a session result's skeleton lists while the archive is read.
 */
export const RESULT_SKELETON = 6;

/**
 * The places each race's winners card lists, which a loading card shows for
 * real.
 */
export const WINNER_PLACES = [1, 2, 3] as const;

/**
 * The class filter's value for every class at once. Not a class id: those are
 * the championship's own, and none is spelled with a space.
 */
export const ALL_CLASSES = 'all classes';
