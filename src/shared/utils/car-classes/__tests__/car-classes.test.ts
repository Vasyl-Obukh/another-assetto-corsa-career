import { describe, expect, it } from '@jest/globals';

import type { CarClass, CarSpec } from '../../../types/index.ts';
import {
  carClassesOf,
  carClassName,
  carSpecName,
  carSpecsOf,
  CLASS_NAMES,
  classOfSpec,
  SPEC_CARS,
  SPECS,
} from '../car-classes.ts';

/**
 * Every spec the catalogue lists cars for.
 */
const listedSpecs = Object.keys(SPEC_CARS) as CarSpec[];

/**
 * Picks a car out of the shipped catalogue rather than naming one.
 *
 * The class catalogue is meant to be corrected as the library grows, so a test
 * that hardcoded "this car is in that spec" would fail on an edit that was
 * entirely intentional. These read the answer out of the data and check the
 * lookups agree with it.
 * @returns A spec that lists at least one car, and its first car
 */
const anyListing = (): { spec: CarSpec; carId: string } => {
  const spec = listedSpecs.find((candidate) => SPEC_CARS[candidate].length > 0);
  if (spec === undefined) throw new Error('the catalogue lists no cars at all');

  return { spec, carId: SPEC_CARS[spec][0] };
};

/**
 * Counts how many specs each car is listed in.
 * @returns Car folder name to the specs listing it
 */
const specsByCar = (): Map<string, CarSpec[]> => {
  const index = new Map<string, CarSpec[]>();

  for (const spec of listedSpecs) {
    for (const car of SPEC_CARS[spec]) index.set(car, [...(index.get(car) ?? []), spec]);
  }

  return index;
};

describe('shared/utils/car-classes', () => {
  describe('carSpecsOf', () => {
    it('is empty for a car the catalogue does not name', () => {
      expect(carSpecsOf('some_unclassified_mod')).toEqual([]);
    });

    it('finds the grid a catalogued car races on', () => {
      const { spec, carId } = anyListing();
      expect(carSpecsOf(carId)).toContain(spec);
    });

    it('finds every grid a car that races on more than one is listed in', () => {
      const several = [...specsByCar()].filter(([, specs]) => specs.length > 1);

      // Not a given: a catalogue where every car races on exactly one grid is
      // legitimate, and this asserts nothing rather than inventing a car.
      for (const [carId, specs] of several) {
        expect([...carSpecsOf(carId)].sort()).toEqual([...specs].sort());
      }
    });
  });

  describe('carClassesOf', () => {
    it('is empty for a car the catalogue does not name', () => {
      expect(carClassesOf('some_unclassified_mod')).toEqual([]);
    });

    it('derives the class from the spec rather than being told it', () => {
      const { spec, carId } = anyListing();
      expect(carClassesOf(carId)).toContain(SPECS[spec].class);
    });

    // A car may hold several specs, but never two of one class - that would
    // claim it is two eras of the same category at once. Guarded here because
    // carClassesOf deduplicates, so the catalogue error would be invisible.
    it('never names one class twice for a car', () => {
      for (const carId of specsByCar().keys()) {
        const classes = carClassesOf(carId);
        expect(classes).toHaveLength(new Set(classes).size);
      }
    });
  });

  describe('carSpecName', () => {
    it('reads a spec\'s display name', () => {
      const { spec } = anyListing();
      expect(carSpecName(spec)).toBe(SPECS[spec].name);
    });

    it('names every spec, since an unnamed one would render blank', () => {
      for (const spec of Object.keys(SPECS) as CarSpec[]) {
        expect(carSpecName(spec).trim()).not.toBe('');
      }
    });
  });

  describe('carClassName', () => {
    it('names every class, since an unnamed one would render blank', () => {
      for (const carClass of Object.keys(CLASS_NAMES) as CarClass[]) {
        expect(carClassName(carClass).trim()).not.toBe('');
      }
    });
  });

  describe('classOfSpec', () => {
    it('places a spec in its class', () => {
      const { spec } = anyListing();
      expect(classOfSpec(spec)).toBe(SPECS[spec].class);
    });

    it('places every spec in a class that has a name', () => {
      for (const spec of Object.keys(SPECS) as CarSpec[]) {
        expect(CLASS_NAMES[classOfSpec(spec)]).toBeDefined();
      }
    });
  });

  describe('SPEC_CARS', () => {
    it('lists cars only under specs that exist', () => {
      for (const spec of listedSpecs) {
        expect(SPECS[spec]).toBeDefined();
      }
    });

    it('lists no car twice within one spec', () => {
      for (const spec of listedSpecs) {
        const cars = SPEC_CARS[spec];
        expect(cars).toHaveLength(new Set(cars).size);
      }
    });
  });
});
