// Turning ui_car.json's specs block into numbers we can price and classify from.
//
// Deliberately independent of src/core/content, and takes the raw value straight
// off the parsed JSON: mods ship "specs" as a string or an array often enough
// that a typed parameter would be a lie.

import { KG_PER_TONNE, MAX_YEAR, MIN_YEAR } from './constants.ts';
import type { UiCarSpecs } from './types.ts';
import {
  parsePower,
  parseSeconds,
  parseSpeed,
  parseTorque,
  parseWeight,
} from './utils.ts';
import type { CarPerformance } from '../../shared/types/index.ts';
import { parseLooseNumber, specString } from '../loose-number/index.ts';

export type { UiCarSpecs } from './types.ts';

/**
 * The figures for a car whose ui_car.json told us nothing.
 * @returns A CarPerformance with every figure null
 */
const emptyPerformance = (): CarPerformance => ({
  bhp: null,
  torqueNm: null,
  weightKg: null,
  topSpeedKph: null,
  accelerationSeconds: null,
  powerToWeight: null,
  raw: {
    bhp: null, torque: null, weight: null, topspeed: null, acceleration: null, pwratio: null,
  },
});

/**
 * Parses a car's performance figures out of its ui_car.json specs block.
 * @param raw The specs value straight off the parsed JSON, whatever it turned out to be
 * @returns The parsed figures, every one of which may be null
 */
export const parseCarPerformance = (raw: unknown): CarPerformance => {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return emptyPerformance();

  const specs = raw as UiCarSpecs;
  const bhp = parsePower(specs.bhp);
  const weightKg = parseWeight(specs.weight);

  return {
    bhp,
    torqueNm: parseTorque(specs.torque),
    weightKg,
    topSpeedKph: parseSpeed(specs.topspeed),
    accelerationSeconds: parseSeconds(specs.acceleration),
    // Derived rather than read from the author's pwratio, which mods leave stale
    // after retuning a car and disagree about the direction of.
    powerToWeight: bhp === null || weightKg === null ? null : bhp / (weightKg / KG_PER_TONNE),
    raw: {
      bhp: specString(specs.bhp),
      torque: specString(specs.torque),
      weight: specString(specs.weight),
      topspeed: specString(specs.topspeed),
      acceleration: specString(specs.acceleration),
      pwratio: specString(specs.pwratio),
    },
  };
};

/**
 * Parses a car's model year.
 * @param raw The year value straight off the parsed JSON, number or string
 * @returns The year, or null when it is absent or implausible
 */
export const parseYear = (raw: unknown): number | null => {
  const year = parseLooseNumber(raw);
  if (year === null || !Number.isInteger(year)) return null;

  return year >= MIN_YEAR && year <= MAX_YEAR ? year : null;
};
