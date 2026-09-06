import { describe, expect, it } from '@jest/globals';

import { randomFrom, seedFrom } from '../seeded-random.ts';

describe('core/seeded-random/seeded-random', () => {
  describe('seedFrom', () => {
    it('gives the same label the same seed', () => {
      expect(seedFrom('weekend:1')).toBe(seedFrom('weekend:1'));
    });

    it('gives different labels different seeds', () => {
      expect(seedFrom('weekend:1')).not.toBe(seedFrom('weekend:2'));
    });

    it('stays inside the generator range, empty string included', () => {
      [' ', '', 'weekend:0', 'a much longer label than any launch would carry'].forEach((label) => {
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
});
