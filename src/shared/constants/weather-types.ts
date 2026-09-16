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

/**
 * How hard each weather type rains, from 0 to 1.
 *
 * Read off the `rain` column of PURE's own defaults table
 * (apps/lua/PurePlanner/settings/settings_defaults.lua), the same table the
 * career presets took their values from, rather than invented. Snow, hail and
 * everything dry put no water on the track and read 0.
 */
export const RAIN_INTENSITY: Record<WeatherType, number> = {
  [WeatherType.LIGHT_THUNDERSTORM]: 0.1,
  [WeatherType.THUNDERSTORM]: 0.2,
  [WeatherType.HEAVY_THUNDERSTORM]: 0.35,
  [WeatherType.LIGHT_DRIZZLE]: 0.001,
  [WeatherType.DRIZZLE]: 0.02,
  [WeatherType.HEAVY_DRIZZLE]: 0.075,
  [WeatherType.LIGHT_RAIN]: 0.05,
  [WeatherType.RAIN]: 0.125,
  [WeatherType.HEAVY_RAIN]: 0.6,
  [WeatherType.LIGHT_SNOW]: 0,
  [WeatherType.SNOW]: 0,
  [WeatherType.HEAVY_SNOW]: 0,
  [WeatherType.LIGHT_SLEET]: 0.05,
  [WeatherType.SLEET]: 0.1,
  [WeatherType.HEAVY_SLEET]: 0.3,
  [WeatherType.CLEAR]: 0,
  [WeatherType.FEW_CLOUDS]: 0,
  [WeatherType.SCATTERED_CLOUDS]: 0,
  [WeatherType.BROKEN_CLOUDS]: 0,
  [WeatherType.OVERCAST_CLOUDS]: 0,
  [WeatherType.FOG]: 0,
  [WeatherType.MIST]: 0,
  [WeatherType.SMOKE]: 0,
  [WeatherType.HAZE]: 0,
  [WeatherType.SAND]: 0,
  [WeatherType.DUST]: 0,
  [WeatherType.SQUALLS]: 0.025,
  [WeatherType.TORNADO]: 0,
  [WeatherType.HURRICANE]: 0.8,
  [WeatherType.COLD]: 0,
  [WeatherType.HOT]: 0,
  [WeatherType.WINDY]: 0,
  [WeatherType.HAIL]: 0,
};
