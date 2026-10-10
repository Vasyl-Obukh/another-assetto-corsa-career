import { describe, expect, it } from '@jest/globals';

import { CarSpec, Discipline } from '../../../types/index.ts';
import type { Championship, ClassEntry, Round } from '../../../types/index.ts';
import { resolveCatalogue, SHIPPED_CATALOGUE, SPEC_CARS } from '../../car-classes/index.ts';
import { carsOf, fieldableCars, usesSpec } from '../eligibility.ts';

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
    eventFormats: [{ id: 'standard', name: 'Standard', sessions: [{ type: 'race', laps: 8 }] }],
    defaultEventFormat: 'standard',
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
      expect(carsOf({ kind: 'cars', cars: ['b_car', 'a_car'] }, SHIPPED_CATALOGUE)).toEqual(['b_car', 'a_car']);
    });

    it('reads a spec as whatever the catalogue puts on its grid', () => {
      expect(carsOf({ kind: 'spec', spec: CarSpec.GT3_2010S }, SHIPPED_CATALOGUE)).toBe(SPEC_CARS[CarSpec.GT3_2010S]);
    });

    it('reads a spec the catalogue lacks as no cars at all', () => {
      expect(carsOf({ kind: 'spec', spec: 'ghost-spec' }, SHIPPED_CATALOGUE)).toEqual([]);
    });
  });

  describe('fieldableCars', () => {
    it('reads the class entry own cars when no round overrides it', () => {
      const { series, entry } = withRounds([MAGIONE]);

      expect([...fieldableCars(series, entry, SHIPPED_CATALOGUE)]).toEqual(['test_car']);
    });

    it('adds the cars a round swaps to, since a seat is pinned for the season', () => {
      const { series, entry } = withRounds([MAGIONE, swapping('main', ['oval_car'])]);

      expect([...fieldableCars(series, entry, SHIPPED_CATALOGUE)].sort()).toEqual(['oval_car', 'test_car']);
    });

    it('ignores an override aimed at a different class entry', () => {
      const { series, entry } = withRounds([MAGIONE, swapping('other', ['oval_car'])]);

      expect([...fieldableCars(series, entry, SHIPPED_CATALOGUE)]).toEqual(['test_car']);
    });

    it('names a car once however many rounds swap to it', () => {
      const { series, entry } = withRounds([
        swapping('main', ['test_car', 'oval_car']),
        { ...swapping('main', ['oval_car']), id: 'oval-2' },
      ]);

      expect([...fieldableCars(series, entry, SHIPPED_CATALOGUE)]).toEqual(['test_car', 'oval_car']);
    });

    it('reads a spec through the catalogue it is handed', () => {
      const { series, entry } = withRounds([MAGIONE]);
      const racing = { ...entry, eligibility: { kind: 'spec' as const, spec: 'user-spec' } };
      const catalogue = resolveCatalogue({
        version: 1,
        classes: [{ id: 'user-class', name: 'Hillclimb' }],
        specs: [{ id: 'user-spec', name: 'Hillclimb (2020s)', class: 'user-class' }],
        cars: { my_mod: ['user-spec'] },
      });

      expect([...fieldableCars({ ...series, entries: [racing] }, racing, catalogue)]).toEqual(['my_mod']);
    });
  });

  describe('usesSpec', () => {
    it('finds a spec a class entry races in', () => {
      const { series, entry } = withRounds([MAGIONE]);
      const racing = { ...series, entries: [{ ...entry, eligibility: { kind: 'spec' as const, spec: CarSpec.GT3_2010S } }] };

      expect(usesSpec(racing, CarSpec.GT3_2010S)).toBe(true);
    });

    // A round swapping a class onto a spec needs that spec as much as the
    // season does, so deleting it is refused either way.
    it('finds a spec only one round swaps to', () => {
      const { series } = withRounds([MAGIONE, {
        ...MAGIONE,
        id: 'oval',
        eligibility: [{ entry: 'main', eligibility: { kind: 'spec', spec: CarSpec.GT3_2010S } }],
      }]);

      expect(usesSpec(series, CarSpec.GT3_2010S)).toBe(true);
    });

    it('does not find a spec nothing races in', () => {
      const { series } = withRounds([MAGIONE, swapping('main', ['oval_car'])]);

      expect(usesSpec(series, CarSpec.GT3_2010S)).toBe(false);
    });
  });
});
