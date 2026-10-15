import { HISTORIC_WEEKDAYS } from './constants.ts';
import { addDays, toDayNumber, weekdayOf } from '../../shared/utils/calendar-days/index.ts';

/**
 * Whether a historic event may fall on a day.
 * @param date An ISO date
 * @returns True on a weekday
 */
export const isHistoricDay = (date: string): boolean => (
  HISTORIC_WEEKDAYS.has(weekdayOf(date))
);

/**
 * Every day from one date to another, both included.
 * @param from The first ISO date
 * @param to The last ISO date
 * @returns The dates, in order - none when the second is before the first
 */
export const daysFrom = (from: string, to: string): string[] => Array.from(
  { length: Math.max(0, toDayNumber(to) - toDayNumber(from) + 1) },
  (unused, at) => addDays(from, at),
);

/**
 * The first day of a month, a number of months on from another month's.
 * @param date An ISO date in the month to count from
 * @param months How many months on
 * @returns The ISO date of that month's first day
 */
export const monthStart = (date: string, months: number): string => {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7)) - 1 + months;
  const shifted = new Date(Date.UTC(year, month, 1));

  return shifted.toISOString().slice(0, 10);
};

/**
 * Picks one item off a seeded generator.
 * @param items What to pick from, which must not be empty
 * @param random The generator
 * @returns The item
 */
export const pickOne = <T>(items: readonly T[], random: () => number): T => (
  items[Math.floor(random() * items.length)]
);
