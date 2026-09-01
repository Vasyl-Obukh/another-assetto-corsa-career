// Settings defaults and the closed sets of values they accept.

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
 * What a fresh install starts with, and what any unreadable field falls back to.
 */
export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  theme: 'system',
  language: 'en',
  weatherSystem: 'none',
  drivingAids: {},
  paths: {},
  window: { width: 1180, height: 800, maximized: false },
};
