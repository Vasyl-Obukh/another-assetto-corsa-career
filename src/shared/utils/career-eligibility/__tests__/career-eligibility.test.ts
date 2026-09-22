import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../types/index.ts';
import type { LadderPosition, SeriesListing } from '../../../types/index.ts';
import { isEligible, startingLevels } from '../career-eligibility.ts';
import type { DisciplineLevels } from '../career-eligibility.ts';

/**
 * A ladder position, which is all either function reads of an entry.
 * @param discipline The kind of racing it is
 * @param tier Which rung it sits on, 1 being the top
 * @returns The position
 */
const at = (discipline: Discipline, tier: number): LadderPosition => ({ discipline, tier });

/**
 * A listing carrying only the ladder positions the starting levels are read off.
 * @param ladders Where its class entries sit
 * @returns The listing
 */
const listing = (ladders: readonly LadderPosition[]): SeriesListing => ({
  series: { entries: ladders.map((ladder) => ({ ladder })) },
} as unknown as SeriesListing);

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

  describe('startingLevels', () => {
    it('opens the bottom two rungs a discipline offers', () => {
      const library = [listing([at(Discipline.TOURING, 1), at(Discipline.TOURING, 5)])];

      expect(startingLevels(library)[Discipline.TOURING]).toBe(4);
    });

    // The bottom rung is a fact about the championships installed, so a mod
    // that deepens a discipline moves where a career opens.
    it('reads the bottom rung off the library rather than a fixed number', () => {
      const shallow = [listing([at(Discipline.SPORTSCAR, 3)])];
      const deep = [listing([at(Discipline.SPORTSCAR, 3)]), listing([at(Discipline.SPORTSCAR, 7)])];

      expect(startingLevels(shallow)[Discipline.SPORTSCAR]).toBe(2);
      expect(startingLevels(deep)[Discipline.SPORTSCAR]).toBe(6);
    });

    it('never opens a rung above the top of the ladder', () => {
      const library = [listing([at(Discipline.SINGLE_SEATER, 1)])];

      expect(startingLevels(library)[Discipline.SINGLE_SEATER]).toBe(1);
    });

    // Guards a bug: the fallback was the seed of every discipline's own reduce
    // rather than the answer for an empty one, so the deepest discipline set the
    // bottom rung for all of them - one imported tier-7 single-seater series
    // left a new career unable to enter anything at all.
    it('reads each discipline\'s bottom rung from its own championships alone', () => {
      const library = [listing([at(Discipline.SINGLE_SEATER, 7), at(Discipline.TOURING, 3)])];

      expect(startingLevels(library)[Discipline.TOURING]).toBe(2);
      expect(startingLevels(library)[Discipline.SINGLE_SEATER]).toBe(6);
    });

    it('falls back to the lowest rung seen anywhere for a discipline with no championship', () => {
      const library = [listing([at(Discipline.SINGLE_SEATER, 1), at(Discipline.SINGLE_SEATER, 6)])];

      expect(startingLevels(library)[Discipline.ROAD]).toBe(5);
    });

    it('holds a level for every discipline, even off an empty library', () => {
      expect(startingLevels([])).toEqual({
        [Discipline.SINGLE_SEATER]: 1,
        [Discipline.SPORTSCAR]: 1,
        [Discipline.TOURING]: 1,
        [Discipline.ROAD]: 1,
      });
    });
  });
});
