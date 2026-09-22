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
// a handful of spans rather than with a document.

import type { DatedRound, DateSpan, RoundSpan } from './types.ts';
import { addDays, raceDayOnOrAfter, toDayNumber } from './utils.ts';
import { DAYS_PER_WEEK, SEASON_WEEKS } from '../../shared/constants/index.ts';
import type { SeasonLength } from '../../shared/types/index.ts';

export type { DatedRound, DateSpan, RoundSpan } from './types.ts';
export { addDays, raceDayOnOrAfter, toDayNumber } from './utils.ts';

/**
 * Dates every round of a season, spread evenly across the weeks it runs over.
 *
 * Rounds are placed a whole number of weeks apart, which is what keeps every
 * race on a Sunday: the first sits on the season's opening race day and the
 * last on its closing one, with the rest spread between them. Spread rather
 * than stepped by a fixed gap, because a fixed gap leaves a twenty-four round
 * year finishing six weeks early.
 *
 * A season with more rounds than weeks cannot give each its own weekend, so
 * rounds are held one week apart from wherever they would otherwise collide.
 * That keeps the function total for a document that got past validateSeries,
 * which reports `series.season.tooManyRounds` and is where the loud failure
 * belongs.
 * `offsetWeeks` is what stops a hundred championships opening on one Sunday.
 * Spread from a common season start they would all put round one on the same
 * weekend and leave the rest of the calendar bare, which is not what a season
 * looks like - so each is pushed along by its own offset, and the caller picks
 * one that is stable for the championship.
 * @param rounds The rounds to place, in the order they are run
 * @param start The ISO date the season opens on
 * @param length How much of the year this championship fills
 * @param offsetWeeks How many weeks past the season's opening this one starts
 * @returns One dated round per round, in the same order
 */
export const seasonCalendar = (
  rounds: readonly RoundSpan[],
  start: string,
  length: SeasonLength,
  offsetWeeks = 0,
): DatedRound[] => {
  // The offset slides the whole championship along rather than shortening it,
  // or every one of them would still finish on the same weekend however late
  // it started. Bounding it against the career's own season is the caller's,
  // which is the only place that knows how long that is.
  const opening = addDays(raceDayOnOrAfter(start), offsetWeeks * DAYS_PER_WEEK);
  const span = SEASON_WEEKS[length] - 1;
  const last = rounds.length - 1;

  let previous = -1;

  return rounds.map((round, at) => {
    // A single round opens the season rather than sitting in the middle of it.
    const spread = last > 0 ? Math.round((at * span) / last) : 0;
    const week = Math.max(previous + 1, spread);
    previous = week;

    const raceDay = addDays(opening, week * DAYS_PER_WEEK);
    const firstDay = addDays(raceDay, -round.raceDayOffset);

    return {
      id: round.id,
      firstDay,
      raceDay,
      lastDay: addDays(firstDay, round.days - 1),
    };
  });
};

/**
 * Which of a set of weekends collide with another.
 *
 * Overlapping rather than sharing a race day: two weekends that overlap at all
 * cannot both be driven, since a weekend is several sessions over several days
 * and the player is one person.
 *
 * A clash is reported rather than refused - real calendars clash, and which of
 * two events to give up is the player's to decide.
 * @param spans The weekends to compare, in any order
 * @returns One flag per span, in the same order, true where another overlaps it
 */
export const clashes = (spans: readonly DateSpan[]): boolean[] => {
  const days = spans.map((span) => ({
    from: toDayNumber(span.firstDay),
    to: toDayNumber(span.lastDay),
  }));

  return days.map((span, at) => days.some((other, index) => (
    index !== at && span.from <= other.to && other.from <= span.to
  )));
};
