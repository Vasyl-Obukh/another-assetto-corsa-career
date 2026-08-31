// Merging a session's own conditions over the weekend's defaults.
//
// A session is a whole race.ini now, so it can carry its own weather, wind,
// temperature, track state and start time. The weekend still holds defaults, and
// a session overrides them field by field - except for weather, which is a group
// rather than a field. See resolveConditions below.

import { WEATHER_FIELDS } from './constants.ts';
import type { Conditions } from '../../types/race.ts';

/**
 * Whether a set of conditions answers the weather question at all.
 *
 * Three fields answer it and only one of them is ever set, so "did this session
 * name a weather" cannot be asked of any single one of them.
 * @param conditions The conditions to look at, or undefined
 * @returns True when any of the three weather fields is set
 */
export const namesWeather = (conditions: Conditions | undefined): boolean => (
  conditions !== undefined && WEATHER_FIELDS.some((field) => conditions[field] !== undefined)
);

/**
 * The weather fields of a set of conditions, and nothing else.
 * @param conditions The conditions to read, or undefined
 * @returns Only the weather fields that are set
 */
export const pickWeather = (conditions: Conditions | undefined): Conditions => {
  const out: Conditions = {};
  if (!conditions) return out;

  if (conditions.weather !== undefined) out.weather = conditions.weather;
  if (conditions.weatherType !== undefined) out.weatherType = conditions.weatherType;
  if (conditions.weatherController !== undefined) {
    out.weatherController = conditions.weatherController;
  }
  if (conditions.weatherSteps !== undefined) out.weatherSteps = conditions.weatherSteps;

  return out;
};

/**
 * Resolves what a session actually runs in, given the weekend's defaults.
 *
 * Field by field, with one exception: `weather`, `weatherType` and
 * `weatherController` are three mutually exclusive ways of answering one
 * question, so a session naming any of them replaces all three. Merged one at a
 * time, a session asking for a CSP type would keep the weekend's preset beside
 * it and the two would disagree about what actually runs.
 * @param weekend The weekend's own conditions, or undefined
 * @param session The session's overrides, or undefined when it inherits everything
 * @returns The conditions the session runs in
 */
export const resolveConditions = (
  weekend: Conditions | undefined,
  session: Conditions | undefined,
): Conditions => {
  const merged: Conditions = { ...weekend, ...session };

  // Nothing to reconcile unless the session opened the weather question itself.
  if (!namesWeather(session)) return merged;

  WEATHER_FIELDS.forEach((field) => {
    delete merged[field];
  });

  return { ...merged, ...pickWeather(session) };
};
