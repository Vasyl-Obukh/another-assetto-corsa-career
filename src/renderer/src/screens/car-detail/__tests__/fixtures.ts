// Shared fixtures for the car detail tests. Only the fields the screen actually
// reads are interesting; everything else defaults out of the way.

import type { Skin } from '../../../../../shared/types';

/**
 * Builds a livery, defaulting the metadata the test in hand does not care about.
 * @param id The livery folder name
 * @param skin Anything else this livery needs
 * @returns A complete Skin
 */
export const makeSkin = (id: string, skin: Partial<Skin> = {}): Skin => ({
  id,
  name: id,
  driver: null,
  team: null,
  number: null,
  country: null,
  ...skin,
});
