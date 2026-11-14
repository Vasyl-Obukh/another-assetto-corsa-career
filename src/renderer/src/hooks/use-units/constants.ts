import type { Quantity } from '../../../../shared/utils/units';

/**
 * How many decimal places each quantity is shown to: a lap or a race distance
 * to a tenth, everything else whole.
 */
export const DIGITS: Record<Quantity, number> = {
  speed: 0,
  distance: 1,
  length: 0,
  weight: 0,
  torque: 0,
  temperature: 0,
};
