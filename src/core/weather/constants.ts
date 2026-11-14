import path from 'node:path';

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
