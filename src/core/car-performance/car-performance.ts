// Turning ui_car.json's specs block into numbers we can price and classify from.
//
// Deliberately independent of src/core/content, and takes the raw value straight
// off the parsed JSON: mods ship "specs" as a string or an array often enough
// that a typed parameter would be a lie.

import {
  KG_PER_TONNE, MAX_BHP, MAX_RPM, MAX_TORQUE_NM, MAX_YEAR, MIN_CURVE_POINTS, MIN_YEAR,
} from './constants.ts';
import type { UiCarSpecs } from './types.ts';
import {
  parsePower,
  parseSeconds,
  parseSpeed,
  parseTorque,
  parseWeight,
} from './utils.ts';
import type { CarCurves, CarPerformance, CurvePoint } from '../../shared/types/index.ts';
import { inRange, parseLooseNumber, specString } from '../loose-number/index.ts';

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

/**
 * Reads one figure of a curve point, keeping its sign.
 *
 * parseLooseNumber reads past a minus sign, which suits free text - "-" is not
 * a figure - but would turn a negative point, exactly what a curve has to drop,
 * into a plausible one.
 * @param raw The figure, written as a string or a number
 * @returns The number, or null when it does not read
 */
const signedNumber = (raw: unknown): number | null => {
  const value = parseLooseNumber(raw);

  return value !== null && String(raw).trim().startsWith('-') ? -value : value;
};

/**
 * Reads one ui_car.json curve: a list of [rpm, value] pairs, each written as a
 * string or a number.
 *
 * A pair that does not read, or reads as something no engine produces, is
 * dropped rather than spoiling the rest; the points come back in rpm order with
 * one per engine speed, since mods ship them unsorted and repeated often enough.
 * @param raw The curve straight off the parsed JSON
 * @param max The highest plausible value
 * @returns The curve, empty when fewer than two points survive
 */
const parseCurve = (raw: unknown, max: number): CurvePoint[] => {
  if (!Array.isArray(raw)) return [];

  const byRpm = new Map<number, number>();
  raw.forEach((pair: unknown) => {
    if (!Array.isArray(pair) || pair.length < 2) return;
    const rpm = inRange(signedNumber(pair[0]), 0, MAX_RPM);
    const value = inRange(signedNumber(pair[1]), 0, max);
    if (rpm !== null && value !== null && !byRpm.has(rpm)) byRpm.set(rpm, value);
  });

  const points = [...byRpm].sort((a, b) => a[0] - b[0]);

  return points.length >= MIN_CURVE_POINTS ? points : [];
};

/**
 * Reads ui_car.json's power and torque curves.
 * @param power The powerCurve value, in bhp
 * @param torque The torqueCurve value, in Nm
 * @returns Both curves, or null when neither holds a readable curve
 */
export const parseCarCurves = (power: unknown, torque: unknown): CarCurves | null => {
  const curves = { power: parseCurve(power, MAX_BHP), torque: parseCurve(torque, MAX_TORQUE_NM) };

  return curves.power.length === 0 && curves.torque.length === 0 ? null : curves;
};
