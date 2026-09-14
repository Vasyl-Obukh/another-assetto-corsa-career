// Shared fixtures for the class layer tests. The shipped catalogue is meant to
// be corrected as the library grows, so nothing here names a car or a spec - it
// reads one out of the data that has the shape a test needs.

import { EMPTY_CLASS_LAYER } from '../../../constants/index.ts';
import type { ClassId, ClassLayer, SpecId } from '../../../types/index.ts';
import { SHIPPED_CATALOGUE } from '../../car-classes/index.ts';

/**
 * A class the user made, for a test to put specs in.
 */
export const USER_CLASS = { id: 'user-class', name: 'Hillclimb' };

/**
 * A spec the user made, in USER_CLASS.
 */
export const USER_SPEC = { id: 'user-spec', name: 'Hillclimb (2020s)', class: USER_CLASS.id };

/**
 * A layer holding only what a test gives it.
 * @param overrides What the layer holds
 * @returns A complete layer
 */
export const makeLayer = (overrides: Partial<ClassLayer> = {}): ClassLayer => ({
  ...structuredClone(EMPTY_CLASS_LAYER),
  ...overrides,
});

/**
 * A car the app ships a classification for.
 * @returns Its folder ID and the specs it ships in
 */
export const shippedCar = (): { car: string; specs: readonly SpecId[] } => {
  const [first] = SHIPPED_CATALOGUE.specsByCar;
  if (!first) throw new Error('the catalogue classifies no cars at all');

  return { car: first[0], specs: first[1] };
};

/**
 * A shipped class holding at least two specs, for a clash to be made in.
 * @returns The class and two of its specs
 */
export const crowdedClass = (): { carClass: ClassId; specs: [SpecId, SpecId] } => {
  const found = SHIPPED_CATALOGUE.classes.find((one) => one.specs.length >= 2);
  if (!found) throw new Error('the catalogue has no class with two specs');

  return { carClass: found.id, specs: [found.specs[0], found.specs[1]] };
};
