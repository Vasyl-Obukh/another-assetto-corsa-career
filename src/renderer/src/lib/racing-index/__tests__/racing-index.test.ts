import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { ClassEntry, Round, SeriesListing } from '../../../../../shared/types';
import { SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import { makeSeries } from '../../season-results/__tests__/fixtures.ts';
import { NOTHING } from '../constants.ts';
import { racedIds, racingIndex } from '../racing-index.ts';

/**
 * A class entry fielding a list of cars.
 * @param id Its id
 * @param discipline Which discipline it enters at
 * @param cars The cars it may field
 * @returns The class entry
 */
const entry = (id: string, discipline: Discipline, cars: string[]): ClassEntry => ({
  id, name: id, ladder: { discipline, tier: 3 }, seats: [], eligibility: { kind: 'cars', cars },
});

/**
 * A championship as the library lists it.
 * @param id Its id
 * @param entries Its classes
 * @param tracks The circuit each round races at
 * @returns The listing
 */
const listing = (id: string, entries: ClassEntry[], tracks: string[]): SeriesListing => ({
  series: makeSeries({
    id,
    entries,
    rounds: tracks.map((track, at): Round => ({ id: `r${at}`, name: track, track: { id: track, layout: 'gp' } })),
  }),
} as SeriesListing);

describe('renderer/lib/racing-index/racing-index', () => {
  describe('racingIndex', () => {
    it('counts each championship a car races in once, however many classes field it', () => {
      const index = racingIndex([
        listing('gt', [
          entry('pro', Discipline.SPORTSCAR, ['ks_audi_r8']),
          entry('am', Discipline.SPORTSCAR, ['ks_audi_r8']),
        ], ['spa']),
        listing('touring', [entry('main', Discipline.TOURING, ['ks_audi_r8'])], ['monza']),
      ], SHIPPED_CATALOGUE);

      expect(index.cars.get('ks_audi_r8')?.championships).toBe(2);
      expect(new Set(index.cars.get('ks_audi_r8')?.disciplines))
        .toEqual(new Set([Discipline.SPORTSCAR, Discipline.TOURING]));
    });

    it('counts a circuit once however many rounds it holds, under every discipline racing it', () => {
      const index = racingIndex([
        listing('multi', [
          entry('proto', Discipline.SPORTSCAR, ['a']),
          entry('formula', Discipline.SINGLE_SEATER, ['b']),
        ], ['spa', 'spa', 'monza']),
      ], SHIPPED_CATALOGUE);

      expect(index.tracks.get('spa')?.championships).toBe(1);
      expect(new Set(index.tracks.get('spa')?.disciplines))
        .toEqual(new Set([Discipline.SPORTSCAR, Discipline.SINGLE_SEATER]));
      expect(index.cars.get('b')?.disciplines).toEqual([Discipline.SINGLE_SEATER]);
    });

    it('lists the disciplines in ladder order whatever order they were met in', () => {
      const ladder = Object.values(Discipline);
      const index = racingIndex([
        listing('one', [entry('x', ladder[ladder.length - 1], ['car'])], ['spa']),
        listing('two', [entry('y', ladder[0], ['car'])], ['spa']),
      ], SHIPPED_CATALOGUE);

      expect(index.cars.get('car')?.disciplines).toEqual([ladder[0], ladder[ladder.length - 1]]);
    });

    it('leaves out anything no championship races', () => {
      const index = racingIndex([], SHIPPED_CATALOGUE);

      expect(index.cars.size).toBe(0);
      expect(index.tracks.size).toBe(0);
    });
  });

  describe('racedIds', () => {
    it('asks for everything raced where nothing else narrows it', () => {
      expect(racedIds(undefined, ['a', 'b'])).toEqual(['a', 'b']);
    });

    it('keeps what the caller narrowed to that is also raced', () => {
      expect(racedIds(['a', 'c'], ['a', 'b'])).toEqual(['a']);
    });

    // An empty list reads as no filter at all to main, which would show
    // everything rather than nothing.
    it('asks for an id no folder can have when nothing is left', () => {
      expect(racedIds(['c'], ['a', 'b'])).toEqual([NOTHING]);
      expect(racedIds(undefined, [])).toEqual([NOTHING]);
    });
  });
});
