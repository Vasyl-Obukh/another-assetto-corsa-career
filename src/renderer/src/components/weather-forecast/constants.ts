import type { ParseKeys } from 'i18next';
import {
  CloudDrizzleIcon,
  CloudFogIcon,
  CloudHailIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudRainWindIcon,
  CloudSnowIcon,
  CloudSunIcon,
  CloudyIcon,
  HazeIcon,
  SnowflakeIcon,
  SunIcon,
  ThermometerSnowflakeIcon,
  ThermometerSunIcon,
  TornadoIcon,
  WindIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { WeatherType } from '../../../../shared/constants';

/**
 * The label for every CSP weather type.
 *
 * Here rather than beside the race screen, because the settings screen's allowed
 * weather and every forecast read it too.
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
 * The icon every CSP weather type is drawn with.
 *
 * A record over the enum, so a weather type added to CSP fails to compile until
 * it has been drawn. Several share one where lucide has nothing finer - a
 * thunderstorm is a thunderstorm at any strength, and the label says which.
 */
export const WEATHER_ICON: Record<WeatherType, LucideIcon> = {
  [WeatherType.CLEAR]: SunIcon,
  [WeatherType.FEW_CLOUDS]: CloudSunIcon,
  [WeatherType.SCATTERED_CLOUDS]: CloudSunIcon,
  [WeatherType.BROKEN_CLOUDS]: CloudIcon,
  [WeatherType.OVERCAST_CLOUDS]: CloudyIcon,
  [WeatherType.WINDY]: WindIcon,
  [WeatherType.HAZE]: HazeIcon,
  [WeatherType.MIST]: CloudFogIcon,
  [WeatherType.FOG]: CloudFogIcon,
  [WeatherType.LIGHT_DRIZZLE]: CloudDrizzleIcon,
  [WeatherType.DRIZZLE]: CloudDrizzleIcon,
  [WeatherType.HEAVY_DRIZZLE]: CloudDrizzleIcon,
  [WeatherType.LIGHT_RAIN]: CloudRainIcon,
  [WeatherType.RAIN]: CloudRainIcon,
  [WeatherType.HEAVY_RAIN]: CloudRainWindIcon,
  [WeatherType.LIGHT_THUNDERSTORM]: CloudLightningIcon,
  [WeatherType.THUNDERSTORM]: CloudLightningIcon,
  [WeatherType.HEAVY_THUNDERSTORM]: CloudLightningIcon,
  [WeatherType.LIGHT_SLEET]: CloudSnowIcon,
  [WeatherType.SLEET]: CloudSnowIcon,
  [WeatherType.HEAVY_SLEET]: CloudSnowIcon,
  [WeatherType.LIGHT_SNOW]: SnowflakeIcon,
  [WeatherType.SNOW]: SnowflakeIcon,
  [WeatherType.HEAVY_SNOW]: SnowflakeIcon,
  [WeatherType.HAIL]: CloudHailIcon,
  [WeatherType.COLD]: ThermometerSnowflakeIcon,
  [WeatherType.HOT]: ThermometerSunIcon,
  [WeatherType.SMOKE]: HazeIcon,
  [WeatherType.DUST]: HazeIcon,
  [WeatherType.SAND]: HazeIcon,
  [WeatherType.SQUALLS]: CloudRainWindIcon,
  [WeatherType.TORNADO]: TornadoIcon,
  [WeatherType.HURRICANE]: TornadoIcon,
};
