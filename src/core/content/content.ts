// Scanning installed content. Car and track IDs are just folder names, so mods
// need no special handling - but mod authors ship malformed ui_*.json
// routinely, so reads are lenient and failures skip the entry.

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { HIDDEN_FOLDER_PREFIX } from './constants.ts';
import type { UiCar, UiTrack } from './types.ts';
import {
  listDirs, makeTrack, readJsonFile,
} from './utils.ts';
import type {
  Car, Content, Track, Weather, WeatherController,
} from '../../shared/types/index.ts';
import { parseIni } from '../ini/index.ts';
import type { IniData } from '../ini/index.ts';

export { looseJson, parseGeotag } from './utils.ts';
export type { UiCar, UiTrack } from './types.ts';

/**
 * Scans all installed cars.
 * @param contentDir The AC content directory
 * @returns Every installed car, sorted by display name
 */
export const scanCars = async (contentDir: string): Promise<Car[]> => {
  const carsDir = path.join(contentDir, 'cars');
  const ids = (await listDirs(carsDir)).filter((id) => !id.startsWith(HIDDEN_FOLDER_PREFIX));

  const cars = await Promise.all(ids.map(async (id): Promise<Car> => {
    const ui = await readJsonFile<UiCar>(path.join(carsDir, id, 'ui', 'ui_car.json'));
    const skins = await listDirs(path.join(carsDir, id, 'skins'));

    return {
      id,
      name: ui?.name ?? id,
      brand: ui?.brand ?? null,
      tags: Array.isArray(ui?.tags) ? ui.tags : [],
      skins,
    };
  }));

  return cars.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Scans all installed tracks, one entry per layout.
 *
 * Layout granularity is what race.ini works at, through TRACK plus CONFIG_TRACK.
 * @param contentDir The AC content directory
 * @returns Every installed track layout, sorted by display name
 */
export const scanTracks = async (contentDir: string): Promise<Track[]> => {
  const tracksDir = path.join(contentDir, 'tracks');
  const ids = (await listDirs(tracksDir)).filter((id) => !id.startsWith(HIDDEN_FOLDER_PREFIX));

  const nested = await Promise.all(ids.map(async (id): Promise<Track[]> => {
    const uiDir = path.join(tracksDir, id, 'ui');

    // Single-layout tracks put ui_track.json directly in ui/.
    const root = await readJsonFile<UiTrack>(path.join(uiDir, 'ui_track.json'));
    if (root) return [makeTrack(id, '', root)];

    const layouts = await listDirs(uiDir);
    const resolved = await Promise.all(layouts.map(async (layout) => {
      const ui = await readJsonFile<UiTrack>(path.join(uiDir, layout, 'ui_track.json'));
      return ui ? makeTrack(id, layout, ui) : null;
    }));

    return resolved.filter((track): track is Track => track !== null);
  }));

  return nested.flat().sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Scans all installed weather presets.
 *
 * The CSP weather type is read from each weather.ini rather than a hardcoded
 * table, which is how Content Manager gets it too - so mod weathers work
 * without any extra mapping.
 * @param contentDir The AC content directory
 * @returns Every readable weather preset, sorted by ID
 */
export const scanWeather = async (contentDir: string): Promise<Weather[]> => {
  const weatherDir = path.join(contentDir, 'weather');
  const ids = (await listDirs(weatherDir)).filter((id) => !id.startsWith(HIDDEN_FOLDER_PREFIX));

  const weathers = await Promise.all(ids.map(async (id): Promise<Weather | null> => {
    let ini: IniData;
    try {
      ini = parseIni(await readFile(path.join(weatherDir, id, 'weather.ini'), 'utf8'));
    } catch {
      return null;
    }

    // Kunos weathers have no __LAUNCHER_CM section; null means "let CM decide".
    const type = ini.__LAUNCHER_CM?.WEATHER_TYPE;

    return {
      id,
      name: ini.LAUNCHER?.NAME ?? id,
      type: type === undefined ? null : parseInt(type, 10),
      temperatureCoeff: parseFloat(ini.LAUNCHER?.TEMPERATURE_COEFF ?? '0') || 0,
      author: ini.__LAUNCHER_CM?.AUTHOR ?? null,
    };
  }));

  return weathers
    .filter((weather): weather is Weather => weather !== null)
    .sort((a, b) => a.id.localeCompare(b.id));
};

/**
 * Scans installed CSP weather controllers, from extension/weather-controllers.
 * @param acRoot The AC install root, not the content directory
 * @returns Every installed controller
 */
export const scanWeatherControllers = async (acRoot: string): Promise<WeatherController[]> => {
  const dir = path.join(acRoot, 'extension', 'weather-controllers');
  const ids = await listDirs(dir);

  return Promise.all(ids.map(async (id): Promise<WeatherController> => {
    let ini: IniData = {};
    try {
      ini = parseIni(await readFile(path.join(dir, id, 'manifest.ini'), 'utf8'));
    } catch {
      // A controller without a manifest still works; the id is what matters.
    }

    return {
      id,
      name: ini.ABOUT?.NAME ?? id,
      author: ini.ABOUT?.AUTHOR ?? null,
      description: ini.ABOUT?.DESCRIPTION ?? null,
    };
  }));
};

/**
 * Scans everything at once, for the scan command and for race validation.
 * @param contentDir The AC content directory; the install root is its parent
 * @returns Cars, tracks, weathers and weather controllers
 */
export const scanContent = async (contentDir: string): Promise<Content> => {
  const acRoot = path.dirname(contentDir);
  const [cars, tracks, weather, controllers] = await Promise.all([
    scanCars(contentDir),
    scanTracks(contentDir),
    scanWeather(contentDir),
    scanWeatherControllers(acRoot),
  ]);

  return {
    cars, tracks, weather, controllers,
  };
};

/**
 * Builds the path to a car skin's preview image.
 * @param contentDir The AC content directory
 * @param carId Car folder name
 * @param skinId Skin folder name
 * @returns An absolute path, which may not exist
 */
export const skinPreview = (contentDir: string, carId: string, skinId: string): string => (
  path.join(contentDir, 'cars', carId, 'skins', skinId, 'preview.jpg')
);

/**
 * Checks whether a path exists.
 * @param target Absolute path to test
 * @returns True when something is there
 */
export const fileExists = async (target: string): Promise<boolean> => {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
};
