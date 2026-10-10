// The day a season's racing is anchored to.

import { DAYS_PER_WEEK, MS_PER_DAY } from '../../shared/constants/index.ts';
import { fromDayNumber, toDayNumber } from '../../shared/utils/calendar-days/index.ts';

/**
 * The first given day of the week on or after a date.
 *
 * A championship races on one day of the week, so a season opening on a
 * Wednesday opens a Sunday championship's first round on the Sunday that
 * follows rather than dating it midweek.
 * @param date An ISO YYYY-MM-DD date
 * @param weekday The day of the week wanted, as getUTCDay numbers it
 * @returns The ISO date of that day, which is the date itself when it is one
 */
export const weekdayOnOrAfter = (date: string, weekday: number): string => {
  const day = toDayNumber(date);
  // 1970-01-01 was a Thursday, so the epoch is not day zero of a week.
  const from = new Date(day * MS_PER_DAY).getUTCDay();

  return fromDayNumber(day + ((weekday - from + DAYS_PER_WEEK) % DAYS_PER_WEEK));
};
