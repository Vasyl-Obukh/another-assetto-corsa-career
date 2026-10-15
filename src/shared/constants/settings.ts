// Settings defaults and the closed sets of values they accept.

import { WeatherType } from './weather-types.ts';
import type {
  AiBase, HistoricFrequency, Language, Settings, ThemeChoice, WeatherSystem,
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
 * How often a season may draw historic events, rarest first - the order the
 * setting offers them in.
 */
export const HISTORIC_FREQUENCIES: readonly HistoricFrequency[] = [
  'off', 'quarterly', 'monthly', 'fortnightly', 'weekly',
];

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
 * How strong and how aggressive the AI are before any championship adds to it.
 *
 * 88 is the middle of the 92-to-84 spread every championship used to be given
 * when it named none, so a field with no offsets races as fast on average as it
 * did before strength became the player's.
 */
export const DEFAULT_OPPONENTS: AiBase = { strength: 88, aggression: 30 };

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
  opponents: { ...DEFAULT_OPPONENTS },
  addedContent: { cars: [], tracks: [] },
  hiddenContentSources: { packs: [], makers: [], distributors: [] },
  seriesActive: {},
  showFillerSeries: true,
  allowSameDayEvents: false,
  historicFrequency: 'monthly',
  historicActive: {},
  paths: {},
  window: { width: 1180, height: 800, maximized: false },
};
