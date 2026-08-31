// Reading numbers out of the free text mod authors write into ui_car.json and
// ui_track.json.
//
// Lives here rather than in either reader because both need it: a car's weight
// and a circuit's length are the same parsing problem. Every helper returns null
// rather than a guess - these figures feed pricing and classification, so a
// number we are not sure of is worse than no number at all.

import { NOTHING_TOKENS, NUMERIC_RUN, THOUSANDS_GROUP } from './constants.ts';

/**
 * Reads a free-text field as a raw string, or null when the author left it blank.
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
export const readNumericToken = (token: string): number | null => {
  const parts = token.split(/[.,]/);
  const [first] = parts;
  const last = parts[parts.length - 1];

  let text: string;
  if (parts.length === 1) {
    text = first;
  } else if (last.length === THOUSANDS_GROUP && !(parts.length === 2 && first === '0')) {
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
 * Rejects a number outside the range the real thing could have.
 * @param value The parsed number, or null
 * @param min Lowest plausible value, inclusive
 * @param max Highest plausible value, inclusive
 * @returns The value when it is plausible, null otherwise
 */
export const inRange = (value: number | null, min: number, max: number): number | null => (
  value !== null && value >= min && value <= max ? value : null
);

/**
 * Reads the first number, treating every separator as a decimal point.
 *
 * The counterpart to parseLooseNumber, for when something else has already
 * settled the magnitude - usually a unit beside the figure. "13.626km" is
 * thirteen kilometres and a bit; the thousands rule would read thirteen
 * thousand. Without a unit there is nothing to rule that out, which is why this
 * is a separate function rather than the default.
 * @param value The value straight off the parsed JSON
 * @returns The number, or null when there is none
 */
export const parseDecimalNumber = (value: unknown): number | null => {
  const text = specString(value);
  if (text === null) return null;

  const match = NUMERIC_RUN.exec(text);
  if (match === null) return null;

  const parts = match[0].split(/[.,]/);
  const number = parseFloat(parts.length === 1
    ? parts[0]
    : `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`);

  return Number.isFinite(number) ? number : null;
};
