import { describe, expect, it } from '@jest/globals';

import { RATING_PER_TIER, TOP_RATING_FLOOR } from '../../../constants/index.ts';
import { Discipline } from '../../../types/index.ts';
import type { LadderPosition } from '../../../types/index.ts';
import {
  isEligible, levelsAt, ratingFloor, ratingsAt,
} from '../career-eligibility.ts';
import type { DisciplineLevels } from '../career-eligibility.ts';

/**
 * A ladder position, which is all either function reads of an entry.
 * @param discipline The kind of racing it is
 * @param tier Which rung it sits on, 1 being the top
 * @returns The position
 */
const at = (discipline: Discipline, tier: number): LadderPosition => ({ discipline, tier });

/**
 * A whole set of levels, one per discipline, for a test to move one of.
 * @param overrides The disciplines to set to something else
 * @returns The levels
 */
const levels = (overrides: Partial<DisciplineLevels> = {}): DisciplineLevels => ({
  [Discipline.SINGLE_SEATER]: 3,
  [Discipline.SPORTSCAR]: 3,
  [Discipline.TOURING]: 3,
  [Discipline.ROAD]: 3,
  ...overrides,
});

describe('shared/utils/career-eligibility', () => {
  describe('isEligible', () => {
    it('lets a career enter the rung it stands on', () => {
      expect(isEligible(at(Discipline.ROAD, 3), levels())).toBe(true);
    });

    // A larger tier number is a lower rung, so this is the junior end.
    it('lets a career enter a rung below its own', () => {
      expect(isEligible(at(Discipline.ROAD, 5), levels())).toBe(true);
    });

    it('keeps a career out of a rung above its own', () => {
      expect(isEligible(at(Discipline.ROAD, 2), levels())).toBe(false);
    });

    it('answers on the level held in the entry\'s own discipline', () => {
      const held = levels({ [Discipline.SPORTSCAR]: 1, [Discipline.ROAD]: 6 });

      expect(isEligible(at(Discipline.SPORTSCAR, 4), held)).toBe(true);
      expect(isEligible(at(Discipline.ROAD, 4), held)).toBe(false);
    });
  });

  describe('levelsAt', () => {
    it('puts every discipline on the one rung picked', () => {
      expect(levelsAt(4)).toEqual(levels({
        [Discipline.SINGLE_SEATER]: 4, [Discipline.SPORTSCAR]: 4, [Discipline.TOURING]: 4, [Discipline.ROAD]: 4,
      }));
    });

    it('lets a career on it enter that rung and below in any discipline, and nothing above', () => {
      expect(isEligible(at(Discipline.TOURING, 4), levelsAt(4))).toBe(true);
      expect(isEligible(at(Discipline.SINGLE_SEATER, 5), levelsAt(4))).toBe(true);
      expect(isEligible(at(Discipline.SPORTSCAR, 3), levelsAt(4))).toBe(false);
    });
  });

  describe('ratingFloor', () => {
    it('starts the top rung at the top floor', () => {
      expect(ratingFloor(1)).toBe(TOP_RATING_FLOOR);
    });

    it('lowers the floor a fixed step per rung down', () => {
      expect(ratingFloor(3)).toBe(TOP_RATING_FLOOR - 2 * RATING_PER_TIER);
    });

    it('never goes below zero, however deep the ladder', () => {
      expect(ratingFloor(50)).toBe(0);
    });
  });

  describe('ratingsAt', () => {
    it('gives every discipline the floor of the rung picked', () => {
      const floor = ratingFloor(5);

      expect(ratingsAt(5)).toEqual(levels({
        [Discipline.SINGLE_SEATER]: floor,
        [Discipline.SPORTSCAR]: floor,
        [Discipline.TOURING]: floor,
        [Discipline.ROAD]: floor,
      }));
    });
  });
});
