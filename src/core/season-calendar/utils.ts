// The day a season's racing is anchored to.

import { RACE_WEEKDAY } from './constants.ts';
import { DAYS_PER_WEEK, MS_PER_DAY } from '../../shared/constants/index.ts';
import { fromDayNumber, toDayNumber } from '../../shared/utils/calendar-days/index.ts';

/**
 * The first race day on or after a date.
 *
 * Races run on a Sunday, so a season opening on a Wednesday opens its first
 * weekend on the Sunday that follows rather than dating a race midweek.
 * @param date An ISO YYYY-MM-DD date
 * @returns The ISO date of that Sunday, which is the date itself when it is one
 */
export const raceDayOnOrAfter = (date: string): string => {
  const day = toDayNumber(date);
  // 1970-01-01 was a Thursday, so the epoch is not day zero of a week.
  const weekday = new Date(day * MS_PER_DAY).getUTCDay();

  return fromDayNumber(day + ((RACE_WEEKDAY - weekday + DAYS_PER_WEEK) % DAYS_PER_WEEK));
};
