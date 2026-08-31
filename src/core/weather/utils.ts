import { readFile } from 'node:fs/promises';

import { CAREER_WEATHER_AUTHOR, CAREER_WEATHER_TIME_DIAPASON } from './constants.ts';
import type { WeatherPreset } from './types.ts';
import { parseIni, writeIni } from '../ini/index.ts';

/**
 * Renders a preset as the contents of a weather.ini.
 * @param preset The preset to render
 * @returns INI text ready to write into content/weather
 */
export const weatherIniFor = (preset: WeatherPreset): string => writeIni({
  CLOUDS: {
    COVER: preset.cover,
    CUTOFF: 0,
    COLOR: 0,
    WIDTH: 1,
    HEIGHT: 1,
    RADIUS: 1,
    NUMBER: 0,
    BASE_SPEED_MULT: 0,
  },
  FOG: {
    COLOR: '1.9,2.45,3.32',
    BLEND: 0.75,
    DISTANCE: 8000,
  },
  LAUNCHER: {
    NAME: preset.name,
    TEMPERATURE_COEFF: preset.coeff,
  },
  __LAUNCHER_CM: {
    WEATHER_TYPE: preset.type,
    AUTHOR: CAREER_WEATHER_AUTHOR,
    TIME_DIAPASON: CAREER_WEATHER_TIME_DIAPASON,
  },
  RAINFX: {
    INTENSITY: preset.intensity,
    WETNESS: preset.wetness,
    WATER: preset.water,
  },
});

/**
 * Reads one key out of an INI file, treating anything unreadable as absent.
 *
 * These are CSP's own config files, which may not exist on an install that has
 * never opened the settings for that module.
 * @param file The file to read
 * @param section The section to look in
 * @param key The key to read
 * @returns Its raw value, or null when the file or the key is not there
 */
export const readIniValue = async (
  file: string,
  section: string,
  key: string,
): Promise<string | null> => {
  try {
    const text = await readFile(file, 'utf8');

    return parseIni(text)[section]?.[key]?.trim() ?? null;
  } catch {
    return null;
  }
};
