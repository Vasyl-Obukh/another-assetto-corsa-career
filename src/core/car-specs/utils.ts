// Reading numbers out of the free text mod authors write. Every helper returns
// null rather than a guess: these figures feed pricing and class inference, so a
// number we are not sure of is worse than no number at all.

import {
  BHP_PER_KW,
  KG_PER_LB,
  KPH_PER_MPH,
  MAX_ACCELERATION_S,
  MAX_BHP,
  MAX_SPEED_KPH,
  MAX_TORQUE_NM,
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  NM_PER_LBFT,
  NOTHING_TOKENS,
} from './constants.ts';

/**
 * The first run of digits and separators in a string.
 */
const NUMERIC_RUN = /\d[\d.,]*/;

/**
 * A number immediately before a seconds unit, in either word order.
 */
const SECONDS_RUN = /(\d[\d.,]*)\s*(?:s\b|sec)/i;

/**
 * Reads a spec string as a raw string, or null when the author left it blank.
 * @param value The value straight off the parsed JSON
 * @returns The trimmed string, or null when there is nothing there
 */
export const specString = (value: unknown): string | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return NOTHING_TOKENS.has(trimmed.toLowerCase()) ? null : trimmed;
};

/**
 * Turns one numeric token into a number, working out which separators group
 * thousands and which is the decimal point.
 *
 * Mod authors write 1,200 and 1.200 for the same weight and 6,46 for the same
 * ratio as 6.46, so neither separator can be assumed. The rule: if the last
 * group is exactly three digits it is a thousands group, unless the whole token
 * is a lone zero followed by three digits.
 * @param token Digits and separators only
 * @returns The number it denotes, or null when it denotes nothing
 */
const readNumericToken = (token: string): number | null => {
  const parts = token.split(/[.,]/);
  const [first] = parts;
  const last = parts[parts.length - 1];

  let text: string;
  if (parts.length === 1) {
    text = first;
  } else if (last.length === 3 && !(parts.length === 2 && first === '0')) {
    text = parts.join('');
  } else {
    text = `${parts.slice(0, -1).join('')}.${last}`;
  }

  const value = parseFloat(text);
  return Number.isFinite(value) ? value : null;
};

/**
 * Reads the first number out of whatever the author wrote.
 *
 * "560bhp", "~412 kW", "1,200 kg" and "300+ km/h" all give up a number; "N/A"
 * and "-" do not.
 * @param value The value straight off the parsed JSON
 * @returns The number, or null when there is none
 */
export const parseLooseNumber = (value: unknown): number | null => {
  const text = specString(value);
  if (text === null) return null;

  const match = NUMERIC_RUN.exec(text);
  return match ? readNumericToken(match[0]) : null;
};

/**
 * Rejects a number outside the range a real car could have.
 * @param value The parsed number, or null
 * @param min Lowest plausible value, inclusive
 * @param max Highest plausible value, inclusive
 * @returns The value when it is plausible, null otherwise
 */
const inRange = (value: number | null, min: number, max: number): number | null => (
  value !== null && value >= min && value <= max ? value : null
);

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
  const nm = /lb\s*[-.]?\s*ft|ft\s*[-.]?\s*lb/i.test(text) ? number * NM_PER_LBFT : number;

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
  const kg = /lbs?(?![a-z])/i.test(text) ? number * KG_PER_LB : number;

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
  const kph = /mph/i.test(text) ? number * KPH_PER_MPH : number;

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
