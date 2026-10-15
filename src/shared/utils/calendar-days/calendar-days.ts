// Calendar arithmetic, done on day numbers rather than on Date objects.
//
// Everything here converts an ISO YYYY-MM-DD to days since the epoch, does
// integer arithmetic and converts back. That is not fussiness: new Date() on a
// date-only string parses it as UTC midnight, so anywhere west of Greenwich the
// day reads back one earlier, and a calendar that shifts when the user's clock
// changes zone is not deterministic.

import { ISO_DATE, ISO_DATE_LENGTH } from './constants.ts';
import { MS_PER_DAY } from '../../constants/index.ts';
import { AppError } from '../../errors/index.ts';

/**
 * Writes a count of days since the epoch back as a calendar date.
 * @param day Days since 1970-01-01, UTC
 * @returns The ISO YYYY-MM-DD date
 */
export const fromDayNumber = (day: number): string => (
  new Date(day * MS_PER_DAY).toISOString().slice(0, ISO_DATE_LENGTH)
);

/**
 * Reads a calendar date as a count of days since the epoch.
 * @param date An ISO YYYY-MM-DD date
 * @returns Days since 1970-01-01, UTC
 * @throws When the string is not a calendar date
 */
export const toDayNumber = (date: string): number => {
  if (!ISO_DATE.test(date)) throw new AppError('season.date.invalid', { date });

  const at = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(at)) throw new AppError('season.date.invalid', { date });

  const day = Math.round(at / MS_PER_DAY);
  // Date.parse refuses a month past 12 or a day past 31, but rolls a day that
  // is impossible for its own month forward - 2026-02-30 reads back as 2 March.
  // So the answer has to write back as the date that was read.
  if (fromDayNumber(day) !== date) throw new AppError('season.date.invalid', { date });

  return day;
};

/**
 * Moves a calendar date by a whole number of days.
 * @param date An ISO YYYY-MM-DD date
 * @param days How many days to move it, which may be negative
 * @returns The ISO date that many days away
 */
export const addDays = (date: string, days: number): string => (
  fromDayNumber(toDayNumber(date) + days)
);

/**
 * How many whole days lie between two calendar dates.
 * @param from An ISO YYYY-MM-DD date
 * @param to Another
 * @returns The days from one to the other, negative when they are the other way round
 */
export const daysBetween = (from: string, to: string): number => toDayNumber(to) - toDayNumber(from);

/**
 * Which day of the week a calendar date falls on.
 * @param date An ISO YYYY-MM-DD date
 * @returns The day as getUTCDay numbers it, Sunday being 0
 */
export const weekdayOf = (date: string): number => new Date(toDayNumber(date) * MS_PER_DAY).getUTCDay();
