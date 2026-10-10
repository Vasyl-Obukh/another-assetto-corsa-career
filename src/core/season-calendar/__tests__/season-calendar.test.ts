import { describe, expect, it } from '@jest/globals';

import { SeasonLength } from '../../../shared/types/index.ts';
import { clashes, seasonCalendar, toDayNumber } from '../season-calendar.ts';

// The Sunday every case below opens on, so a date in an assertion can be read
// as a number of weeks from the start of the season.
const SEASON_START = '2026-01-04';

// getUTCDay's Sunday, which the cases race on unless they say otherwise.
const SUNDAY = 0;

/**
 * Builds a run of round ids.
 * @param count How many rounds to build
 * @returns The ids, r1 upward, in the order they are run
 */
const roundsOf = (count: number): string[] => (
  Array.from({ length: count }, (unused, at) => `r${at + 1}`)
);

/**
 * The race day of every dated round, for comparing a whole calendar at once.
 * @param rounds The rounds to place
 * @param length How much of the year the championship fills
 * @param offsetWeeks How many weeks past the season's opening it starts
 * @returns One ISO race day per round, in the same order
 */
const raceDays = (
  rounds: readonly string[],
  length: SeasonLength,
  offsetWeeks = 0,
): string[] => seasonCalendar(rounds, SEASON_START, length, SUNDAY, offsetWeeks).map((round) => round.date);

/**
 * Which weekday a dated race falls on, as getUTCDay numbers it.
 * @param date An ISO YYYY-MM-DD date
 * @returns The weekday, zero being Sunday
 */
const weekdayOf = (date: string): number => new Date(`${date}T00:00:00Z`).getUTCDay();

describe('core/season-calendar/season-calendar', () => {
  describe('seasonCalendar', () => {
    it('opens on the season start and closes on the last week the length allows', () => {
      // A quarter is ten weeks, so the closing race sits nine weeks along.
      expect(raceDays(roundsOf(5), SeasonLength.QUARTER)).toEqual([
        '2026-01-04', '2026-01-18', '2026-02-08', '2026-02-22', '2026-03-08',
      ]);
    });

    it('spreads the rounds to fill the length rather than stepping by a fixed gap', () => {
      // Three rounds over a forty week year land at weeks 0, 20 and 39.
      expect(raceDays(roundsOf(3), SeasonLength.YEAR)).toEqual([
        '2026-01-04', '2026-05-24', '2026-10-04',
      ]);
      expect(raceDays(roundsOf(4), SeasonLength.HALF_YEAR)).toEqual([
        '2026-01-04', '2026-02-15', '2026-04-05', '2026-05-17',
      ]);
    });

    it('opens the season with a single round rather than sitting it mid-season', () => {
      expect(raceDays(roundsOf(1), SeasonLength.YEAR)).toEqual(['2026-01-04']);
      expect(raceDays(roundsOf(1), SeasonLength.QUARTER)).toEqual(['2026-01-04']);
    });

    it('keeps every race on its weekday, whatever the length and the count', () => {
      [SeasonLength.YEAR, SeasonLength.HALF_YEAR, SeasonLength.QUARTER].forEach((length) => {
        [1, 2, 7, 13, 24].forEach((count) => {
          raceDays(roundsOf(count), length).forEach((raceDay) => {
            expect(weekdayOf(raceDay)).toBe(0);
          });
        });
      });
    });

    it('opens on the Sunday that follows a start given midweek', () => {
      // 2026-01-01 is a Thursday.
      const dated = seasonCalendar(roundsOf(2), '2026-01-01', SeasonLength.QUARTER, SUNDAY);

      expect(dated.map((round) => round.date)).toEqual(['2026-01-04', '2026-03-08']);
    });

    it('races every round on the weekday it is given', () => {
      // Wednesday, the first after the Sunday the season opens on.
      const dated = seasonCalendar(roundsOf(3), SEASON_START, SeasonLength.QUARTER, 3);

      expect(dated.map((round) => round.date)).toEqual(['2026-01-07', '2026-02-11', '2026-03-11']);
      dated.forEach((round) => expect(weekdayOf(round.date)).toBe(3));
    });

    it('slides the whole championship along without shortening it', () => {
      const plain = raceDays(roundsOf(5), SeasonLength.QUARTER);
      const pushed = raceDays(roundsOf(5), SeasonLength.QUARTER, 3);

      expect(pushed).toEqual([
        '2026-01-25', '2026-02-08', '2026-03-01', '2026-03-15', '2026-03-29',
      ]);
      // Every round moved by the same three weeks, so the span is unchanged.
      pushed.forEach((raceDay, at) => {
        expect(toDayNumber(raceDay) - toDayNumber(plain[at])).toBe(21);
      });
    });

    it('leaves the calendar where it is for an offset of no weeks', () => {
      expect(raceDays(roundsOf(5), SeasonLength.QUARTER, 0))
        .toEqual(raceDays(roundsOf(5), SeasonLength.QUARTER));
    });

    it('holds rounds a week apart rather than colliding when there are more than weeks', () => {
      // Fourteen rounds do not fit a ten week quarter, so they run consecutively.
      expect(raceDays(roundsOf(14), SeasonLength.QUARTER)).toEqual([
        '2026-01-04', '2026-01-11', '2026-01-18', '2026-01-25',
        '2026-02-01', '2026-02-08', '2026-02-15', '2026-02-22',
        '2026-03-01', '2026-03-08', '2026-03-15', '2026-03-22',
        '2026-03-29', '2026-04-05',
      ]);
    });

    it('never dates two rounds on one day', () => {
      [11, 14, 30, 52].forEach((count) => {
        const days = raceDays(roundsOf(count), SeasonLength.QUARTER);

        expect(new Set(days).size).toBe(count);
      });
    });

    it('carries each round id through in the order it was given', () => {
      const dated = seasonCalendar(roundsOf(4), SEASON_START, SeasonLength.HALF_YEAR, SUNDAY);

      expect(dated.map((round) => round.id)).toEqual(['r1', 'r2', 'r3', 'r4']);
    });

    it('dates nothing for a championship with no rounds', () => {
      expect(seasonCalendar([], SEASON_START, SeasonLength.YEAR, SUNDAY)).toEqual([]);
    });
  });

  describe('clashes', () => {
    it('reports both events of a pair on one day', () => {
      expect(clashes(['2026-01-04', '2026-01-04'])).toEqual([true, true]);
    });

    it('leaves events on neighbouring days alone', () => {
      expect(clashes(['2026-01-03', '2026-01-04', '2026-01-05'])).toEqual([false, false, false]);
    });

    it('never clashes an event with itself', () => {
      expect(clashes(['2026-01-04'])).toEqual([false]);
      expect(clashes([])).toEqual([]);
    });

    it('answers in the order it was asked, clashing days wherever they sit', () => {
      expect(clashes(['2026-03-08', '2026-01-04', '2026-03-08', '2026-05-03'])).toEqual([true, false, true, false]);
    });

    it('reports every event of a pile-up rather than only the first two', () => {
      expect(clashes(['2026-01-04', '2026-01-04', '2026-01-04'])).toEqual([true, true, true]);
    });

    it('finds no clash across a whole season the calendar laid out', () => {
      const dated = seasonCalendar(roundsOf(5), SEASON_START, SeasonLength.QUARTER, SUNDAY);

      expect(clashes(dated.map((round) => round.date))).toEqual([false, false, false, false, false]);
    });
  });
});
