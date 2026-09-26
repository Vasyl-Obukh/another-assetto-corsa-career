/**
 * Hour Kunos' road temperature curve measures from - sunrise, in effect.
 */
export const ROAD_TEMP_DAWN_HOUR = 7;

/**
 * How far into the curve's own day the phase term is allowed to run.
 *
 * Kunos' launcher only ever offered an 08:00 to 18:00 slider, so the formula is
 * simply undefined outside it and runs away: raw, it puts the road at 214C at
 * midnight. Capping the phase is what keeps a night race honest, and it costs
 * nothing where Kunos is defined.
 */
export const ROAD_TEMP_PHASE_MAX = 0.5;

/**
 * Hour at which the road starts giving its heat back to the ambient.
 */
export const ROAD_TEMP_FADE_FROM = 18;

/**
 * Hour by which the road has finished giving it back.
 */
export const ROAD_TEMP_FADE_TO = 24;

/**
 * Temperature coefficient used when the weather names none, or names zero.
 *
 * Kunos' own `if (!COEFF) COEFF = 1` guard, which treats a missing coefficient
 * and a zero one alike. Named rather than inlined because it is a surprise: it
 * means a race with no weather preset gets a road warmer than ambient, not one
 * equal to it.
 */
export const DEFAULT_TEMPERATURE_COEFF = 1;
