// Whether a round may race in the wet, and what it races in when it may not.
//
// Shared because main lowers a round on it and the renderer shows the same
// answer on the round's page and the championship's.

import { WET_WEATHER_TYPES } from '../../constants/weather-types.ts';
import type { WeatherType } from '../../constants/weather-types.ts';
import type { SeasonEntry, SeasonEvent } from '../../types/career.ts';
import type { Conditions } from '../../types/race.ts';
import type { Championship } from '../../types/series.ts';
import type { WeatherOffer } from '../../types/weather-plan.ts';
import { nearestOffered } from '../weather-types/index.ts';

/**
 * Whether a round may race in the wet: its own say, else its edition's, else
 * the championship's, else it may.
 * @param championship The championship, the edition's own copy inside a career
 * @param entry The edition the career is in, when it is in one
 * @param event The round, when it is one round being asked about
 * @returns Whether rain is allowed
 */
export const rainAllowed = (
  championship: Pick<Championship, 'rain'>,
  entry?: Pick<SeasonEntry, 'rain'> | null,
  event?: Pick<SeasonEvent, 'rain'> | null,
): boolean => event?.rain ?? entry?.rain ?? championship.rain ?? true;

/**
 * A career's edition or round with its say on rain replaced.
 * @param value The edition or round
 * @param rain Whether rain is allowed, or null to follow - which drops the key
 * @returns The same value with its say replaced
 */
export const withRain = <T extends { rain?: boolean }>(value: T, rain: boolean | null): T => {
  const { rain: unused, ...rest } = value;

  return (rain === null ? rest : { ...rest, rain }) as T;
};

/**
 * An offer with every wet weather taken out of it.
 * @param offer What the install and settings can race in
 * @returns The same offer, dry
 */
export const dryOffer = (offer: WeatherOffer): WeatherOffer => ({
  ...offer,
  types: offer.types.filter((type) => !WET_WEATHER_TYPES.has(type)),
});

/**
 * A weather type, or the nearest dry one where it is wet.
 * @param type The weather asked for
 * @param dry The dry types on offer
 * @returns The type to race - itself where it is dry, or wet and nothing dry is
 *   on offer to stand in for it
 */
export const driedType = (type: WeatherType, dry: readonly WeatherType[]): WeatherType => (
  WET_WEATHER_TYPES.has(type) ? nearestOffered(type, dry) ?? type : type
);

/**
 * Conditions a round or a session states for itself, with no rain in them.
 *
 * Wet weather becomes the nearest dry weather on offer, a named preset by the
 * type it declares, and a plan's steps lose their rain. Dry weather is left as
 * stated, offered or not, since what a document authors is raced as authored -
 * and so is everything when nothing dry is on offer at all.
 * @param conditions The conditions, if any
 * @param dry The dry types on offer
 * @param presetType The type a named weather preset declares, null where none
 * @returns The conditions, dry
 */
export const withoutRain = (
  conditions: Conditions | undefined,
  dry: readonly WeatherType[],
  presetType: (preset: string) => number | null,
): Conditions | undefined => {
  if (!conditions || dry.length === 0) return conditions;

  const { weather, weatherType, weatherSteps } = conditions;
  const next: Conditions = { ...conditions };

  if (weatherType != null) {
    next.weatherType = driedType(weatherType, dry);
  } else if (weather !== undefined) {
    const declared = presetType(weather);
    if (declared !== null && WET_WEATHER_TYPES.has(declared)) {
      delete next.weather;
      next.weatherType = driedType(declared, dry);
    }
  }

  if (weatherSteps !== undefined) {
    next.weatherSteps = weatherSteps.map((step) => ({
      ...step,
      ...(step.weather === 'race' ? {} : { weather: driedType(step.weather, dry) }),
      ...(step.rain === undefined ? {} : { rain: 0 }),
    }));
  }

  return next;
};
