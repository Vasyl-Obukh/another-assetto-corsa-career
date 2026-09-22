// What a season's dating is asked about, and what it answers with.

/**
 * How long one round's weekend runs, and where its race sits inside it.
 *
 * Deliberately three numbers rather than a Round and a WeekendFormat: dating a
 * season is arithmetic, and keeping it clear of what a championship is means it
 * can be tested with a handful of spans and reused by anything else that has a
 * weekend to place.
 */
export interface RoundSpan {
  /**
   * The round's own id, carried through so the answer can be matched back.
   */
  id: string;
  /**
   * How many days the weekend runs over, counting from one.
   */
  days: number;
  /**
   * Which day of the weekend the race falls on, counting from zero.
   *
   * The race is what gets anchored to a Sunday, so this is how far back the
   * weekend's opening day sits - two on a Friday-to-Sunday weekend.
   */
  raceDayOffset: number;
}

/**
 * One round, placed on the calendar.
 *
 * Every date is an ISO YYYY-MM-DD string rather than a Date, because these are
 * written into the career document and a Date does not survive JSON.
 */
export interface DatedRound {
  /**
   * The round this dates.
   */
  id: string;
  /**
   * The weekend's opening day.
   */
  firstDay: string;
  /**
   * Race day, always a Sunday.
   */
  raceDay: string;
  /**
   * The weekend's closing day.
   */
  lastDay: string;
}

/**
 * A stretch of days, for asking whether two of them collide.
 */
export interface DateSpan {
  /**
   * The first day, inclusive.
   */
  firstDay: string;
  /**
   * The last day, inclusive.
   */
  lastDay: string;
}
