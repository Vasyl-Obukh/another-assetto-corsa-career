// Settings defaults and the closed sets of values they accept.

import { WeatherType } from './weather-types.ts';
import type {
  AiBase, CareerSettings, Currency, HistoricFrequency, Language, Settings, ThemeChoice, UnitSystem,
  WeatherSystem,
} from '../types/index.ts';

/**
 * Every theme choice the UI offers, in menu order.
 */
export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark'];

/**
 * Every language the UI offers, in menu order.
 */
export const LANGUAGES: readonly Language[] = ['en', 'uk'];

/**
 * The language whatever is missing in the reader's own falls back to - the
 * app's own copy and a document's author's text alike.
 */
export const FALLBACK_LANGUAGE: Language = 'en';

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
 * How many autosaves a career may keep, fewest first - the order the setting
 * offers them in.
 */
export const AUTOSAVE_COUNTS = [1, 3, 5, 10] as const;

/**
 * Every currency money may be shown in, in menu order.
 */
export const CURRENCIES: readonly Currency[] = ['USD', 'EUR', 'GBP'];

/**
 * Every unit system measurements may be shown in, in menu order.
 */
export const UNIT_SYSTEMS: readonly UnitSystem[] = ['metric', 'uk', 'us'];

/**
 * The progression speeds a career may run at, slowest first - what every prize
 * it earns, or every change of its rating, is multiplied by.
 */
export const PROGRESSION_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

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
 * What a new career's settings start as: following the app's opponents,
 * driving aids and currency, two events on one day clashing, a historic event a
 * month, and prizes and rating both moving at ×1.
 */
export const DEFAULT_CAREER_SETTINGS: CareerSettings = {
  opponents: null,
  drivingAids: null,
  currency: null,
  allowSameDayEvents: false,
  historicFrequency: 'monthly',
  prizeSpeed: 1,
  ratingSpeed: 1,
};

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
  carPrices: {},
  offeredContentSources: { packs: [], makers: [], distributors: [] },
  trackChoices: {},
  seriesActive: {},
  showFillerSeries: true,
  historicActive: {},
  autosaves: 3,
  currency: 'USD',
  units: 'metric',
  checkForUpdates: true,
  paths: {},
  window: { width: 1180, height: 800, maximized: false },
};
