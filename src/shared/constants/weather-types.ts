// CSP's weather types, which are what a weather controller actually renders.
//
// Transcribed from `extension/internal/lua-sdk/ac_apps/lib.lua` in a Custom
// Shaders Patch install, where it is declared as `ac.WeatherType`. The numbers
// are the point: one of them is what `[LIGHTING] __CM_WEATHER_TYPE` carries.
// PURE ships no weather folders at all and draws the type instead, so which
// types an install can offer depends on what its presets declare.

/**
 * A CSP weather type, as `ac.WeatherType` numbers them.
 *
 * Numeric rather than kebab-case, unlike the other enums here, because the
 * number is what reaches disk.
 */
export enum WeatherType {
  LIGHT_THUNDERSTORM = 0,
  THUNDERSTORM = 1,
  HEAVY_THUNDERSTORM = 2,
  LIGHT_DRIZZLE = 3,
  DRIZZLE = 4,
  HEAVY_DRIZZLE = 5,
  LIGHT_RAIN = 6,
  RAIN = 7,
  HEAVY_RAIN = 8,
  LIGHT_SNOW = 9,
  SNOW = 10,
  HEAVY_SNOW = 11,
  LIGHT_SLEET = 12,
  SLEET = 13,
  HEAVY_SLEET = 14,
  CLEAR = 15,
  FEW_CLOUDS = 16,
  SCATTERED_CLOUDS = 17,
  BROKEN_CLOUDS = 18,
  OVERCAST_CLOUDS = 19,
  FOG = 20,
  MIST = 21,
  SMOKE = 22,
  HAZE = 23,
  SAND = 24,
  DUST = 25,
  SQUALLS = 26,
  TORNADO = 27,
  HURRICANE = 28,
  COLD = 29,
  HOT = 30,
  WINDY = 31,
  HAIL = 32,
}

/**
 * The order the weather menu offers them in.
 *
 * Not the enum's own order, which runs thunderstorms first and clear skies
 * fifteenth. This reads the way someone picking weather thinks: clear, then
 * cloudier, then wetter, then the extremes nobody races in on purpose.
 */
export const WEATHER_TYPE_ORDER: WeatherType[] = [
  WeatherType.CLEAR,
  WeatherType.FEW_CLOUDS,
  WeatherType.SCATTERED_CLOUDS,
  WeatherType.BROKEN_CLOUDS,
  WeatherType.OVERCAST_CLOUDS,
  WeatherType.WINDY,
  WeatherType.HAZE,
  WeatherType.MIST,
  WeatherType.FOG,
  WeatherType.LIGHT_DRIZZLE,
  WeatherType.DRIZZLE,
  WeatherType.HEAVY_DRIZZLE,
  WeatherType.LIGHT_RAIN,
  WeatherType.RAIN,
  WeatherType.HEAVY_RAIN,
  WeatherType.LIGHT_THUNDERSTORM,
  WeatherType.THUNDERSTORM,
  WeatherType.HEAVY_THUNDERSTORM,
  WeatherType.LIGHT_SLEET,
  WeatherType.SLEET,
  WeatherType.HEAVY_SLEET,
  WeatherType.LIGHT_SNOW,
  WeatherType.SNOW,
  WeatherType.HEAVY_SNOW,
  WeatherType.HAIL,
  WeatherType.COLD,
  WeatherType.HOT,
  WeatherType.SMOKE,
  WeatherType.DUST,
  WeatherType.SAND,
  WeatherType.SQUALLS,
  WeatherType.TORNADO,
  WeatherType.HURRICANE,
];

/**
 * Weather types that put water on the track, so a preset declaring one can be
 * shown as wet without reading its `[RAINFX]` block - which only six of the
 * forty-five presets on a Sol-equipped library carry, all of them ours.
 */
export const WET_WEATHER_TYPES = new Set<WeatherType>([
  WeatherType.LIGHT_DRIZZLE,
  WeatherType.DRIZZLE,
  WeatherType.HEAVY_DRIZZLE,
  WeatherType.LIGHT_RAIN,
  WeatherType.RAIN,
  WeatherType.HEAVY_RAIN,
  WeatherType.LIGHT_THUNDERSTORM,
  WeatherType.THUNDERSTORM,
  WeatherType.HEAVY_THUNDERSTORM,
  WeatherType.LIGHT_SLEET,
  WeatherType.SLEET,
  WeatherType.HEAVY_SLEET,
  WeatherType.SQUALLS,
  WeatherType.HURRICANE,
]);
