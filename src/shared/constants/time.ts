// Time unit conversions. Everything that would otherwise spell out 1000 or
// 60 * 60 * 1000 inline comes from here.

/**
 * Milliseconds in one second.
 */
export const MS_PER_SECOND = 1000;

/**
 * Seconds in one minute.
 */
export const SECONDS_PER_MINUTE = 60;

/**
 * Minutes in one hour.
 */
export const MINUTES_PER_HOUR = 60;

/**
 * Hours in one day.
 */
export const HOURS_PER_DAY = 24;

/**
 * Days in one week.
 */
export const DAYS_PER_WEEK = 7;

/**
 * Milliseconds in one minute.
 */
export const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;

/**
 * Milliseconds in one hour.
 */
export const MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;

/**
 * Milliseconds in one day.
 */
export const MS_PER_DAY = MS_PER_HOUR * HOURS_PER_DAY;
