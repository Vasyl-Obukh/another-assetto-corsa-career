import type { ParseKeys } from 'i18next';

import { WeatherType } from '../../../../shared/constants';
import type { SessionType, TrackStateName } from '../../../../shared/types';

/**
 * The session types the setup screen offers.
 *
 * A deliberate subset of SessionType. Practice, qualifying and a race are what
 * the bundler's rules were measured against and what summarise() classifies;
 * hotlap, time attack, drift and drag are expressible in race.ini and have
 * never been driven through this path, so offering them would be a guess.
 */
export const SESSION_TYPES: SessionType[] = ['practice', 'qualify', 'race'];

/**
 * The label for every session type, including the ones not offered - a draft
 * written by hand can still name one, and it should read as itself.
 */
export const SESSION_TYPE_LABEL: Record<SessionType, ParseKeys> = {
  practice: 'race.sessionType.practice',
  qualify: 'race.sessionType.qualify',
  race: 'race.sessionType.race',
  hotlap: 'race.sessionType.hotlap',
  timeAttack: 'race.sessionType.timeAttack',
  drift: 'race.sessionType.drift',
  drag: 'race.sessionType.drag',
};

/**
 * How much rubber is down at the start, in the order the menu offers it.
 */
export const TRACK_STATES: TrackStateName[] = ['green', 'fast', 'optimum'];

/**
 * The label for each track state.
 */
export const TRACK_STATE_LABEL: Record<TrackStateName, ParseKeys> = {
  green: 'race.trackState.green',
  fast: 'race.trackState.fast',
  optimum: 'race.trackState.optimum',
};

/**
 * The value a weather menu uses for "whatever Assetto Corsa would pick".
 *
 * An empty string cannot be a Select item value in Radix, and a folder name can
 * be anything, so the sentinel is a string no folder can hold - `/` is not
 * legal in a Windows path segment.
 */
export const NOT_SET = '/none';

/**
 * The value a session's own condition uses for "take the weekend's".
 *
 * Distinct from NOT_SET because the two answer different questions: a weekend
 * naming no weather leaves it to Assetto Corsa, while a session naming none
 * inherits one that may well be set.
 */
export const INHERIT = '/inherit';

/**
 * Smallest grid a race can be run with: the player, alone.
 */
export const MIN_GRID = 1;

/**
 * Largest grid the setup screen offers.
 *
 * Not a limit AC imposes - the real ceiling is the track's pit boxes, which is
 * checked against the installed track and reported as a problem.
 */
export const MAX_GRID = 64;

/**
 * The bounds AI skill and aggression are given as percentages.
 */
export const MIN_AI = 0;

/**
 * The top of that range.
 */
export const MAX_AI = 100;


/**
 * How a weather option encodes what it stands for.
 *
 * One menu answers three different questions - dynamic weather, a CSP weather
 * type, or a named preset - and a Radix Select item carries a single string, so
 * the kind travels in a prefix. None of the three can collide: a controller
 * folder name cannot hold a colon, and the other two are ours to mint.
 */
export const WEATHER_VALUE = {
  dynamic: 'dynamic:',
  type: 'type:',
  preset: 'preset:',
} as const;

/**
 * The label for every CSP weather type.
 */
export const WEATHER_TYPE_LABEL: Record<WeatherType, ParseKeys> = {
  [WeatherType.CLEAR]: 'race.weatherType.clear',
  [WeatherType.FEW_CLOUDS]: 'race.weatherType.fewClouds',
  [WeatherType.SCATTERED_CLOUDS]: 'race.weatherType.scatteredClouds',
  [WeatherType.BROKEN_CLOUDS]: 'race.weatherType.brokenClouds',
  [WeatherType.OVERCAST_CLOUDS]: 'race.weatherType.overcastClouds',
  [WeatherType.WINDY]: 'race.weatherType.windy',
  [WeatherType.HAZE]: 'race.weatherType.haze',
  [WeatherType.MIST]: 'race.weatherType.mist',
  [WeatherType.FOG]: 'race.weatherType.fog',
  [WeatherType.LIGHT_DRIZZLE]: 'race.weatherType.lightDrizzle',
  [WeatherType.DRIZZLE]: 'race.weatherType.drizzle',
  [WeatherType.HEAVY_DRIZZLE]: 'race.weatherType.heavyDrizzle',
  [WeatherType.LIGHT_RAIN]: 'race.weatherType.lightRain',
  [WeatherType.RAIN]: 'race.weatherType.rain',
  [WeatherType.HEAVY_RAIN]: 'race.weatherType.heavyRain',
  [WeatherType.LIGHT_THUNDERSTORM]: 'race.weatherType.lightThunderstorm',
  [WeatherType.THUNDERSTORM]: 'race.weatherType.thunderstorm',
  [WeatherType.HEAVY_THUNDERSTORM]: 'race.weatherType.heavyThunderstorm',
  [WeatherType.LIGHT_SLEET]: 'race.weatherType.lightSleet',
  [WeatherType.SLEET]: 'race.weatherType.sleet',
  [WeatherType.HEAVY_SLEET]: 'race.weatherType.heavySleet',
  [WeatherType.LIGHT_SNOW]: 'race.weatherType.lightSnow',
  [WeatherType.SNOW]: 'race.weatherType.snow',
  [WeatherType.HEAVY_SNOW]: 'race.weatherType.heavySnow',
  [WeatherType.HAIL]: 'race.weatherType.hail',
  [WeatherType.COLD]: 'race.weatherType.cold',
  [WeatherType.HOT]: 'race.weatherType.hot',
  [WeatherType.SMOKE]: 'race.weatherType.smoke',
  [WeatherType.DUST]: 'race.weatherType.dust',
  [WeatherType.SAND]: 'race.weatherType.sand',
  [WeatherType.SQUALLS]: 'race.weatherType.squalls',
  [WeatherType.TORNADO]: 'race.weatherType.tornado',
  [WeatherType.HURRICANE]: 'race.weatherType.hurricane',
};

/**
 * How many slots make a plan rather than a static weather.
 */
export const MIN_PLAN_SLOTS = 2;

/**
 * How long a slot runs for when one is added, in minutes.
 */
export const DEFAULT_SLOT_MINUTES = 10;

/**
 * The weather types PURE's own table does not carry.
 *
 * Its Default_WeatherPresets.json runs 0-28 then 31, 32 - Cold and Hot are
 * simply absent, where Sol has them. Asking PURE for one would write an index
 * it cannot look up.
 */
export const PURE_MISSING_TYPES: ReadonlySet<WeatherType> = new Set([
  WeatherType.COLD,
  WeatherType.HOT,
]);
