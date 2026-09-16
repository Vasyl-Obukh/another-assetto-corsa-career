// Settings defaults and the closed sets of values they accept.

import { WeatherType } from './weather-types.ts';
import type {
  Language, Settings, ThemeChoice, WeatherSystem,
} from '../types/index.ts';

/**
 * Every theme choice the UI offers, in menu order.
 */
export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark'];

/**
 * Every language the UI offers, in menu order. English is the fallback.
 */
export const LANGUAGES: readonly Language[] = ['en', 'uk'];

/**
 * Every weather system the UI offers, in menu order.
 *
 * Plain Custom Shaders Patch first, because it is what an install with
 * neither mod has and so what a fresh one must default to.
 */
export const WEATHER_SYSTEMS: readonly WeatherSystem[] = ['none', 'pure', 'sol'];

/**
 * The weather a fresh install lets into the sim, in menu order.
 *
 * Whatever a championship actually races in: skies, the fogs, drizzle, rain and
 * thunderstorms. Snow, sleet, hail, sandstorms, smoke, squalls, tornadoes,
 * hurricanes and the three effect types start switched off, since a career
 * wants a wet round now and again rather than an extreme.
 */
export const DEFAULT_ALLOWED_WEATHER: readonly WeatherType[] = [
  WeatherType.CLEAR,
  WeatherType.FEW_CLOUDS,
  WeatherType.SCATTERED_CLOUDS,
  WeatherType.BROKEN_CLOUDS,
  WeatherType.OVERCAST_CLOUDS,
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
];

/**
 * What a fresh install starts with, and what any unreadable field falls back to.
 */
export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  theme: 'system',
  language: 'en',
  weatherSystem: 'none',
  allowedWeather: [...DEFAULT_ALLOWED_WEATHER],
  drivingAids: {},
  addedContent: { cars: [], tracks: [] },
  paths: {},
  window: { width: 1180, height: 800, maximized: false },
};
