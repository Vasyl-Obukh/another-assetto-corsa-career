// Which day of the week a championship races on, and how a career qualifies a
// round's race id.

import { Weekday } from '../../shared/types/index.ts';

/**
 * Each day of the week as getUTCDay numbers it, which is what the season
 * calendar dates on.
 */
export const WEEKDAY_NUMBER: Readonly<Record<Weekday, number>> = {
  [Weekday.SUNDAY]: 0,
  [Weekday.MONDAY]: 1,
  [Weekday.TUESDAY]: 2,
  [Weekday.WEDNESDAY]: 3,
  [Weekday.THURSDAY]: 4,
  [Weekday.FRIDAY]: 5,
  [Weekday.SATURDAY]: 6,
};

/**
 * The day a championship races on by the tier of its highest class, for the
 * two tiers that keep a day of the weekend to themselves.
 */
export const TIER_WEEKDAY: Readonly<Partial<Record<number, Weekday>>> = {
  1: Weekday.SUNDAY,
  2: Weekday.SATURDAY,
};

/**
 * The days a championship below those tiers races on, one per championship.
 */
export const WORKDAYS: readonly Weekday[] = [
  Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY,
];

/**
 * What joins a round's race id to the run a career races it in.
 *
 * `@`, because `encodeURIComponent` always escapes it, so it can never occur
 * inside the round id it follows.
 */
export const RUN_SEPARATOR = '@';
