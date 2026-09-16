// Which weather an install and the user's settings can actually race in, and
// what stands in for a type that is not on offer.
//
// Shared because both sides need the same answer: main generates a
// championship's weather over it, and the race screen offers exactly it.

import { CROSS_OVER, WEATHER_POSITION } from './constants.ts';
import {
  PURE_MISSING_TYPES, WEATHER_TYPE_ORDER, WET_WEATHER_TYPES,
} from '../../constants/weather-types.ts';
import type { WeatherType } from '../../constants/weather-types.ts';
import type { Conditions } from '../../types/race.ts';
import type { WeatherOffer, WeatherSystem } from '../../types/weather-plan.ts';
import { supportsDynamic } from '../weather-system/index.ts';

/**
 * The weather types worth offering, in menu order.
 * @param declared The type every installed preset declares, null where it declares none
 * @param allowed The types the user lets into the sim
 * @param system The chosen weather system
 * @param rainFx Whether RainFX will draw rain
 * @returns Every type that is installed, allowed and renderable
 */
export const offerableTypes = (
  declared: readonly (number | null)[],
  allowed: readonly WeatherType[],
  system: WeatherSystem,
  rainFx: boolean,
): WeatherType[] => {
  const installed = new Set(declared);
  const permitted = new Set(allowed);

  return WEATHER_TYPE_ORDER
    .filter((type) => installed.has(type) && permitted.has(type))
    // Asking for rain with RainFX switched off produces a dry race and says
    // nothing about it, so wet weather is simply not on offer.
    .filter((type) => rainFx || !WET_WEATHER_TYPES.has(type))
    .filter((type) => system !== 'pure' || !PURE_MISSING_TYPES.has(type));
};

/**
 * What an install and the user's settings can race in, as one value.
 * @param declared The type every installed preset declares, null where it declares none
 * @param allowed The types the user lets into the sim
 * @param system The chosen weather system
 * @param rainFx Whether RainFX will draw rain
 * @returns The types on offer, and whether they may change mid-session
 */
export const weatherOffer = (
  declared: readonly (number | null)[],
  allowed: readonly WeatherType[],
  system: WeatherSystem,
  rainFx: boolean,
): WeatherOffer => ({
  types: offerableTypes(declared, allowed, system, rainFx),
  dynamic: supportsDynamic(system),
});

/**
 * The closest weather on offer of the given kind.
 * @param type The weather wanted
 * @param candidates The types it may become
 * @returns The nearest, heavier on a tie, or null when there are none
 */
const closest = (type: WeatherType, candidates: readonly WeatherType[]): WeatherType | null => {
  const at = WEATHER_POSITION[type];

  return [...candidates].sort((a, b) => (
    Math.abs(WEATHER_POSITION[a] - at) - Math.abs(WEATHER_POSITION[b] - at)
    || WEATHER_POSITION[b] - WEATHER_POSITION[a]
  ))[0] ?? null;
};

/**
 * What a weather becomes when it is not on offer.
 *
 * Wet stays wet and dry stays dry wherever that is possible, since a race that
 * was meant to be wet and quietly runs dry is a different race. Only when
 * nothing of its own kind is on offer does it cross over.
 * @param type The weather wanted
 * @param offered The types on offer
 * @returns The type itself when on offer, its nearest stand-in otherwise, or
 *   null when nothing at all is on offer
 */
export const nearestOffered = (
  type: WeatherType,
  offered: readonly WeatherType[],
): WeatherType | null => {
  if (offered.includes(type)) return type;

  const wet = WET_WEATHER_TYPES.has(type);
  const sameKind = offered.filter((candidate) => WET_WEATHER_TYPES.has(candidate) === wet);
  if (sameKind.length > 0) return closest(type, sameKind);

  return closest(wet ? CROSS_OVER.wet : CROSS_OVER.dry, offered);
};

/**
 * The one weather type a set of conditions stands for when it cannot change.
 *
 * A plan whose weather system has no planner app still needs a weather in
 * race.ini, and the plan's opening step is what the session was meant to start
 * in - so that is what a static race runs.
 * @param conditions The conditions to read
 * @returns The type asked for, the plan's first step, or undefined when neither
 *   names one
 */
export const staticWeatherType = (conditions: Conditions): WeatherType | undefined => {
  if (conditions.weatherType != null) return conditions.weatherType;
  if (conditions.weather !== undefined) return undefined;

  const first = conditions.weatherSteps?.[0]?.weather;
  return typeof first === 'number' ? first : undefined;
};
