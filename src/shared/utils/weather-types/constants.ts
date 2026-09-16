import { WeatherType } from '../../constants/weather-types.ts';

/**
 * Where each weather type sits on a line from clear skies to the heaviest storm,
 * which is what "the nearest weather on offer" measures along.
 *
 * Dry types run 0 to 7.5 and wet ones 10 to 17, and the two are never compared
 * with each other, so the gap between them only keeps the numbers readable. The
 * half steps are deliberate: they break ties that would otherwise go the wrong
 * way, so overcast falls back to broken cloud rather than to haze.
 *
 * The types nobody races in on purpose sit beside the racing type they look
 * most like, so switching one off still swaps it for something plausible.
 */
export const WEATHER_POSITION: Record<WeatherType, number> = {
  [WeatherType.CLEAR]: 0,
  [WeatherType.COLD]: 0,
  [WeatherType.HOT]: 0,
  [WeatherType.FEW_CLOUDS]: 1,
  [WeatherType.SCATTERED_CLOUDS]: 2,
  [WeatherType.WINDY]: 2,
  [WeatherType.BROKEN_CLOUDS]: 3,
  [WeatherType.OVERCAST_CLOUDS]: 4,
  [WeatherType.LIGHT_SNOW]: 4,
  [WeatherType.SNOW]: 4,
  [WeatherType.HEAVY_SNOW]: 4,
  [WeatherType.HAIL]: 4,
  [WeatherType.TORNADO]: 4,
  [WeatherType.HAZE]: 5.5,
  [WeatherType.DUST]: 5.5,
  [WeatherType.SAND]: 5.5,
  [WeatherType.SMOKE]: 5.5,
  [WeatherType.MIST]: 6.5,
  [WeatherType.FOG]: 7.5,
  [WeatherType.LIGHT_DRIZZLE]: 10,
  [WeatherType.DRIZZLE]: 11,
  [WeatherType.HEAVY_DRIZZLE]: 12,
  [WeatherType.LIGHT_SLEET]: 12,
  [WeatherType.LIGHT_RAIN]: 13,
  [WeatherType.SLEET]: 13,
  [WeatherType.RAIN]: 14,
  [WeatherType.HEAVY_SLEET]: 14,
  [WeatherType.LIGHT_THUNDERSTORM]: 14.5,
  [WeatherType.THUNDERSTORM]: 15,
  [WeatherType.SQUALLS]: 15,
  [WeatherType.HEAVY_RAIN]: 16,
  [WeatherType.HEAVY_THUNDERSTORM]: 17,
  [WeatherType.HURRICANE]: 17,
};

/**
 * Where to cross over from when nothing of a weather's own kind is on offer.
 *
 * A wet weather with no wet type allowed becomes the dry sky nearest to rain,
 * and a dry one with only wet types allowed becomes the lightest of them.
 */
export const CROSS_OVER = {
  wet: WeatherType.OVERCAST_CLOUDS,
  dry: WeatherType.LIGHT_DRIZZLE,
} as const;
