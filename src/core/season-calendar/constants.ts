// Fixed points the dating works from.

/**
 * Which day of the week a race falls on, as getUTCDay numbers it.
 *
 * Sunday. Real race weekends end on one, and anchoring the race rather than the
 * weekend's opening day is what lets a two-day and a three-day weekend share a
 * calendar without their races drifting apart.
 */
export const RACE_WEEKDAY = 0;
