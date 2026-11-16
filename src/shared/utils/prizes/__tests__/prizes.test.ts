import { describe, expect, it } from '@jest/globals';

import { DEFAULT_CAREER_SETTINGS } from '../../../constants/index.ts';
import { Discipline } from '../../../types/index.ts';
import type { Championship, ClassEntry } from '../../../types/index.ts';
import {
  classShare, eventRung, paidTable, prizeSpeed, prizeTable, purseRung, purseShare, scaledPrize,
} from '../prizes.ts';

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
 * A full grid of seats, which pays a class's tables in full.
 */
const FULL = Array.from({ length: 12 }, (_, at) => ({ id: `seat-${at + 1}` }));

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

  describe('classShare', () => {
    it('pays a full grid, or more, its tables in full', () => {
      expect(classShare(classEntry({ seats: FULL }))).toBe(1);
      expect(classShare(classEntry({ seats: [...FULL, ...FULL] }))).toBe(1);
    });

    it('pays a smaller field in proportion to it', () => {
      expect(classShare(classEntry({ seats: FULL.slice(0, 6) }))).toBe(0.5);
      expect(classShare(classEntry({ seats: FULL.slice(0, 3) }))).toBe(0.25);
    });

    it('scales a historic purse raced from a lower rung by the two rungs\' fees', () => {
      const platinum = classEntry({ seats: FULL, ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 } });

      expect(classShare(platinum, 5)).toBe(700 / 25_000);
      expect(classShare(platinum, 4)).toBe(3000 / 25_000);
    });

    it('never raises a purse raced from the rung of its class or above it', () => {
      const bronze = classEntry({ seats: FULL, ladder: { discipline: Discipline.ROAD, tier: 4 } });

      expect(classShare(bronze, 4)).toBe(1);
      expect(classShare(bronze, 1)).toBe(1);
    });

    it('takes both shares of a small class raced from a lower rung', () => {
      const small = classEntry({ seats: FULL.slice(0, 6), ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } });

      expect(classShare(small, 5)).toBe(0.5 * (700 / 5000));
    });
  });

  describe('purseShare', () => {
    it('is the share of the class it names', () => {
      expect(purseShare(cup([classEntry({ seats: FULL.slice(0, 6) })]), 'main')).toBe(0.5);
    });

    it('pays in full for a class the championship does not hold', () => {
      expect(purseShare(cup([classEntry({ seats: FULL.slice(0, 6) })]), 'gone')).toBe(1);
      expect(purseShare(cup(), null)).toBe(1);
    });
  });

  describe('paidTable', () => {
    it('is the class\'s table at its share', () => {
      const championship = cup([classEntry({ seats: FULL.slice(0, 6) })]);

      expect(paidTable(championship, 'main', 'positions')).toEqual([500, 300]);
      expect(paidTable(championship, 'main', 'standings')).toEqual([5000]);
    });

    it('scales a historic purse to the rung it is raced from', () => {
      const championship = cup([classEntry({ seats: FULL, ladder: { discipline: Discipline.ROAD, tier: 1 } })]);

      expect(paidTable(championship, 'main', 'positions', 2)).toEqual([400, 240]);
    });

    it('leaves a full grid raced on its own rung as written', () => {
      expect(paidTable(cup([classEntry({ seats: FULL })]), 'main', 'positions')).toEqual([1000, 600]);
    });

    it('is empty where nothing pays', () => {
      expect(paidTable({ ...cup(), prizes: undefined }, 'main', 'positions')).toEqual([]);
    });
  });

  describe('eventRung', () => {
    const level = {
      [Discipline.SINGLE_SEATER]: 5,
      [Discipline.SPORTSCAR]: 3,
      [Discipline.TOURING]: 4,
      [Discipline.ROAD]: 5,
    };

    it('is the career\'s own rung in the discipline of an event\'s only class', () => {
      const event = cup([classEntry({ ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 } })]);

      expect(eventRung(event, level)).toBe(5);
    });

    it('is the career\'s highest among the disciplines of the event\'s classes', () => {
      const event = cup([
        classEntry({ id: 'sp8', ladder: { discipline: Discipline.TOURING, tier: 2 } }),
        classEntry({ id: 'sp7', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } }),
      ]);

      expect(eventRung(event, level)).toBe(3);
    });

    it('is none for an event with no classes', () => {
      expect(eventRung(cup([]), level)).toBeUndefined();
    });
  });

  describe('purseRung', () => {
    const career = {
      level: {
        [Discipline.SINGLE_SEATER]: 5,
        [Discipline.SPORTSCAR]: 3,
        [Discipline.TOURING]: 4,
        [Discipline.ROAD]: 4,
      },
    };
    const event = cup([classEntry({ ladder: { discipline: Discipline.ROAD, tier: 1 } })]);

    it('is the rung the entry keeps once the career is in', () => {
      expect(purseRung(event, career, { rung: 2 }, { rung: 3 })).toBe(2);
    });

    it('pays in full an entry made before purses were scaled, whatever the career holds now', () => {
      expect(purseRung(event, career, {}, { rung: 3 })).toBeUndefined();
    });

    it('is the rung its invitation was decided on before the career is in', () => {
      expect(purseRung(event, career, null, { rung: 3 })).toBe(3);
    });

    it('is the career\'s own before any invitation has decided one', () => {
      expect(purseRung(event, career)).toBe(4);
      expect(purseRung(event, career, null, { rung: undefined })).toBe(4);
    });
  });

  describe('scaledPrize', () => {
    it('multiplies a purse by the progression speed, in whole units', () => {
      expect(scaledPrize(1000, 1.5)).toBe(1500);
      expect(scaledPrize(333, 0.75)).toBe(250);
    });
  });

  describe('prizeSpeed', () => {
    const settings = { ...DEFAULT_CAREER_SETTINGS, prizeSpeed: 2 };

    it("pays a career at its own progression speed", () => {
      expect(prizeSpeed({ kind: 'career', settings })).toBe(2);
    });

    it('reads the purse as it stands in a standalone championship, or outside a career', () => {
      expect(prizeSpeed({ kind: 'championship', settings })).toBe(1);
      expect(prizeSpeed(null)).toBe(1);
    });
  });
});
