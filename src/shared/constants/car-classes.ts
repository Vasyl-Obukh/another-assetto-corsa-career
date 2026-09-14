// The user's layer over the class catalogue, in the shared layer because main
// reads and writes it and the renderer resolves the same catalogue from it.

import type { ClassLayer } from '../types/index.ts';

/**
 * Format version of car-classes.json. Stays 1 until the app is released.
 */
export const CLASS_LAYER_VERSION = 1;

/**
 * A layer that adds nothing, which resolves to the catalogue exactly as shipped.
 */
export const EMPTY_CLASS_LAYER: Readonly<ClassLayer> = Object.freeze({
  version: CLASS_LAYER_VERSION,
  classes: [],
  specs: [],
  cars: {},
});
