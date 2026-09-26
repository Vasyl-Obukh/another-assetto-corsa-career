import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type {
  Championship, ClassEntry, Eligibility, Round, SeriesListing, SpecId,
} from '../../../../../shared/types';
import { SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import {
  carChampionships, curveAxis, curvePath, rpmTicks,
} from '../utils.ts';

/**
 * A class entry racing to one rule, which is all carChampionships reads off it.
 * @param id The entry's id
 * @param eligibility The cars it may field
 * @returns The entry
 */
const entry = (id: string, eligibility: Eligibility): ClassEntry => (({
  id,
  name: id,
  ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
  seats: [],
  eligibility,
}));

/**
 * A listing of one championship, built from what carChampionships reads.
 * @param id The championship's id
 * @param entries Its class entries
 * @param rounds Its rounds, where one overrides an entry's cars
 * @returns The listing
 */
const listing = (
  id: string,
  entries: readonly ClassEntry[],
  rounds: readonly Partial<Round>[] = [],
): SeriesListing => ({
  series: {
    id, name: `${id} name`, entries, rounds,
  } as unknown as Championship,
} as SeriesListing);

describe('renderer/screens/car-detail/utils', () => {
  describe('carChampionships', () => {
    const cars = (...ids: string[]): Eligibility => ({ kind: 'cars', cars: ids });

    it('lists each championship fielding the car, with the classes that may field it', () => {
      const gt3 = entry('gt3', cars('ks_audi_r8', 'ks_ferrari_488'));
      const gt4 = entry('gt4', cars('ks_maserati_gt4'));
      const both = entry('pro-am', cars('ks_audi_r8'));

      expect(carChampionships('ks_audi_r8', [listing('gtwc', [gt3, gt4, both])], SHIPPED_CATALOGUE)).toEqual([
        { id: 'gtwc', name: 'gtwc name', entries: [gt3, both] },
      ]);
    });

    it('leaves out a championship that never fields the car', () => {
      const listings = [
        listing('mx5', [entry('mx5', cars('ks_mazda_mx5_cup'))]),
        listing('gtwc', [entry('gt3', cars('ks_audi_r8'))]),
      ];

      expect(carChampionships('ks_audi_r8', listings, SHIPPED_CATALOGUE).map((one) => one.id)).toEqual(['gtwc']);
    });

    it('keeps the order the championships are listed in', () => {
      const listings = ['b', 'a', 'c'].map((id) => listing(id, [entry('main', cars('ks_audi_r8'))]));

      expect(carChampionships('ks_audi_r8', listings, SHIPPED_CATALOGUE).map((one) => one.id))
        .toEqual(['b', 'a', 'c']);
    });

    // An IndyCar-shaped calendar runs a road kit at three rounds only, and the
    // car still races in the championship.
    it('counts a car a round fields in place of the class rule', () => {
      const oval = entry('indycar', cars('indycar_oval'));
      const series = listing('indycar', [oval], [{
        eligibility: [{ entry: 'indycar', eligibility: cars('indycar_road') }],
      }]);

      expect(carChampionships('indycar_road', [series], SHIPPED_CATALOGUE)).toEqual([
        { id: 'indycar', name: 'indycar name', entries: [oval] },
      ]);
    });

    it('reads a spec rule through the catalogue', () => {
      const [spec, specCars] = [...SHIPPED_CATALOGUE.carsBySpec].find(([, ids]) => ids.length > 0) as [
        SpecId, readonly string[],
      ];
      const ruled = entry('spec', { kind: 'spec', spec });

      expect(carChampionships(specCars[0], [listing('spec-cup', [ruled])], SHIPPED_CATALOGUE)).toEqual([
        { id: 'spec-cup', name: 'spec-cup name', entries: [ruled] },
      ]);
    });

    it('is empty when nothing races the car', () => {
      expect(carChampionships('ks_audi_r8', [], SHIPPED_CATALOGUE)).toEqual([]);
    });
  });

  describe('curveAxis', () => {
    // 511 bhp would otherwise top out at an unlabelled 511.
    it('tops the axis at the next round figure above the peak', () => {
      expect(curveAxis([[1000, 120], [6000, 511], [8000, 480]])).toEqual({
        max: 600, ticks: [0, 150, 300, 450, 600],
      });
    });

    it('keeps a peak that is already a round figure as the top', () => {
      expect(curveAxis([[1000, 400]])).toEqual({ max: 400, ticks: [0, 100, 200, 300, 400] });
    });

    it('rounds the step between gridlines, whatever power of ten the peak falls in', () => {
      expect(curveAxis([[1000, 47]])?.ticks).toEqual([0, 12, 24, 36, 48]);
      expect(curveAxis([[1000, 1180]])?.ticks).toEqual([0, 300, 600, 900, 1200]);
    });

    it('has no axis for an empty curve', () => {
      expect(curveAxis([])).toBeNull();
    });

    it('has no axis for a curve that never leaves zero', () => {
      expect(curveAxis([[1000, 0], [2000, 0]])).toBeNull();
    });
  });

  describe('rpmTicks', () => {
    it('labels every thousand rpm across the range', () => {
      expect(rpmTicks(1000, 4000)).toEqual([1000, 2000, 3000, 4000]);
    });

    it('starts at the first thousand inside the range', () => {
      expect(rpmTicks(850, 3200)).toEqual([1000, 2000, 3000]);
    });

    it('is empty when no thousand falls inside the range', () => {
      expect(rpmTicks(1100, 1900)).toEqual([]);
    });
  });

  describe('curvePath', () => {
    it('moves to the first point and draws a line through the rest', () => {
      expect(curvePath([[1000, 10], [2000, 20], [3000, 15]], (rpm) => rpm / 100, (value) => 100 - value))
        .toBe('M10.0,90.0L20.0,80.0L30.0,85.0');
    });

    it('writes each coordinate to one decimal place', () => {
      expect(curvePath([[1, 1]], () => 1 / 3, () => 2 / 3)).toBe('M0.3,0.7');
    });

    it('is empty for an empty curve', () => {
      expect(curvePath([], (rpm) => rpm, (value) => value)).toBe('');
    });
  });
});
