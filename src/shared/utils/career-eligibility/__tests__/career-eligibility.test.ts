import { describe, expect, it } from '@jest/globals';

import { RATING_FLOORS, TOP_RUNG_WIDTH } from '../../../constants/index.ts';
import { Discipline } from '../../../types/index.ts';
import type { Championship, LadderPosition } from '../../../types/index.ts';
import {
  bestDiscipline, classRung, dropRating, fieldRating, isEligible, levelOfRating, levelsAt, LOWEST_RUNG, openLevels,
  ratingFloor, ratingsAt, rungFee, rungWidth,
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
      expect(ratingFloor(1)).toBe(RATING_FLOORS[0]);
    });

    it('reads each rung its own floor', () => {
      expect(ratingFloor(3)).toBe(RATING_FLOORS[2]);
    });

    it('gives every rung below the lowest named the lowest floor', () => {
      expect(ratingFloor(50)).toBe(RATING_FLOORS[RATING_FLOORS.length - 1]);
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

  describe('LOWEST_RUNG', () => {
    it('is the lowest rung the floors name', () => {
      expect(LOWEST_RUNG).toBe(RATING_FLOORS.length);
      expect(LOWEST_RUNG).toBe(5);
    });
  });

  describe('classRung', () => {
    const championship = {
      entries: [
        { id: 'hypercar', ladder: { discipline: Discipline.SPORTSCAR, tier: 1 } },
        { id: 'lmgt3', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } },
      ],
    } as unknown as Pick<Championship, 'entries'>;

    it('is the rung of the class it names', () => {
      expect(classRung(championship, 'lmgt3')).toBe(3);
      expect(classRung(championship, 'hypercar')).toBe(1);
    });

    it('is the top rung for a class the championship does not hold', () => {
      expect(classRung(championship, 'gone')).toBe(1);
      expect(classRung(championship, null)).toBe(1);
    });
  });

  describe('rungFee', () => {
    it('is each rung\'s typical entry fee', () => {
      expect(rungFee(1)).toBe(25_000);
      expect(rungFee(4)).toBe(3000);
      expect(rungFee(5)).toBe(700);
    });

    it('clamps a rung off either end of the ladder', () => {
      expect(rungFee(0)).toBe(25_000);
      expect(rungFee(8)).toBe(700);
    });
  });

  describe('rungWidth', () => {
    it('takes the top rung to be as wide as the figures say', () => {
      expect(rungWidth(1)).toBe(TOP_RUNG_WIDTH);
    });

    it('measures every other rung from its floor to the floor above it', () => {
      expect([2, 3, 4, 5].map(rungWidth)).toEqual([2500, 2000, 1500, 1000]);
    });

    it('reads a rung below the lowest named as the lowest, and one above the top as the top', () => {
      expect(rungWidth(9)).toBe(1000);
      expect(rungWidth(0)).toBe(TOP_RUNG_WIDTH);
    });
  });

  describe('fieldRating', () => {
    it("rates a rung's field at the middle of the rung", () => {
      expect([1, 2, 3, 4, 5].map(fieldRating)).toEqual([9500, 6750, 4500, 2750, 1500]);
    });

    it("rates a field below the lowest rung named as that rung's", () => {
      expect(fieldRating(7)).toBe(fieldRating(LOWEST_RUNG));
    });
  });

  describe('dropRating', () => {
    it('loses a rung under the middle of the rung beneath it', () => {
      expect(dropRating(1)).toBe(fieldRating(2));
      expect(dropRating(4)).toBe(1500);
    });

    it('never loses the lowest rung, nor any below it', () => {
      expect(dropRating(LOWEST_RUNG)).toBeNull();
      expect(dropRating(8)).toBeNull();
    });
  });

  describe('levelOfRating', () => {
    it('reaches a rung on its floor exactly', () => {
      expect(levelOfRating(8000)).toBe(1);
      expect(levelOfRating(3500)).toBe(3);
      expect(levelOfRating(2000)).toBe(4);
    });

    it('stays a rung down until the floor is reached', () => {
      expect(levelOfRating(7999)).toBe(2);
      expect(levelOfRating(1999)).toBe(5);
    });

    it('holds a rating above the top floor at the top', () => {
      expect(levelOfRating(12_000)).toBe(1);
    });

    it('holds a rating under the lowest floor on the lowest rung', () => {
      expect(levelOfRating(400)).toBe(LOWEST_RUNG);
    });
  });

  describe('bestDiscipline', () => {
    it('finds the discipline on the highest rung', () => {
      expect(bestDiscipline(levels({ [Discipline.ROAD]: 1 }))).toBe(Discipline.ROAD);
    });

    it('picks the first in ladder order where several share the best', () => {
      expect(bestDiscipline(levels())).toBe(Discipline.SINGLE_SEATER);
      expect(bestDiscipline(levels({ [Discipline.SPORTSCAR]: 2, [Discipline.TOURING]: 2 })))
        .toBe(Discipline.SPORTSCAR);
    });
  });

  describe('openLevels', () => {
    // An IndyCar driver can step into Formula 2, not straight into F1.
    it('opens each discipline at its own rung or one below the best, whichever is higher', () => {
      expect(openLevels(levels({
        [Discipline.SINGLE_SEATER]: 5, [Discipline.SPORTSCAR]: 2, [Discipline.TOURING]: 3, [Discipline.ROAD]: 4,
      }))).toEqual(levels({
        [Discipline.SINGLE_SEATER]: 3, [Discipline.SPORTSCAR]: 2, [Discipline.TOURING]: 3, [Discipline.ROAD]: 3,
      }));
    });

    it('leaves levels that all sit together as they are', () => {
      expect(openLevels(levels())).toEqual(levels());
    });

    it('lets a career enter a rung of another discipline only through the best', () => {
      const open = openLevels(levels({ [Discipline.SPORTSCAR]: 1, [Discipline.ROAD]: 5 }));

      expect(isEligible(at(Discipline.ROAD, 2), open)).toBe(true);
      expect(isEligible(at(Discipline.ROAD, 1), open)).toBe(false);
    });
  });
});
