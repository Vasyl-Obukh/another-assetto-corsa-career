import { describe, expect, it } from '@jest/globals';

import { DEFAULT_CAREER_SETTINGS } from '../../../constants/index.ts';
import { Discipline } from '../../../types/index.ts';
import type { Championship, ClassEntry } from '../../../types/index.ts';
import { prizeSpeed, prizeTable, scaledPrize } from '../prizes.ts';

/**
 * A class of the cup, with whatever purse of its own the test gives it.
 * @param over Whatever the test wants said differently
 * @returns The class entry
 */
const classEntry = (over: Partial<ClassEntry> = {}): ClassEntry => ({
  id: 'main',
  name: 'Main',
  ladder: { discipline: Discipline.ROAD, tier: 4 },
  seats: [],
  eligibility: { kind: 'cars', cars: [] },
  ...over,
});

/**
 * A championship paying a purse per race and per final standing, with the
 * classes the test gives it.
 * @param entries Its classes
 * @returns The championship
 */
const cup = (entries: readonly ClassEntry[] = [classEntry()]): Championship => ({
  id: 'cup',
  entries,
  prizes: { positions: [1000, 600], standings: [10_000] },
} as unknown as Championship);

describe('shared/utils/prizes', () => {
  describe('prizeTable', () => {
    it("pays a class from the championship's purse when it has none of its own", () => {
      expect(prizeTable(cup(), 'main', 'positions')).toEqual([1000, 600]);
      expect(prizeTable(cup(), 'main', 'standings')).toEqual([10_000]);
    });

    it("pays a class from its own table over the championship's", () => {
      const championship = cup([classEntry({ prizes: { positions: [50] } })]);

      expect(prizeTable(championship, 'main', 'positions')).toEqual([50]);
    });

    it("pays a table the class leaves out from the championship's, each table standing alone", () => {
      const championship = cup([classEntry({ prizes: { positions: [50] } })]);

      expect(prizeTable(championship, 'main', 'standings')).toEqual([10_000]);
    });

    it("pays an unknown class, or none at all, from the championship's", () => {
      expect(prizeTable(cup(), 'gone', 'positions')).toEqual([1000, 600]);
      expect(prizeTable(cup(), null, 'positions')).toEqual([1000, 600]);
    });

    it('is empty where neither pays', () => {
      expect(prizeTable({ ...cup(), prizes: undefined }, 'main', 'positions')).toEqual([]);
    });
  });

  describe('scaledPrize', () => {
    it('multiplies a purse by the progression speed, in whole units', () => {
      expect(scaledPrize(1000, 1.5)).toBe(1500);
      expect(scaledPrize(333, 0.75)).toBe(250);
    });
  });

  describe('prizeSpeed', () => {
    const settings = { ...DEFAULT_CAREER_SETTINGS, progression: 2 };

    it("pays a career at its own progression speed", () => {
      expect(prizeSpeed({ kind: 'career', settings })).toBe(2);
    });

    it('reads the purse as it stands in a standalone championship, or outside a career', () => {
      expect(prizeSpeed({ kind: 'championship', settings })).toBe(1);
      expect(prizeSpeed(null)).toBe(1);
    });
  });
});
