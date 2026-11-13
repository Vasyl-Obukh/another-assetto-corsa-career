import { describe, expect, it } from '@jest/globals';

import { intIn, randomFrom, seedFrom } from '../seeded-random.ts';

describe('core/seeded-random/seeded-random', () => {
  describe('seedFrom', () => {
    it('gives the same label the same seed', () => {
      expect(seedFrom('event:1')).toBe(seedFrom('event:1'));
    });

    it('gives different labels different seeds', () => {
      expect(seedFrom('event:1')).not.toBe(seedFrom('event:2'));
    });

    it('stays inside the generator range, empty string included', () => {
      [' ', '', 'event:0', 'a much longer label than any launch would carry'].forEach((label) => {
        expect(seedFrom(label)).toBeGreaterThanOrEqual(1);
        expect(seedFrom(label)).toBeLessThanOrEqual(2147483646);
      });
    });
  });

  describe('randomFrom', () => {
    it('yields the same sequence from the same seed', () => {
      const left = randomFrom(seedFrom('x'));
      const right = randomFrom(seedFrom('x'));

      expect([left(), left(), left()]).toEqual([right(), right(), right()]);
    });

    it('yields numbers from zero up to but not including one', () => {
      const random = randomFrom(seedFrom('y'));
      Array.from({ length: 200 }).forEach(() => {
        const value = random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      });
    });
  });

  describe('intIn', () => {
    it('draws whole numbers inside the range, reaching both ends', () => {
      const random = randomFrom(seedFrom('range'));
      const drawn = new Set(Array.from({ length: 200 }, () => intIn([3, 6], random)));

      expect([...drawn].sort()).toEqual([3, 4, 5, 6]);
    });

    it('draws the one number a range of one holds', () => {
      expect(intIn([5, 5], randomFrom(1))).toBe(5);
    });
  });
});
