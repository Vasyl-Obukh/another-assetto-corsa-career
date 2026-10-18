import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { SeriesListing } from '../../../../../shared/types';
import { classCars, laddersOf } from '../utils.ts';

/**
 * A round's availability, raceable or missing its track.
 * @param round The round's id
 * @param raceable Whether everything it needs is installed
 * @param eligible The cars each class may race in it, where it races others
 * than its season does
 * @returns The availability
 */
const roundState = (round: string, raceable: boolean, eligible?: Record<string, string[]>) => ({
  round,
  track: raceable ? null : 'missing',
  pitboxes: null,
  races: [],
  entries: Object.entries(eligible ?? {}).map(([entry, cars]) => ({ entry, eligible: cars, enough: true })),
});

/**
 * A two-class championship over three rounds, the GT3s at tier 2 and the GT4s
 * at tier 3 of sportscars, its first round's track missing.
 * @param rounds Each round's availability
 * @returns The listing
 */
const listing = (rounds = [roundState('r1', false), roundState('r2', true), roundState('r3', true)]): SeriesListing => ({
  series: {
    rounds: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }],
    entries: [
      { id: 'gt3', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 } },
      { id: 'gt4', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } },
      { id: 'gt3-am', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 } },
    ],
  },
  availability: {
    problems: [],
    rounds,
    entries: [
      { entry: 'gt3', eligible: ['ks_audi_r8_lms'], enough: true },
      { entry: 'gt4', eligible: ['ks_maserati_gt4'], enough: true },
      { entry: 'gt3-am', eligible: [], enough: true },
    ],
  },
} as unknown as SeriesListing);

describe('renderer/screens/new-championship/utils', () => {
  describe('classCars', () => {
    it('reads every class\'s cars off the first round that can be raced', () => {
      const cars = classCars(listing([
        roundState('r1', false, { gt3: ['ks_mercedes_amg_gt3'] }),
        roundState('r2', true, { gt3: ['ks_lamborghini_huracan_gt3'] }),
        roundState('r3', true),
      ]));

      expect(cars.map((one) => [one.entry.id, one.cars])).toEqual([
        ['gt3', ['ks_lamborghini_huracan_gt3']],
        ['gt4', ['ks_maserati_gt4']],
        ['gt3-am', []],
      ]);
    });

    it('offers no cars to any class when no round can be raced', () => {
      const cars = classCars(listing([roundState('r1', false), roundState('r2', false), roundState('r3', false)]));

      expect(cars.every((one) => one.cars.length === 0)).toBe(true);
    });
  });

  describe('laddersOf', () => {
    it('lists each rung its classes enter at once, in their order', () => {
      expect(laddersOf(listing())).toEqual([
        { discipline: Discipline.SPORTSCAR, tier: 2 },
        { discipline: Discipline.SPORTSCAR, tier: 3 },
      ]);
    });
  });
});
