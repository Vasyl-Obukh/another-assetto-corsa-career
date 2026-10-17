import { describe, expect, it } from '@jest/globals';

import { DISCIPLINES } from '../../../../../shared/constants';
import { Discipline } from '../../../../../shared/types';
import type { LadderPosition, SeriesListing } from '../../../../../shared/types';
import { levelOptions, openPerDiscipline } from '../utils.ts';

/**
 * A championship as far as the starting levels read one: its name and the
 * rungs its classes enter at. The rest of a listing is never touched, so it is
 * left out and the shape cast.
 * @param name The championship's name
 * @param ladders Where each of its classes sits on the ladder
 * @returns The listing
 */
const listing = (name: string, ...ladders: LadderPosition[]): SeriesListing => ({
  series: { name, entries: ladders.map((ladder, at) => ({ id: `class-${at}`, ladder })) },
}) as unknown as SeriesListing;

/**
 * A ladder position.
 * @param discipline The kind of racing
 * @param tier The rung, 1 being the top
 * @returns The position
 */
const at = (discipline: Discipline, tier: number): LadderPosition => ({ discipline, tier });

const LIBRARY = [
  listing('Club Cup', at(Discipline.ROAD, 5)),
  listing('Formula Junior', at(Discipline.SINGLE_SEATER, 5)),
  listing('GT4 Series', at(Discipline.SPORTSCAR, 4)),
  listing('Endurance', at(Discipline.SPORTSCAR, 2), at(Discipline.SPORTSCAR, 4)),
  listing('Touring Masters', at(Discipline.TOURING, 3)),
];

describe('renderer/screens/new-career/utils', () => {
  describe('levelOptions', () => {
    it('offers every rung a class sits at, the lowest first', () => {
      expect(levelOptions(LIBRARY, 3).map((option) => option.tier)).toEqual([5, 4, 3, 2]);
    });

    it('counts the championships a career on a rung could enter, at it or below', () => {
      const counts = Object.fromEntries(levelOptions(LIBRARY, 3).map((option) => [option.tier, option.count]));

      expect(counts).toEqual({
        5: 2, 4: 4, 3: 5, 2: 5,
      });
    });

    it('counts a championship with classes on several rungs once', () => {
      const rung4 = levelOptions(LIBRARY, 3).find((option) => option.tier === 4);

      // GT4 Series, Endurance's GT4 class, and the two rung-5 championships.
      expect(rung4?.count).toBe(4);
    });

    it('names as examples only championships with a class at exactly that rung', () => {
      const rung4 = levelOptions(LIBRARY, 3).find((option) => option.tier === 4);

      expect(rung4?.examples).toEqual(['GT4 Series', 'Endurance']);
    });

    it('names no more examples than asked for', () => {
      expect(levelOptions(LIBRARY, 1).find((option) => option.tier === 5)?.examples).toEqual(['Club Cup']);
    });

    it('offers nothing for an empty library', () => {
      expect(levelOptions([], 3)).toEqual([]);
    });
  });

  describe('openPerDiscipline', () => {
    it('answers for every discipline, in the ladder\'s order', () => {
      expect(openPerDiscipline(LIBRARY, 5).map((one) => one.discipline)).toEqual(DISCIPLINES);
    });

    it('counts per discipline what a career on a rung could enter', () => {
      const counts = Object.fromEntries(openPerDiscipline(LIBRARY, 4).map((one) => [one.discipline, one.count]));

      expect(counts).toEqual({
        [Discipline.SINGLE_SEATER]: 1,
        [Discipline.SPORTSCAR]: 2,
        [Discipline.TOURING]: 0,
        [Discipline.ROAD]: 1,
      });
    });

    it('counts a championship in a discipline only through its classes in that discipline', () => {
      const mixed = [listing('Mixed', at(Discipline.TOURING, 5), at(Discipline.SPORTSCAR, 1))];
      const counts = Object.fromEntries(openPerDiscipline(mixed, 5).map((one) => [one.discipline, one.count]));

      expect(counts[Discipline.TOURING]).toBe(1);
      expect(counts[Discipline.SPORTSCAR]).toBe(0);
    });
  });
});
