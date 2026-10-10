// What a season's dating answers with.

/**
 * One round, placed on the calendar.
 *
 * The date is an ISO YYYY-MM-DD string rather than a Date, because it is
 * written into the career document and a Date does not survive JSON.
 */
export interface DatedRound {
  /**
   * The round this dates.
   */
  id: string;
  /**
   * The day it is raced on.
   */
  date: string;
}
