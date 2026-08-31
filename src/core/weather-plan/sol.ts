// Lowering a weather plan into Sol Planner's slot-indexed INI.
//
// Two things bite, both read out of sol_planner.py rather than guessed:
// `N-weather` is a row index into the app's own weather_params table, not the id
// that table carries (they agree up to 32 and diverge above it); and the file is
// read by Python's ConfigParser with `optionxform = str`, so keys are
// case-sensitive and booleans are written `True` and `False`.

import {
  SHARED_WEATHER_MAX,
  SOL_AUTO,
  SOL_CM_ROW,
  SOL_EMPTY_ROW,
  SOL_SLOT_COUNT,
  SOL_STAMP_HOUR,
  SOL_STAMP_MINUTE,
  SOL_STEP_DEFAULTS,
  SOL_TIME_MODE_TIMESPAN,
} from './constants.ts';
import { stepSeconds } from './utils.ts';
import { SECONDS_PER_MINUTE } from '../../shared/constants/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { WeatherPlan, WeatherStep } from '../../shared/types/index.ts';
import type { IniValue } from '../ini/index.ts';

/**
 * Sol's row for what a step asks for.
 *
 * Every CSP weather type up to Hail sits at the row matching its own number, so
 * the mapping is the identity there; the CM slot is the one exception we write.
 * Anything above the shared range is a value Sol numbers differently and that we
 * have no reason to ask for, so it is refused rather than silently mis-mapped
 * into a random-weather row.
 * @param step The step to read
 * @returns The row index to write
 * @throws When the weather has no row we can name
 */
export const solWeatherRow = (step: WeatherStep): number => {
  if (step.weather === 'race') return SOL_CM_ROW;

  // Compared as a plain number: the shared range is a fact about another app's
  // table, not a member of our own enum.
  const value: number = step.weather;
  if (value <= SHARED_WEATHER_MAX) return value;

  throw new AppError('weatherPlan.weather.unmappable', { weather: step.weather });
};

/**
 * The keys one filled slot contributes.
 * @param step The step to render
 * @param slot Which slot it occupies
 * @returns The slot's keys
 */
export const solSlot = (step: WeatherStep, slot: number): Record<string, IniValue> => ({
  [`${slot}-weather`]: solWeatherRow(step),
  [`${slot}-rain`]: (step.rain ?? SOL_STEP_DEFAULTS.rain).toFixed(2),
  [`${slot}-rainprobability`]: (step.rain !== undefined && step.rain > 0 ? 1 : 0).toFixed(2),
  [`${slot}-rainvariance`]: (0).toFixed(2),
  [`${slot}-wetness`]: SOL_AUTO.toFixed(2),
  [`${slot}-wetfine`]: (0).toFixed(2),
  [`${slot}-puddles`]: SOL_AUTO.toFixed(2),
  [`${slot}-humidity`]: (step.humidity ?? SOL_STEP_DEFAULTS.humidity).toFixed(2),
  [`${slot}-fog`]: (step.fog ?? SOL_STEP_DEFAULTS.fog).toFixed(2),
  [`${slot}-tempambient`]: Math.round(step.ambient ?? SOL_STEP_DEFAULTS.ambient),
  [`${slot}-temproad`]: Math.round(step.road ?? SOL_STEP_DEFAULTS.road),
  [`${slot}-wind`]: Math.round(step.wind ?? SOL_STEP_DEFAULTS.wind),
  [`${slot}-winddirection`]: Math.round(step.windDirection ?? SOL_STEP_DEFAULTS.windDirection),
  [`${slot}-playseconds`]: stepSeconds(step),
  [`${slot}-stamphour`]: SOL_STAMP_HOUR,
  [`${slot}-stampminute`]: SOL_STAMP_MINUTE,
});

/**
 * Renders a plan as the keys of one Sol preset section.
 *
 * Always nine slots, which is what the app holds whether or not they are used;
 * the ones past the plan carry a length and an empty weather, exactly as Sol
 * writes them itself.
 * @param plan The plan to render
 * @returns The section's keys, in slot order
 * @throws When a step asks for a weather Sol numbers differently
 */
export const solPlanSection = (plan: WeatherPlan): Record<string, IniValue> => {
  const out: Record<string, IniValue> = {};

  for (let slot = 0; slot < SOL_SLOT_COUNT; slot += 1) {
    const step = plan.steps[slot];
    if (step) Object.assign(out, solSlot(step, slot));
    else {
      out[`${slot}-weather`] = SOL_EMPTY_ROW;
      out[`${slot}-playseconds`] = SECONDS_PER_MINUTE;
      out[`${slot}-stamphour`] = SOL_STAMP_HOUR;
      out[`${slot}-stampminute`] = SOL_STAMP_MINUTE;
    }
  }

  out.timemode = SOL_TIME_MODE_TIMESPAN;
  out.timemultiplier = String(plan.timeMultiplier ?? 1);
  // Python booleans: their parser wants these exact words, and formatValue
  // would write 1 and 0.
  out.repeat = plan.loop ? 'True' : 'False';
  out.playing = 'True';

  return out;
};
