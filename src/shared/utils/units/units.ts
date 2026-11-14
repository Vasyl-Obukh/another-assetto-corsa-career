// Unit systems: which unit a quantity is shown in, and converting to it and back.
// Everything stays metric on disk - Assetto Corsa's own units - so only what is
// shown and typed is ever converted.

import {
  FAHRENHEIT_AT_ZERO, FAHRENHEIT_PER_CELSIUS, PER_METRIC, REGION_UNITS, UNIT_OF,
} from './constants.ts';
import type { Quantity, Unit } from './types.ts';
import type { UnitSystem } from '../../types/index.ts';

/**
 * The unit a system shows a quantity in.
 * @param quantity What is measured
 * @param system The unit system
 * @returns Its unit
 */
export const unitOf = (quantity: Quantity, system: UnitSystem): Unit => UNIT_OF[system][quantity];

/**
 * A metric figure in the unit a system shows it in.
 * @param quantity What is measured
 * @param metric The figure in its metric unit
 * @param system The unit system
 * @returns The figure in the system's unit, unrounded
 */
export const toShown = (quantity: Quantity, metric: number, system: UnitSystem): number => {
  const unit = unitOf(quantity, system);
  if (unit === 'c') return metric;
  if (unit === 'f') return metric * FAHRENHEIT_PER_CELSIUS + FAHRENHEIT_AT_ZERO;

  return metric * PER_METRIC[unit];
};

/**
 * A figure typed in a system's unit, back in its metric unit.
 * @param quantity What is measured
 * @param shown The figure in the system's unit
 * @param system The unit system
 * @returns The figure in its metric unit, unrounded
 */
export const toMetric = (quantity: Quantity, shown: number, system: UnitSystem): number => {
  const unit = unitOf(quantity, system);
  if (unit === 'c') return shown;
  if (unit === 'f') return (shown - FAHRENHEIT_AT_ZERO) / FAHRENHEIT_PER_CELSIUS;

  return shown / PER_METRIC[unit];
};

/**
 * Whether a system reads speeds in miles an hour.
 * @param system The unit system
 * @returns True for mph
 */
export const usesMph = (system: UnitSystem): boolean => unitOf('speed', system) === 'mph';

/**
 * The unit system a region reads: metric wherever it is not one that reads
 * otherwise, or cannot be told.
 * @param region An ISO 3166 region code, or null when none is known
 * @returns The unit system
 */
export const unitsOfRegion = (region: string | null): UnitSystem => (
  (region === null ? undefined : REGION_UNITS[region.toUpperCase()]) ?? 'metric'
);

/**
 * The region a locale names, such as US for en-US.
 * @param locale A BCP 47 locale
 * @returns Its region code, or null when it names none or does not parse
 */
export const regionOfLocale = (locale: string): string | null => {
  try {
    return new Intl.Locale(locale).region ?? null;
  } catch {
    return null;
  }
};
