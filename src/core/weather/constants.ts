import path from 'node:path';

import type { WeatherPreset } from './types.ts';

/**
 * Author recorded on every preset this app installs, so they can be told apart
 * from the user's own weathers.
 */
export const CAREER_WEATHER_AUTHOR = 'AC Career Mode';

/**
 * Time range each preset is offered for, covering the whole day.
 */
export const CAREER_WEATHER_TIME_DIAPASON = '00:00-23:59';

/**
 * The career weather presets.
 *
 * Rain values are taken verbatim from PURE's defaults table
 * (apps/lua/PurePlanner/settings/settings_defaults.lua) rather than invented.
 */
export const CAREER_WEATHERS: WeatherPreset[] = [
  {
    id: 'career_clear', name: 'Career - Clear', type: 15, intensity: 0, wetness: 0, water: 0, coeff: 1, cover: 0,
  },
  {
    id: 'career_overcast', name: 'Career - Overcast', type: 19, intensity: 0, wetness: 0, water: 0, coeff: 0.01, cover: 0.9,
  },
  {
    id: 'career_light_rain', name: 'Career - Light Rain', type: 6, intensity: 0.05, wetness: 0.05, water: 0.3, coeff: -0.2, cover: 0.9,
  },
  {
    id: 'career_rain', name: 'Career - Rain', type: 7, intensity: 0.125, wetness: 0.125, water: 0.6, coeff: -0.2, cover: 0.95,
  },
  {
    id: 'career_heavy_rain', name: 'Career - Heavy Rain', type: 8, intensity: 0.6, wetness: 0.6, water: 1, coeff: -0.5, cover: 1,
  },
  {
    id: 'career_thunderstorm', name: 'Career - Thunderstorm', type: 1, intensity: 0.2, wetness: 0.15, water: 0.4, coeff: -0.3, cover: 1,
  },
];

/**
 * Where CSP keeps the user's own weather settings, under the Documents folder.
 */
export const WEATHER_FX_FILE = path.join('cfg', 'extension', 'weather_fx.ini');

/**
 * Where CSP keeps the user's own rain settings, under the Documents folder.
 */
export const RAIN_FX_FILE = path.join('cfg', 'extension', 'rain_fx.ini');

/**
 * Where the shipped defaults for both live, under the AC root.
 *
 * A module is on unless something turns it off, and the user's own copy under
 * Documents overrides this one key by key.
 */
export const CSP_CONFIG_DIR = path.join('extension', 'config');

/**
 * A leading or trailing quote, which CSP wraps its controller name in and AC's
 * own INI files never use.
 */
export const QUOTES = /^['"]|['"]$/g;
