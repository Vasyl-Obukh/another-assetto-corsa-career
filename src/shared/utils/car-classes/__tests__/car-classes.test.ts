import { describe, expect, it } from '@jest/globals';

import { EMPTY_CLASS_LAYER } from '../../../constants/index.ts';
import type { CarClass, CarSpec, ClassLayer } from '../../../types/index.ts';
import {
  carClassesOf,
  carClassName,
  carSpecName,
  carSpecsOf,
  CLASS_NAMES,
  classificationOf,
  classOfSpec,
  isKnownSpec,
  resolveCatalogue,
  SHIPPED_CATALOGUE,
  SPEC_CARS,
  specCars,
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

/**
 * A layer holding only what a test gives it.
 * @param overrides What the layer holds
 * @returns A complete layer
 */
const layerOf = (overrides: Partial<ClassLayer> = {}): ClassLayer => ({
  ...structuredClone(EMPTY_CLASS_LAYER),
  ...overrides,
});

/**
 * Two specs of one class, for a car to be put on both.
 * @returns The class and two of its specs
 */
const twoOfOneClass = (): { carClass: CarClass; specs: [CarSpec, CarSpec] } => {
  const found = SHIPPED_CATALOGUE.classes.find((one) => one.specs.length >= 2);
  if (!found) throw new Error('the catalogue has no class with two specs');

  return { carClass: found.id as CarClass, specs: [found.specs[0] as CarSpec, found.specs[1] as CarSpec] };
};

const USER_CLASS = { id: 'user-class', name: 'Hillclimb' };
const USER_SPEC = { id: 'user-spec', name: 'Hillclimb (2020s)', class: USER_CLASS.id };

describe('shared/utils/car-classes', () => {
  describe('resolveCatalogue', () => {
    it('resolves an empty layer to exactly what the app ships', () => {
      const catalogue = resolveCatalogue(layerOf());

      expect(catalogue.classes.map((one) => one.id)).toEqual(Object.keys(CLASS_NAMES));
      expect([...catalogue.specById.keys()]).toEqual(Object.keys(SPECS));
      expect(catalogue.overridden.size).toBe(0);
    });

    // A field draws from a spec's list in order, so a grid nobody touched has to
    // be the shipped list itself or a round composes a different race.ini.
    it('hands back the shipped list for every grid no override touches', () => {
      const { spec } = anyListing();

      expect(SHIPPED_CATALOGUE.carsBySpec.get(spec)).toBe(SPEC_CARS[spec]);
    });

    it('adds the user\'s classes and specs after the shipped ones', () => {
      const catalogue = resolveCatalogue(layerOf({ classes: [USER_CLASS], specs: [USER_SPEC] }));

      expect(catalogue.classes.at(-1)).toEqual({ ...USER_CLASS, origin: 'user', specs: [USER_SPEC.id] });
      expect(catalogue.specById.get(USER_SPEC.id)).toEqual({ ...USER_SPEC, origin: 'user' });
    });

    it('skips a class or spec of the user\'s reusing an id the app ships', () => {
      const { carClass, specs } = twoOfOneClass();
      const catalogue = resolveCatalogue(layerOf({
        classes: [{ id: carClass, name: 'Hijacked' }],
        specs: [{ id: specs[0], name: 'Hijacked', class: carClass }],
      }));

      expect(catalogue.classById.get(carClass)?.origin).toBe('shipped');
      expect(catalogue.specById.get(specs[0])?.origin).toBe('shipped');
      expect(catalogue.classById.get(carClass)?.specs).toEqual(SHIPPED_CATALOGUE.classById.get(carClass)?.specs);
    });

    it('skips a spec whose class does not resolve', () => {
      const catalogue = resolveCatalogue(layerOf({ specs: [USER_SPEC] }));

      expect(catalogue.specById.has(USER_SPEC.id)).toBe(false);
    });

    it('replaces a car\'s shipped specs with its own list, on both sides of the index', () => {
      const { spec, carId } = anyListing();
      const catalogue = resolveCatalogue(layerOf({
        classes: [USER_CLASS], specs: [USER_SPEC], cars: { [carId]: [USER_SPEC.id] },
      }));

      expect(carSpecsOf(carId, catalogue)).toEqual([USER_SPEC.id]);
      expect(specCars(spec, catalogue)).not.toContain(carId);
      expect(specCars(USER_SPEC.id, catalogue)).toEqual([carId]);
    });

    it('takes a car deliberately left unclassified off every grid', () => {
      const { spec, carId } = anyListing();
      const catalogue = resolveCatalogue(layerOf({ cars: { [carId]: [] } }));

      expect(carSpecsOf(carId, catalogue)).toEqual([]);
      expect(specCars(spec, catalogue)).not.toContain(carId);
      expect(catalogue.overridden.has(carId)).toBe(true);
    });

    // The class store refuses both, so this is the backstop for a hand-edited
    // file rather than the rule itself.
    it('keeps only the first spec of each class a car lists, and none the catalogue lacks', () => {
      const { specs } = twoOfOneClass();
      const catalogue = resolveCatalogue(layerOf({ cars: { my_mod: ['ghost', specs[1], specs[0]] } }));

      expect(carSpecsOf('my_mod', catalogue)).toEqual([specs[1]]);
    });

    it('appends the cars the user added to a grid after the shipped ones, sorted', () => {
      const { spec } = anyListing();
      const catalogue = resolveCatalogue(layerOf({ cars: { z_mod: [spec], a_mod: [spec] } }));

      expect(specCars(spec, catalogue)).toEqual([...SPEC_CARS[spec], 'a_mod', 'z_mod']);
    });
  });

  describe('carSpecsOf', () => {
    it('is empty for a car the catalogue does not name', () => {
      expect(carSpecsOf('some_unclassified_mod', SHIPPED_CATALOGUE)).toEqual([]);
    });

    it('finds the grid a catalogued car races on', () => {
      const { spec, carId } = anyListing();
      expect(carSpecsOf(carId, SHIPPED_CATALOGUE)).toContain(spec);
    });

    it('finds every grid a car that races on more than one is listed in', () => {
      const several = [...specsByCar()].filter(([, specs]) => specs.length > 1);

      // Not a given: a catalogue where every car races on exactly one grid is
      // legitimate, and this asserts nothing rather than inventing a car.
      for (const [carId, specs] of several) {
        expect([...carSpecsOf(carId, SHIPPED_CATALOGUE)].sort()).toEqual([...specs].sort());
      }
    });
  });

  describe('carClassesOf', () => {
    it('is empty for a car the catalogue does not name', () => {
      expect(carClassesOf('some_unclassified_mod', SHIPPED_CATALOGUE)).toEqual([]);
    });

    it('derives the class from the spec rather than being told it', () => {
      const { spec, carId } = anyListing();
      expect(carClassesOf(carId, SHIPPED_CATALOGUE)).toContain(SPECS[spec].class);
    });

    // A car may hold several specs, but never two of one class - that would
    // claim it is two eras of the same category at once. Guarded here because
    // carClassesOf deduplicates, so the catalogue error would be invisible.
    it('never names one class twice for a car', () => {
      for (const carId of specsByCar().keys()) {
        const classes = carClassesOf(carId, SHIPPED_CATALOGUE);
        expect(classes).toHaveLength(new Set(classes).size);
      }
    });
  });

  describe('carSpecName', () => {
    it('reads a spec\'s display name', () => {
      const { spec } = anyListing();
      expect(carSpecName(spec, SHIPPED_CATALOGUE)).toBe(SPECS[spec].name);
    });

    it('names every spec, since an unnamed one would render blank', () => {
      for (const spec of Object.keys(SPECS) as CarSpec[]) {
        expect(carSpecName(spec, SHIPPED_CATALOGUE).trim()).not.toBe('');
      }
    });

    it('falls back to the id for a spec the catalogue lacks, rather than rendering blank', () => {
      expect(carSpecName('ghost-spec', SHIPPED_CATALOGUE)).toBe('ghost-spec');
    });
  });

  describe('carClassName', () => {
    it('names every class, since an unnamed one would render blank', () => {
      for (const carClass of Object.keys(CLASS_NAMES) as CarClass[]) {
        expect(carClassName(carClass, SHIPPED_CATALOGUE).trim()).not.toBe('');
      }
    });

    it('reads the name of a class the user made', () => {
      const catalogue = resolveCatalogue(layerOf({ classes: [USER_CLASS] }));

      expect(carClassName(USER_CLASS.id, catalogue)).toBe(USER_CLASS.name);
    });

    it('falls back to the id for a class the catalogue lacks', () => {
      expect(carClassName('ghost-class', SHIPPED_CATALOGUE)).toBe('ghost-class');
    });
  });

  describe('classOfSpec', () => {
    it('places a spec in its class', () => {
      const { spec } = anyListing();
      expect(classOfSpec(spec, SHIPPED_CATALOGUE)).toBe(SPECS[spec].class);
    });

    it('places nothing for a spec the catalogue lacks', () => {
      expect(classOfSpec('ghost-spec', SHIPPED_CATALOGUE)).toBeNull();
    });

    it('places every spec in a class that has a name', () => {
      for (const spec of Object.keys(SPECS) as CarSpec[]) {
        expect(CLASS_NAMES[classOfSpec(spec, SHIPPED_CATALOGUE) as CarClass]).toBeDefined();
      }
    });
  });

  describe('specCars', () => {
    it('lists a grid in the order the catalogue gives it', () => {
      const { spec } = anyListing();

      expect(specCars(spec, SHIPPED_CATALOGUE)).toEqual(SPEC_CARS[spec]);
    });

    it('is empty for a spec the catalogue lacks', () => {
      expect(specCars('ghost-spec', SHIPPED_CATALOGUE)).toEqual([]);
    });
  });

  describe('isKnownSpec', () => {
    it('knows a spec the app ships and one the user made', () => {
      const catalogue = resolveCatalogue(layerOf({ classes: [USER_CLASS], specs: [USER_SPEC] }));

      expect(isKnownSpec(anyListing().spec, catalogue)).toBe(true);
      expect(isKnownSpec(USER_SPEC.id, catalogue)).toBe(true);
    });

    it('does not know a spec only another machine\'s layer holds', () => {
      expect(isKnownSpec(USER_SPEC.id, SHIPPED_CATALOGUE)).toBe(false);
    });
  });

  describe('classificationOf', () => {
    it('reads a car nobody restated as shipped, classified or not', () => {
      expect(classificationOf(anyListing().carId, SHIPPED_CATALOGUE)).toBe('shipped');
      expect(classificationOf('some_unclassified_mod', SHIPPED_CATALOGUE)).toBe('shipped');
    });

    it('reads a restated car the app classifies as adjusted, and one it does not as the user\'s', () => {
      const { carId } = anyListing();
      const catalogue = resolveCatalogue(layerOf({ cars: { [carId]: [], my_mod: [anyListing().spec] } }));

      expect(classificationOf(carId, catalogue)).toBe('adjusted');
      expect(classificationOf('my_mod', catalogue)).toBe('user');
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
