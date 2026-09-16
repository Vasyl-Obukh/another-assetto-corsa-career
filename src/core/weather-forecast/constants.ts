// The numbers behind generated weather. First guesses, tuned against one aim: a
// championship should see a wet round now and again, not an extreme.

import type { ClimateProfile, Span, WeatherWeights } from './types.ts';
import { WeatherType } from '../../shared/constants/index.ts';
import { Climate } from '../../shared/types/index.ts';

/**
 * What each climate makes likely.
 *
 * Wet-day chances are per day, so a three-day weekend in an oceanic climate is
 * wet on at least one of them rather more often than the figure reads. Only the
 * weather a career races in appears here; the extremes are the user's to allow,
 * never the generator's to reach for.
 */
export const CLIMATE_PROFILE: Record<Climate, ClimateProfile> = {
  [Climate.ARID]: {
    wetDayChance: 0.02,
    persistence: 0.2,
    ambient: { min: 26, max: 36 },
    wind: { min: 8, max: 25 },
    changeChance: 0.1,
    dry: [
      [WeatherType.CLEAR, 6],
      [WeatherType.FEW_CLOUDS, 3],
      [WeatherType.SCATTERED_CLOUDS, 1],
      [WeatherType.HAZE, 1.5],
    ],
    wet: [
      [WeatherType.LIGHT_DRIZZLE, 2],
      [WeatherType.LIGHT_RAIN, 2],
      [WeatherType.LIGHT_THUNDERSTORM, 1],
    ],
  },
  [Climate.MEDITERRANEAN]: {
    wetDayChance: 0.1,
    persistence: 0.35,
    ambient: { min: 20, max: 30 },
    wind: { min: 5, max: 20 },
    changeChance: 0.25,
    dry: [
      [WeatherType.CLEAR, 4],
      [WeatherType.FEW_CLOUDS, 3],
      [WeatherType.SCATTERED_CLOUDS, 2],
      [WeatherType.BROKEN_CLOUDS, 1],
      [WeatherType.HAZE, 0.5],
    ],
    wet: [
      [WeatherType.LIGHT_RAIN, 3],
      [WeatherType.RAIN, 2],
      [WeatherType.LIGHT_THUNDERSTORM, 2],
      [WeatherType.THUNDERSTORM, 1.5],
      [WeatherType.HEAVY_RAIN, 0.5],
    ],
  },
  [Climate.TEMPERATE]: {
    wetDayChance: 0.2,
    persistence: 0.45,
    ambient: { min: 14, max: 26 },
    wind: { min: 8, max: 25 },
    changeChance: 0.35,
    dry: [
      [WeatherType.CLEAR, 2],
      [WeatherType.FEW_CLOUDS, 3],
      [WeatherType.SCATTERED_CLOUDS, 3],
      [WeatherType.BROKEN_CLOUDS, 2],
      [WeatherType.OVERCAST_CLOUDS, 1.5],
      [WeatherType.MIST, 0.3],
    ],
    wet: [
      [WeatherType.DRIZZLE, 2],
      [WeatherType.LIGHT_RAIN, 3],
      [WeatherType.RAIN, 2.5],
      [WeatherType.THUNDERSTORM, 1],
      [WeatherType.HEAVY_RAIN, 0.7],
    ],
  },
  [Climate.OCEANIC]: {
    wetDayChance: 0.3,
    persistence: 0.5,
    ambient: { min: 12, max: 22 },
    wind: { min: 10, max: 30 },
    changeChance: 0.45,
    dry: [
      [WeatherType.CLEAR, 1],
      [WeatherType.FEW_CLOUDS, 1.5],
      [WeatherType.SCATTERED_CLOUDS, 2.5],
      [WeatherType.BROKEN_CLOUDS, 3],
      [WeatherType.OVERCAST_CLOUDS, 3],
      [WeatherType.MIST, 0.5],
    ],
    wet: [
      [WeatherType.LIGHT_DRIZZLE, 1.5],
      [WeatherType.DRIZZLE, 2.5],
      [WeatherType.LIGHT_RAIN, 3],
      [WeatherType.RAIN, 2],
      [WeatherType.HEAVY_RAIN, 0.8],
      [WeatherType.LIGHT_THUNDERSTORM, 0.5],
    ],
  },
};

/**
 * The skies between showers on a wet day, whatever the climate.
 */
export const BREAK_WEATHER: WeatherWeights = [
  [WeatherType.BROKEN_CLOUDS, 2],
  [WeatherType.OVERCAST_CLOUDS, 3],
];

/**
 * How likely a session on a wet day is to be drawn from the breaks between
 * showers rather than from the rain, so a wet day is not rain in every session.
 */
export const WET_DAY_BREAK_CHANCE = 0.3;

/**
 * How likely a session is to carry on in whatever the session before it on the
 * same day ended in, so a day's weather reads as one day's.
 */
export const SESSION_PERSISTENCE = 0.6;

/**
 * Draws thrown away before any is used.
 *
 * The seed hash is a running sum, so two round ids differing only in their last
 * character seed within a hair of each other, and a Park-Miller generator's
 * first draws stay that close. A few draws in they have spread apart.
 */
export const WARM_UP_DRAWS = 4;

/**
 * How far one day of a weekend may stray from the weekend's own weather: air
 * temperature in degrees Celsius, wind in kilometres per hour and its direction
 * in degrees, each either way.
 */
export const DAY_WANDER = { ambient: 2.5, wind: 4, direction: 30 } as const;

/**
 * How much cooler a wet day runs than a dry one, in degrees Celsius.
 */
export const WET_AMBIENT_DROP = 4;

/**
 * The hour of the day the air is warmest.
 */
export const PEAK_HOUR = 15;

/**
 * How far below the peak the air runs at its coolest, in degrees Celsius, and
 * how many hours either side of the peak that takes.
 */
export const DIURNAL_SWING = { degrees: 6, hours: 6 } as const;

/**
 * How far either side of the day's typical wind a session's gusts run, in
 * kilometres per hour.
 */
export const WIND_BAND = 4;

/**
 * How far a session's wind direction may wander from its day's, in degrees.
 */
export const WIND_WANDER = 20;

/**
 * Degrees in a full turn of the compass.
 */
export const DEGREES_PER_TURN = 360;

/**
 * Where in a timed session its weather changes, as a share of its length.
 */
export const CHANGE_SHARE: Span = { min: 0.3, max: 0.7 };

/**
 * When a race run to a lap count changes weather, in minutes, since how long
 * the race lasts is not known until it has been driven.
 */
export const LAP_RACE_CHANGE_MINUTES: Span = { min: 8, max: 20 };
