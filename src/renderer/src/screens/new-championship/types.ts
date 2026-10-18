import type { STEPS } from './constants.ts';
import type { Car, Skin } from '../../../../shared/types';

/**
 * One step of New championship.
 */
export type Step = (typeof STEPS)[number];

/**
 * The seat New championship has been given so far.
 */
export interface SeatChoice {
  /**
   * The class, by its class entry id.
   */
  entry: string;
  /**
   * The car, or null until one is picked.
   */
  car: Car | null;
  /**
   * The livery, or null for the car's own choice.
   */
  skin: Skin | null;
}
