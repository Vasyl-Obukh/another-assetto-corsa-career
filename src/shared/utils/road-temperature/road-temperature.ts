import {
  DEFAULT_TEMPERATURE_COEFF, ROAD_TEMP_DAWN_HOUR, ROAD_TEMP_FADE_FROM, ROAD_TEMP_FADE_TO, ROAD_TEMP_PHASE_MAX,
} from './constants.ts';
import { HOURS_PER_DAY, MINUTES_PER_HOUR } from '../../constants/index.ts';
import { AppError } from '../../errors/index.ts';

/**
 * Holds a value between two bounds.
 * @param value The value to bound
 * @param min Lowest value to return
 * @param max Highest value to return
 * @returns The value, or whichever bound it passed
 */
const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/**
 * Reads a time of day into decimal hours.
 * @param time Either "HH:MM" or hours as a number
 * @returns Hours, with minutes as a fraction
 * @throws When the string is not in "HH:MM" form
 */
export const parseClock = (time: string | number): number => {
  if (typeof time === 'number') return time;

  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match?.[1] || !match[2]) {
    throw new AppError('race.timeOfDay.invalid', { time });
  }

  return parseInt(match[1], 10) + parseInt(match[2], 10) / MINUTES_PER_HOUR;
};

/**
 * Writes minutes after midnight as a clock, wrapping at midnight.
 * @param minutes Minutes after midnight
 * @returns The time, as HH:MM
 */
export const clockOf = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR) % HOURS_PER_DAY;

  return `${String(hours).padStart(2, '0')}:${String(minutes % MINUTES_PER_HOUR).padStart(2, '0')}`;
};

/**
 * Places the time of day on Kunos' road temperature curve.
 *
 * The curve is theirs, stated in `content/weather/readme_weather.txt` and
 * implemented as `calctemp` in the stock launcher's
 * `launcher/themes/default/js/ui.js`. This is CSP's restatement of it, from
 * `extension/internal/lua-shared/sim/weather.lua`, which is the same curve
 * algebraically and adds the two guards Kunos never needed:
 *
 *     ambient * (1 + 5.33332 * coeff * (1 - t)
 *                    * (exp(-6t) * sin(6t) + 0.25) * sin(0.9t))
 *
 * Inside 07:00 to 18:00 the two agree to the last decimal, checked hour by
 * hour. Outside it Kunos' runs away - 214C at midnight - because their launcher
 * only ever exposed an 08:00 to 18:00 slider and ours exposes the whole clock.
 * So the phase is capped and faded back to ambient across the evening.
 *
 * That fade has a quirk worth knowing before it is read as our bug: winding
 * the phase back down walks back over the curve's own afternoon peak, so the
 * road is about 1.5C warmer at 20:00 than at 18:00 before reaching ambient at
 * midnight. It is CSP's, and it is bounded.
 * @param hour Time of day in decimal hours
 * @param ambient Air temperature in degrees Celsius
 * @param coeff The weather preset's temperature coefficient
 * @returns Road temperature in degrees Celsius, unrounded
 */
export const roadTempCurve = (hour: number, ambient: number, coeff: number): number => {
  const phase = clamp((hour - ROAD_TEMP_DAWN_HOUR) / HOURS_PER_DAY, 0, ROAD_TEMP_PHASE_MAX);
  const fade = clamp(
    (ROAD_TEMP_FADE_TO - hour) / (ROAD_TEMP_FADE_TO - ROAD_TEMP_FADE_FROM),
    0,
    1,
  );
  const t = phase * fade;

  return ambient * (1 + 5.33332 * coeff * (1 - t)
    * (Math.exp(-6 * t) * Math.sin(6 * t) + 0.25) * Math.sin(0.9 * t));
};

/**
 * The road temperature a session gets when nothing sets it: the curve at that
 * time of day, rounded the way race.ini writes it.
 * @param time The time of day, as "HH:MM" or decimal hours
 * @param ambient Air temperature in degrees Celsius
 * @param coeff The weather preset's temperature coefficient, when there is one
 * @returns Road temperature in whole degrees Celsius
 */
export const followedRoad = (time: string | number, ambient: number, coeff?: number | null): number => (
  // `||` rather than `??` on purpose: it reproduces Kunos' own
  // `if (!COEFF) COEFF = 1`, so a preset declaring zero and a race naming no
  // preset at all both warm the road rather than leaving it at ambient.
  Math.round(roadTempCurve(parseClock(time), ambient, coeff || DEFAULT_TEMPERATURE_COEFF))
);
