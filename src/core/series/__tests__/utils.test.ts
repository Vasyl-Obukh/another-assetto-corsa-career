import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type {
  Championship, ClassEntry, SeriesSession, WeekendFormat,
} from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../constants.ts';
import {
  fieldableCars, seatSkin, validateFormat, validateMoney,
} from '../utils.ts';
import { makeContent } from './fixtures.ts';

/**
 * A championship with one format, which the tests below replace.
 * @param sessions The sessions the format runs
 * @returns The championship and the format to check, which is its only one
 */
const withSessions = (
  sessions: SeriesSession[],
): { series: Championship; format: WeekendFormat } => {
  const format: WeekendFormat = { id: 'standard', name: 'Race weekend', sessions };
  const series: Championship = {
    version: SERIES_FORMAT_VERSION,
    id: 'test-cup',
    name: 'Test Cup',
    entries: [{
      id: 'main',
      name: 'Main',
      ladder: { discipline: Discipline.ROAD, tier: 6 },
      seats: Array.from({ length: 8 }, (unused, at) => ({ id: `main-${at + 1}` })),
      eligibility: { kind: 'cars', cars: ['test_car'] },
    }],
    rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
    weekendFormats: [format],
    defaultWeekendFormat: 'standard',
    pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
    defaultPointsSystem: 'race',
  };

  return { series, format };
};

/**
 * The codes checking a format produced.
 * @param sessions The sessions the format runs
 * @returns One code per problem
 */
const codesFor = (sessions: SeriesSession[]): string[] => {
  const { series, format } = withSessions(sessions);

  return validateFormat(series, format).map((problem) => problem.code);
};

