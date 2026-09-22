// Fixed points the dating works from.

/**
 * Which day of the week a race falls on, as getUTCDay numbers it.
 *
 * Sunday. Real race weekends end on one, and anchoring the race rather than the
 * weekend's opening day is what lets a two-day and a three-day weekend share a
 * calendar without their races drifting apart.
 */
export const RACE_WEEKDAY = 0;

/**
 * The shape an ISO calendar date has to have.
 *
 * Checked rather than trusted: every date here is arithmetic on a day number,
 * and a string that is not a date would come back as NaN rather than as an
 * error a caller could read.
 */
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * How many characters an ISO YYYY-MM-DD date is, for cutting one out of a full
 * ISO timestamp.
 */
export const ISO_DATE_LENGTH = 10;
