// Placing a championship's rounds on a career's calendar.
//
// A career season is always one calendar year, whatever is entered in it. A
// championship's SeasonLength says how much of that year its own rounds are
// spread over, so a quarter-length series runs inside ten racing weeks and is
// finished by the spring while the season itself still ends where the year
// does. That is what lets one career hold championships of different lengths
// without "season end" meaning two different dates.
//
// Pure: no I/O and no knowledge of what a championship is, so it is tested with
// a handful of round ids rather than with a document.

import type { DatedRound } from './types.ts';
import { weekdayOnOrAfter } from './utils.ts';
import { DAYS_PER_WEEK, SEASON_WEEKS } from '../../shared/constants/index.ts';
import type { SeasonLength } from '../../shared/types/index.ts';
import { addDays } from '../../shared/utils/calendar-days/index.ts';

export type { DatedRound } from './types.ts';
export { weekdayOnOrAfter } from './utils.ts';
export { addDays, toDayNumber } from '../../shared/utils/calendar-days/index.ts';

/**
 * Dates every round of a season, spread evenly across the weeks it runs over.
 *
 * Rounds are placed a whole number of weeks apart, which is what keeps every
 * one on the championship's own day of the week: the first sits on the
 * season's opening race day and the last on its closing one, with the rest
 * spread between them. Spread rather than stepped by a fixed gap, because a
 * fixed gap leaves a twenty-four round year finishing six weeks early.
 *
 * A season with more rounds than weeks cannot give each its own week, so
 * rounds are held one week apart from wherever they would otherwise collide.
 * That keeps the function total for a document that got past validateSeries,
 * which reports `series.season.tooManyRounds` and is where the loud failure
 * belongs.
 *
 * `offsetWeeks` is what stops a hundred championships opening in one week.
 * Spread from a common season start they would all put round one in the same
 * week and leave the rest of the calendar bare, which is not what a season
 * looks like - so each is pushed along by its own offset, and the caller picks
 * one that is stable for the championship.
 * @param rounds The ids of the rounds to place, in the order they are run
 * @param start The ISO date the season opens on
 * @param length How much of the year this championship fills
 * @param weekday Which day of the week it races on, as getUTCDay numbers it
 * @param offsetWeeks How many weeks past the season's opening this one starts
 * @returns One dated round per round, in the same order
 */
export const seasonCalendar = (
  rounds: readonly string[],
  start: string,
  length: SeasonLength,
  weekday: number,
  offsetWeeks = 0,
): DatedRound[] => {
  // The offset slides the whole championship along rather than shortening it,
  // or every one of them would still finish in the same week however late it
  // started. Bounding it against the career's own season is the caller's,
  // which is the only place that knows how long that is.
  const opening = addDays(weekdayOnOrAfter(start, weekday), offsetWeeks * DAYS_PER_WEEK);
  const span = SEASON_WEEKS[length] - 1;
  const last = rounds.length - 1;

  let previous = -1;

  return rounds.map((id, at) => {
    // A single round opens the season rather than sitting in the middle of it.
    const spread = last > 0 ? Math.round((at * span) / last) : 0;
    const week = Math.max(previous + 1, spread);
    previous = week;

    return { id, date: addDays(opening, week * DAYS_PER_WEEK) };
  });
};

/**
 * Which of a set of events fall on the same day as another.
 *
 * A clash is reported here rather than refused: real calendars clash, and
 * which of two events to give up is the player's to decide.
 * @param dates The ISO date of each event, in any order
 * @returns One flag per date, in the same order, true where another shares it
 */
export const clashes = (dates: readonly string[]): boolean[] => {
  const counts = new Map<string, number>();
  dates.forEach((date) => counts.set(date, (counts.get(date) ?? 0) + 1));

  return dates.map((date) => (counts.get(date) ?? 0) > 1);
};
