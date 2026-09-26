import type { CalendarEntry, Discipline } from '../../../../shared/types';

/**
 * Which events the calendar is showing, by what the career can do with them.
 */
export type CalendarStatus = 'all' | 'available' | 'entered' | 'locked';

/**
 * What the calendar was left showing.
 */
export interface CalendarCriteria {
  /**
   * Which status filter is on.
   */
  status: CalendarStatus;
  /**
   * The disciplines being shown, or empty for all of them.
   */
  disciplines: readonly Discipline[];
}

/**
 * One day's worth of events, as the agenda groups them.
 */
export interface AgendaDay {
  /**
   * The ISO date of the race day these share.
   */
  date: string;
  /**
   * What is on that day, in the order the calendar gave them.
   */
  events: readonly CalendarEntry[];
}

/**
 * How the calendar lays its events out: a timeline of race days, or a month at
 * a time as a grid.
 */
export type CalendarView = 'days' | 'month';

/**
 * How one race day reads in the month strip's row of ticks.
 */
export type MonthTick = 'clash' | 'yours' | 'other';

/**
 * One month of a season, as the strip of month buttons shows it.
 */
export interface SeasonMonth {
  /**
   * Its first day, as an ISO date.
   */
  start: string;
  /**
   * One tick per race day in it, in date order.
   */
  ticks: readonly MonthTick[];
}
