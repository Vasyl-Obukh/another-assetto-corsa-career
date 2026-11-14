import type { Quantity, Unit } from './types.ts';
import { M_PER_KM, M_PER_MILE } from '../../constants/index.ts';
import type { UnitSystem } from '../../types/index.ts';

/**
 * Metres in a foot, exactly.
 */
export const M_PER_FOOT = 0.3048;

/**
 * Kilograms in a pound, exactly.
 */
export const KG_PER_POUND = 0.45359237;

/**
 * Standard gravity in m/s2, which turns a pound of mass into a pound of force.
 */
export const STANDARD_GRAVITY = 9.80665;

/**
 * The unit each system writes each quantity in. The UK mix is why there are
 * three rather than two: mph and miles, but kilograms and Celsius.
 */
export const UNIT_OF: Record<UnitSystem, Record<Quantity, Unit>> = {
  metric: {
    speed: 'kph', distance: 'km', length: 'm', weight: 'kg', torque: 'nm', temperature: 'c',
  },
  uk: {
    speed: 'mph', distance: 'mi', length: 'm', weight: 'kg', torque: 'lbft', temperature: 'c',
  },
  us: {
    speed: 'mph', distance: 'mi', length: 'ft', weight: 'lb', torque: 'lbft', temperature: 'f',
  },
};

/**
 * How many of each unit one of its quantity's metric unit makes - everything
 * but the two temperatures, which are offset as well as scaled.
 */
export const PER_METRIC: Record<Exclude<Unit, 'c' | 'f'>, number> = {
  kph: 1,
  mph: M_PER_KM / M_PER_MILE,
  km: 1,
  mi: M_PER_KM / M_PER_MILE,
  m: 1,
  ft: 1 / M_PER_FOOT,
  kg: 1,
  lb: 1 / KG_PER_POUND,
  nm: 1,
  // A pound-foot is a pound's weight on a foot-long lever.
  lbft: 1 / (KG_PER_POUND * STANDARD_GRAVITY * M_PER_FOOT),
};

/**
 * Degrees Fahrenheit per degree Celsius.
 */
export const FAHRENHEIT_PER_CELSIUS = 9 / 5;

/**
 * Where the Fahrenheit scale stands at nought Celsius.
 */
export const FAHRENHEIT_AT_ZERO = 32;

/**
 * The regions whose people read something other than metric, by ISO 3166 code.
 * Everywhere else reads metric.
 */
export const REGION_UNITS: Readonly<Record<string, UnitSystem>> = {
  US: 'us',
  // US territories, which drive in miles and read Fahrenheit.
  PR: 'us',
  GU: 'us',
  VI: 'us',
  AS: 'us',
  MP: 'us',
  GB: 'uk',
};
