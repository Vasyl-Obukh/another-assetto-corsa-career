import { describe, expect, it } from '@jest/globals';

import { SeasonLength } from '../../../types/index.ts';
import type {
  CareerSeason, Championship, EventStatus, SeasonEntry, SeasonEvent,
} from '../../../types/index.ts';
import {
  editionEntry, editionOver, editionsOf, enteredEdition, seasonYear,
} from '../editions.ts';

/**
 * A championship running for the length given, or the default year.
 * @param seasonLength How much of a year one edition fills
 * @returns The championship
 */
const championship = (seasonLength?: SeasonLength): Championship => ({ seasonLength } as Championship);

/**
 * One edition of a championship a season entered, its rounds in the states given.
 * @param edition Which of the season's editions
 * @param statuses Each round's state
 * @param overrides What to change about it
 * @returns The entry
 */
const entry = (
  edition: number,
  statuses: readonly EventStatus[],
  overrides: Partial<SeasonEntry> = {},
): SeasonEntry => ({
  series: 'cup',
  edition,
  events: statuses.map((status, at) => ({ round: `r${at}`, status })),
  ...overrides,
} as SeasonEntry);

/**
 * A season holding the entries given.
 * @param entries Its entries
 * @returns The season
 */
const season = (...entries: SeasonEntry[]): CareerSeason => ({
  index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries,
});

describe('shared/utils/editions', () => {
  describe('editionsOf', () => {
    it('runs a year-long championship once, as one that states no length', () => {
      expect(editionsOf(championship(SeasonLength.YEAR))).toBe(1);
      expect(editionsOf(championship())).toBe(1);
    });

    it('runs a half-year championship twice and a quarter-length one four times', () => {
      expect(editionsOf(championship(SeasonLength.HALF_YEAR))).toBe(2);
      expect(editionsOf(championship(SeasonLength.QUARTER))).toBe(4);
    });
  });

  describe('seasonYear', () => {
    it('reads the year off the day the season opens', () => {
      expect(seasonYear({ startDate: '2027-01-01' })).toBe(2027);
    });
  });

  describe('enteredEdition', () => {
    it('is the earliest edition entered with a round still to run', () => {
      const held = season(entry(2, ['scheduled']), entry(1, ['raced', 'scheduled']));

      expect(enteredEdition(held, 'cup')).toBe(1);
    });

    it('passes over an edition already run and one the career pulled out of', () => {
      const held = season(
        entry(0, ['raced', 'missed']),
        entry(1, ['scheduled'], { withdrawn: true }),
        entry(2, ['scheduled']),
      );

      expect(enteredEdition(held, 'cup')).toBe(2);
    });

    it('is null for a championship the career is not racing', () => {
      expect(enteredEdition(season(entry(0, ['raced'])), 'cup')).toBeNull();
      expect(enteredEdition(season(entry(0, ['scheduled'])), 'other-cup')).toBeNull();
    });
  });

  describe('editionEntry', () => {
    it('finds the entry of the edition asked for', () => {
      const second = entry(1, ['raced']);

      expect(editionEntry(season(entry(0, ['raced']), second), 'cup', 1)).toBe(second);
    });

    it('prefers the entry still held where the career pulled out and went back in', () => {
      const left = entry(0, ['missed'], { withdrawn: true });
      const back = entry(0, ['raced']);

      expect(editionEntry(season(left, back), 'cup', 0)).toBe(back);
    });

    it('reads back an edition the career pulled out of, when that is all it holds', () => {
      const left = entry(0, ['missed'], { withdrawn: true });

      expect(editionEntry(season(left), 'cup', 0)).toBe(left);
    });

    it('is null for an edition the season never entered', () => {
      expect(editionEntry(season(entry(0, ['raced'])), 'cup', 3)).toBeNull();
    });
  });

  describe('editionOver', () => {
    /**
     * An edition of two rounds, on 10 and 17 May.
     * @param statuses Each round's state
     * @returns The entry
     */
    const dated = (...statuses: EventStatus[]): SeasonEntry => entry(0, statuses, {
      events: statuses.map((status, at) => ({ round: `r${at}`, status, date: `2026-05-${10 + at * 7}` }) as SeasonEvent),
    });

    it('is over once every round has run and the last is behind the clock', () => {
      expect(editionOver(dated('raced', 'raced'), '2026-05-17')).toBe(true);
    });

    it('is not over while a round is still to run', () => {
      expect(editionOver(dated('raced', 'scheduled'), '2026-06-01')).toBe(false);
    });

    // A round given up by withdrawing is missed at once, and simulated only on
    // its own day - so the edition is over only once that day has come.
    it('is not over before the day of a round given up', () => {
      expect(editionOver(dated('raced', 'missed'), '2026-05-10')).toBe(false);
      expect(editionOver(dated('raced', 'missed'), '2026-05-17')).toBe(true);
    });
  });
});
