// Turning the numbers in ui_car.json's specs block into figures with units.
//
// The reading itself - separators, approximations, "N/A" - is
// src/core/loose-number, which ui_track.json needs just as much. What is
// car-specific stays here: which units an author might have written, and what
// range makes the figure a lie.

import {
  BHP_PER_KW,
  MAX_ACCELERATION_S,
  MAX_BHP,
  MAX_SPEED_KPH,
  MAX_TORQUE_NM,
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
} from './constants.ts';
import { toMetric } from '../../shared/utils/units/index.ts';
import {
  inRange, parseLooseNumber, readNumericToken, specString,
} from '../loose-number/index.ts';

/**
 * A number immediately before a seconds unit, in either word order.
 */
const SECONDS_RUN = /(\d[\d.,]*)\s*(?:s\b|sec)/i;

/**
 * Reads a power figure, converting kilowatts to brake horsepower.
 *
 * hp, ps, cv and bare numbers are all taken as bhp - the difference between them
 * is smaller than the error in a mod author's own figure.
 * @param value The raw specs.bhp value
 * @returns Power in bhp, or null when it could not be read
 */
export const parsePower = (value: unknown): number | null => {
  const number = parseLooseNumber(value);
  if (number === null) return null;

  const text = specString(value) ?? '';
  const bhp = /kw(?![a-z])/i.test(text) ? number * BHP_PER_KW : number;

  return inRange(bhp, Number.MIN_VALUE, MAX_BHP);
};

/**
 * Reads a torque figure, converting pound-feet to newton metres.
 * @param value The raw specs.torque value
 * @returns Torque in Nm, or null when it could not be read
 */
export const parseTorque = (value: unknown): number | null => {
  const number = parseLooseNumber(value);
  if (number === null) return null;

  const text = specString(value) ?? '';
  const nm = /lb\s*[-.]?\s*ft|ft\s*[-.]?\s*lb/i.test(text) ? toMetric('torque', number, 'us') : number;

  return inRange(nm, Number.MIN_VALUE, MAX_TORQUE_NM);
};

/**
 * Reads a weight figure, converting pounds to kilograms.
 * @param value The raw specs.weight value
 * @returns Weight in kg, or null when it could not be read
 */
export const parseWeight = (value: unknown): number | null => {
  const number = parseLooseNumber(value);
  if (number === null) return null;

  const text = specString(value) ?? '';
  const kg = /lbs?(?![a-z])/i.test(text) ? toMetric('weight', number, 'us') : number;

  return inRange(kg, MIN_WEIGHT_KG, MAX_WEIGHT_KG);
};

/**
 * Reads a top speed, converting miles per hour to kilometres per hour.
 * @param value The raw specs.topspeed value
 * @returns Top speed in km/h, or null when it could not be read
 */
export const parseSpeed = (value: unknown): number | null => {
  const number = parseLooseNumber(value);
  if (number === null) return null;

  const text = specString(value) ?? '';
  const kph = /mph/i.test(text) ? toMetric('speed', number, 'us') : number;

  return inRange(kph, Number.MIN_VALUE, MAX_SPEED_KPH);
};

/**
 * Reads a nought-to-hundred time.
 *
 * Anchored on the unit rather than taking the first number, because authors
 * write both "7.4s 0-100" and "0-100 in 7.4s" - and the first number of the
 * second is 0, which would be a catastrophic figure to price a car from.
 * @param value The raw specs.acceleration value
 * @returns Seconds, or null when it could not be read
 */
export const parseSeconds = (value: unknown): number | null => {
  const text = specString(value);
  if (text === null) return null;

  const anchored = SECONDS_RUN.exec(text);
  const number = anchored?.[1] === undefined
    ? parseLooseNumber(text)
    : readNumericToken(anchored[1]);

  return inRange(number, Number.MIN_VALUE, MAX_ACCELERATION_S);
};
