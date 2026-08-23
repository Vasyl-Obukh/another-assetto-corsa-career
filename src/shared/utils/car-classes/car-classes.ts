// Looking a car up in the shipped class catalogue. The reverse index is built
// once at module load, the same way the provenance catalogue builds its ID sets.

import { CLASS_NAMES, SPEC_CARS, SPECS } from './constants.ts';
import type { CarClass, CarSpec } from '../../types/index.ts';

export { CLASS_NAMES, SPEC_CARS, SPECS } from './constants.ts';

/**
 * Car folder ID to every spec it races in, inverted from SPEC_CARS.
 */
const SPECS_BY_CAR = ((): ReadonlyMap<string, readonly CarSpec[]> => {
  const index = new Map<string, CarSpec[]>();

  for (const [spec, cars] of Object.entries(SPEC_CARS) as [CarSpec, readonly string[]][]) {
    for (const car of cars) index.set(car, [...(index.get(car) ?? []), spec]);
  }

  return index;
})();

/**
 * Nothing to hand back for a car the catalogue does not name, shared so the
 * empty case never allocates.
 */
const NONE: readonly never[] = [];

/**
 * Finds every grid a car races on.
 *
 * More than one is normal: a Lotus 2-Eleven runs in Lotus Cup and again as a
 * track special. Empty for a mod the catalogue does not name, and for a car that
 * exists only for one-make racing - those a championship names directly.
 * @param carId Folder name under content/cars
 * @returns Its specs, in catalogue order
 */
export const carSpecsOf = (carId: string): readonly CarSpec[] => SPECS_BY_CAR.get(carId) ?? NONE;

/**
 * Finds every class a car belongs to, through the specs it holds.
 *
 * Deduplicated, though in practice a car never holds two specs of one class -
 * that would claim it is two eras of the same category at once.
 * @param carId Folder name under content/cars
 * @returns Its classes, in catalogue order
 */
export const carClassesOf = (carId: string): readonly CarClass[] => {
  const specs = carSpecsOf(carId);
  if (specs.length === 0) return NONE;

  return [...new Set(specs.map((spec) => SPECS[spec].class))];
};

/**
 * Reads a spec's display name.
 * @param spec The spec to name
 * @returns Its display text, as shipped
 */
export const carSpecName = (spec: CarSpec): string => SPECS[spec].name;

/**
 * Reads a class's display name.
 * @param carClass The class to name
 * @returns Its display text, as shipped
 */
export const carClassName = (carClass: CarClass): string => CLASS_NAMES[carClass];

/**
 * Reads which class a spec belongs to.
 * @param spec The spec to place
 * @returns The class it is part of
 */
export const classOfSpec = (spec: CarSpec): CarClass => SPECS[spec].class;
