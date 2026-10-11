// Lowering a weather plan into PURE Planner's JSON.
//
// The shape is taken verbatim from a real Plans/last_used.json rather than from
// documentation: two top-level keys, a container of steps each wrapped in a
// `data` object, and a control block. Key order is not stable in the files PURE
// itself writes - it serialises a Lua table - so nothing here depends on it.

import {
  DEFAULT_PLAN_START_HOUR,
  PURE_CM_INDEX,
  PURE_PLAN_EPOCH,
  PURE_PLAN_TYPE,
  PURE_WEATHER_DEFAULTS,
} from './constants.ts';
import { stepSeconds } from './utils.ts';
import { MINUTES_PER_HOUR, SECONDS_PER_MINUTE } from '../../shared/constants/index.ts';
import type { WeatherPlan, WeatherStep } from '../../shared/types/index.ts';

/**
 * PURE's index for what a step asks for.
 *
 * The identity for every CSP weather type, because PURE's ids and
 * `ac.WeatherType` are the same numbering for all 33 of them - checked against
 * its own Default_WeatherPresets.json. Only the CM slot needs saying.
 * @param step The step to read
 * @returns The index to write
 */
export const pureWeatherIndex = (step: WeatherStep): number => (
  step.weather === 'race' ? PURE_CM_INDEX : step.weather
);

/**
 * The weather object for one step, with every key PURE writes.
 * @param step The step to render
 * @returns The weather object
 */
export const pureWeather = (step: WeatherStep): Record<string, number | boolean> => {
  const out: Record<string, number | boolean> = {
    ...PURE_WEATHER_DEFAULTS,
    index: pureWeatherIndex(step),
  };

  if (step.rain !== undefined) {
    out.rain_amount = step.rain;
    // Wetness and standing water follow the rain rather than being asked for
    // separately, which is what the career weather presets already assume.
    out.rain_wetness = step.rain;
    out.rain_water = step.rain;
  }
  if (step.ambient !== undefined) out.temp_air = step.ambient;
  if (step.road !== undefined) out.temp_road = step.road;
  if (step.wind !== undefined) out.wind_strength = step.wind;
  if (step.windDirection !== undefined) out.wind_direction = step.windDirection;
  if (step.humidity !== undefined) out.humidity = step.humidity;
  if (step.fog !== undefined) out.mist = step.fog;

  return out;
};

/**
 * Renders a plan as the JSON PURE Planner reads.
 * @param plan The plan to render
 * @returns The file contents
 */
export const purePlanJson = (plan: WeatherPlan): string => {
  const startHour = plan.startHour ?? DEFAULT_PLAN_START_HOUR;
  const multiplier = plan.timeMultiplier ?? 1;
  let timestamp = PURE_PLAN_EPOCH + startHour * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

  // A duration is session seconds and a timestamp is the game's clock: a timed
  // plan stretches every step by its multiplier (CONTAINER_adapted_duration in
  // PurePlanner/plan/plan.lua), and chains the steps after the first that way.
  const container = plan.steps.map((step) => {
    const duration = stepSeconds(step);
    const data = { timestamp, duration, weather: pureWeather(step) };
    timestamp += duration * multiplier;

    return { data };
  });

  return `${JSON.stringify({
    container,
    control: {
      type: PURE_PLAN_TYPE,
      timemulti: multiplier,
      loop: plan.loop ?? false,
    },
  }, null, 1)}\n`;
};
