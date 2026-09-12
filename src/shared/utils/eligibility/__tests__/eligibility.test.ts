import { describe, expect, it } from '@jest/globals';

import { CarSpec, Discipline } from '../../../types/index.ts';
import type { Championship, ClassEntry, Round } from '../../../types/index.ts';
import { SPEC_CARS } from '../../car-classes/index.ts';
import { carsOf, fieldableCars } from '../eligibility.ts';

/**
 * A championship with one class, racing the rounds a test names.
 * @param rounds Its calendar
 * @returns The championship and its only class entry
 */
const withRounds = (rounds: Round[]): { series: Championship; entry: ClassEntry } => {
  const entry: ClassEntry = {
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 6 },
    seats: [{ id: 'main-1' }],
    eligibility: { kind: 'cars', cars: ['test_car'] },
  };
  const series: Championship = {
    version: 1,
    id: 'test-cup',
    name: 'Test Cup',
    entries: [entry],
    rounds,
    weekendFormats: [{ id: 'standard', name: 'Race weekend', sessions: [{ type: 'race', laps: 8 }] }],
    defaultWeekendFormat: 'standard',
    pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
    defaultPointsSystem: 'race',
  };

  return { series, entry };
};

/**
 * A round that swaps one class onto other cars.
 * @param entry Which class entry it overrides
 * @param cars The cars it swaps to
 * @returns The round
 */
const swapping = (entry: string, cars: string[]): Round => ({
  id: 'oval',
  name: 'Oval',
  track: { id: 'daytona' },
  eligibility: [{ entry, eligibility: { kind: 'cars', cars } }],
});

const MAGIONE: Round = { id: 'magione', name: 'Magione', track: { id: 'magione' } };

describe('shared/utils/eligibility', () => {
  describe('carsOf', () => {
    it('reads a car list as it is written', () => {
      expect(carsOf({ kind: 'cars', cars: ['b_car', 'a_car'] })).toEqual(['b_car', 'a_car']);
    });

    it('reads a spec as whatever the catalogue puts on its grid', () => {
      expect(carsOf({ kind: 'spec', spec: CarSpec.GT3_2010S })).toBe(SPEC_CARS[CarSpec.GT3_2010S]);
    });
  });

  describe('fieldableCars', () => {
    it('reads the class entry own cars when no round overrides it', () => {
      const { series, entry } = withRounds([MAGIONE]);

      expect([...fieldableCars(series, entry)]).toEqual(['test_car']);
    });

    it('adds the cars a round swaps to, since a seat is pinned for the season', () => {
      const { series, entry } = withRounds([MAGIONE, swapping('main', ['oval_car'])]);

      expect([...fieldableCars(series, entry)].sort()).toEqual(['oval_car', 'test_car']);
    });

    it('ignores an override aimed at a different class entry', () => {
      const { series, entry } = withRounds([MAGIONE, swapping('other', ['oval_car'])]);

      expect([...fieldableCars(series, entry)]).toEqual(['test_car']);
    });

    it('names a car once however many rounds swap to it', () => {
      const { series, entry } = withRounds([
        swapping('main', ['test_car', 'oval_car']),
        { ...swapping('main', ['oval_car']), id: 'oval-2' },
      ]);

      expect([...fieldableCars(series, entry)]).toEqual(['test_car', 'oval_car']);
    });
  });
});