describe('core/series/utils', () => {
  describe('validateFormat', () => {
    it('passes a knockout whose segments each follow the one before', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 15, inherit: { from: 'q1', top: 15 },
        },
        {
          id: 'q3', type: 'qualify', name: 'Q3', minutes: 12, inherit: { from: 'q2', top: 10 },
        },
        {
          type: 'race', name: 'Race', laps: 25, day: 1, inherit: { from: 'q3' },
        },
      ])).toEqual([]);
    });

    it('passes a format that links nothing at all, as every older one does', () => {
      expect(codesFor([
        { type: 'qualify', name: 'Qualifying', minutes: 15 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual([]);
    });

    it('reports two sessions claiming one id, which a link could not tell apart', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        { id: 'q1', type: 'qualify', name: 'Q2', minutes: 12 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.id.duplicate']);
    });

    it('reports a link to a session the format does not have', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'sq3' },
        },
      ])).toEqual(['series.inherit.unknown']);
    });

    it('reports a link to a session that does not run first', () => {
      expect(codesFor([
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, inherit: { from: 'q2' },
        },
        { id: 'q2', type: 'qualify', name: 'Q2', minutes: 12 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notEarlier']);
    });

    it('reports a session that follows itself', () => {
      expect(codesFor([
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, inherit: { from: 'q1' },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notEarlier']);
    });

    it('reports a link to something that classifies nobody', () => {
      // Only a qualifying leaves a classification behind for the next session
      // to follow; advanceWeekend records one for nothing else.
      expect(codesFor([
        { id: 'fp1', type: 'practice', name: 'Practice', minutes: 30 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'fp1' },
        },
      ])).toEqual(['series.inherit.notQualifying']);
    });

    it('reports a link that lets nobody through', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'q1', top: 0 },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.topInvalid']);
    });

    it('names every broken link rather than the first', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'nope', top: -1 },
        },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'also-nope' },
        },
      ])).toEqual([
        'series.inherit.unknown', 'series.inherit.topInvalid', 'series.inherit.unknown',
      ]);
    });
  });

  describe('fieldableCars', () => {
    /**
     * A championship whose one class swaps cars at a single round.
     * @returns The championship and the class entry to read
     */
    const withOverride = (): { series: Championship; entry: ClassEntry } => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const swapped: Championship = {
        ...series,
        rounds: [
          series.rounds[0],
          {
            id: 'oval',
            name: 'Oval',
            track: { id: 'daytona' },
            eligibility: [{ entry: 'main', eligibility: { kind: 'cars', cars: ['oval_car'] } }],
          },
        ],
      };

      return { series: swapped, entry: swapped.entries[0] };
    };

    it('reads the class entry own cars when no round overrides it', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);

      expect([...fieldableCars(series, series.entries[0])]).toEqual(['test_car']);
    });

    it('adds the cars a round swaps to, since a seat is pinned for the season', () => {
      const { series, entry } = withOverride();

      expect([...fieldableCars(series, entry)].sort()).toEqual(['oval_car', 'test_car']);
    });

    it('ignores an override aimed at a different class entry', () => {
      const { series, entry } = withOverride();
      const elsewhere: Championship = {
        ...series,
        rounds: series.rounds.map((round) => (round.eligibility
          ? { ...round, eligibility: [{ entry: 'other', eligibility: { kind: 'cars' as const, cars: ['oval_car'] } }] }
          : round)),
      };

      expect([...fieldableCars(elsewhere, entry)]).toEqual(['test_car']);
    });
  });

  describe('seatSkin', () => {
    const content = makeContent();

    it('takes the livery when the resolved car has it installed', () => {
      expect(seatSkin(content, 'test_car', 'blue')).toBe('blue');
    });

    // A user pins a livery against their own copy of a mod, and the next
    // release of it may have renamed the folder. Falling back to automatic
    // assignment beats writing a SKIN key Assetto Corsa cannot resolve.
    it('gives up on a livery that car does not have', () => {
      expect(seatSkin(content, 'test_car', 'chartreuse')).toBeUndefined();
      expect(seatSkin(content, 'ghost_car', 'blue')).toBeUndefined();
    });

    it('asks for nothing when the seat pinned nothing', () => {
      expect(seatSkin(content, 'test_car', undefined)).toBeUndefined();
    });
  });

  describe('validateMoney', () => {
    /**
     * The codes checking one championship's money produced.
     * @param overrides What to change about a clean championship
     * @returns One code per problem
     */
    const moneyCodes = (overrides: Partial<Championship>): string[] => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);

      return validateMoney({ ...series, ...overrides }).map((problem) => problem.code);
    };

    it('passes a championship that says nothing about money', () => {
      expect(moneyCodes({})).toEqual([]);
    });

    // A flat rate is a real way to pay a series, so only a negative figure is
    // refused - a table that does not descend is deliberately left alone.
    it('accepts a prize table that does not descend', () => {
      expect(moneyCodes({ prizes: { positions: [100, 100, 100] } })).toEqual([]);
    });

    it('refuses a negative prize, naming which table and position', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const [problem] = validateMoney({ ...series, prizes: { standings: [500, -1] } });

      expect(problem.code).toBe('series.prizes.invalid');
      expect(problem.params).toMatchObject({ table: 'championship', position: 2, amount: -1 });
    });

    it('refuses a negative entry fee on the championship', () => {
      expect(moneyCodes({ entryFee: -1 })).toEqual(['series.entryFee.invalid']);
    });

    // Round five of twenty is otherwise reported as a number with nowhere to
    // go and look for it.
    it('names the round a bad entry fee is on', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const rounds = [{ ...series.rounds[0], entryFee: -5 }];
      const [problem] = validateMoney({ ...series, rounds });

      expect(problem.code).toBe('series.entryFee.invalid');
      expect(problem.params).toMatchObject({ scope: 'round magione', amount: -5 });
    });

    it('accepts a free championship, which is not the same as charging nothing', () => {
      expect(moneyCodes({ entryFee: 0 })).toEqual([]);
    });

    it('refuses drops that are negative or not a whole number of results', () => {
      expect(moneyCodes({ drops: -1 })).toEqual(['series.drops.invalid']);
      expect(moneyCodes({ drops: 1.5 })).toEqual(['series.drops.invalid']);
      expect(moneyCodes({ drops: 0 })).toEqual([]);
    });
  });
});
