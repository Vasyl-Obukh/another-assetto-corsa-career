// Scanning installed content. Car and track IDs are just folder names, so mods
// need no special handling -- but mod authors ship malformed ui_*.json
// routinely, so reads are lenient and failures skip the entry.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseIni } from './ini.ts';
import type {
  Car, Content, Track, Weather, WeatherController,
} from './types.ts';

interface UiCar {
  name?: string;
  brand?: string;
  tags?: string[];
}

interface UiTrack {
  name?: string;
  country?: string;
  pitboxes?: string | number;
  geotags?: string[];
}

/** JSON.parse, but tolerant of what mod authors actually ship. */
export function looseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/^﻿/, '')
    .replace(/\r/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Last resort for files with broken encodings: salvage just the name.
    const name = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(cleaned);
    return name?.[1] === undefined ? null : ({ name: name[1] } as T);
  }
}

async function readJsonFile<T>(file: string): Promise<T | null> {
  try {
    return looseJson<T>(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function listDirs(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

/**
 * Convert AC's geotag strings to decimal degrees. They come in two shapes:
 * `52° 50′ 50″ N` and plain `52.8472`.
 */
export function parseGeotag(value: unknown): number | null {
  if (typeof value !== 'string') return null;

  const dms = /^\s*(-?[\d.]+)\s*[°d]\s*(?:([\d.]+)\s*[′'′]\s*)?(?:([\d.]+)\s*[″"”]\s*)?([NSEW])?/i.exec(value);
  if (dms?.[1] !== undefined) {
    const degrees = parseFloat(dms[1]);
    const minutes = parseFloat(dms[2] ?? '0');
    const seconds = parseFloat(dms[3] ?? '0');
    const decimal = Math.abs(degrees) + minutes / 60 + seconds / 3600;
    return degrees < 0 || /[SW]/i.test(dms[4] ?? '') ? -decimal : decimal;
  }

  const plain = parseFloat(value);
  return Number.isFinite(plain) ? plain : null;
}

/** All installed cars. */
export async function scanCars(contentDir: string): Promise<Car[]> {
  const carsDir = path.join(contentDir, 'cars');
  const ids = (await listDirs(carsDir)).filter((id) => !id.startsWith('.'));

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
}

function makeTrack(id: string, layout: string, ui: UiTrack): Track {
  const [lat, lon] = Array.isArray(ui.geotags) ? ui.geotags : [];
  const pitboxes = parseInt(String(ui.pitboxes), 10);
  return {
    id,
    layout,
    key: layout ? `${id}/${layout}` : id,
    name: ui.name ?? id,
    country: ui.country ?? null,
    pitboxes: Number.isFinite(pitboxes) ? pitboxes : null,
    geotags: { lat: parseGeotag(lat), lon: parseGeotag(lon) },
  };
}

/**
 * All installed tracks, one entry per layout -- that is the granularity
 * race.ini works at (TRACK plus CONFIG_TRACK).
 */
export async function scanTracks(contentDir: string): Promise<Track[]> {
  const tracksDir = path.join(contentDir, 'tracks');
  const ids = (await listDirs(tracksDir)).filter((id) => !id.startsWith('.'));

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
}

/**
 * All installed weathers. The CSP weather type is read from each weather.ini
 * rather than a hardcoded table, which is how CM gets it too -- so mod weathers
 * work without any extra mapping.
 */
export async function scanWeather(contentDir: string): Promise<Weather[]> {
  const weatherDir = path.join(contentDir, 'weather');
  const ids = (await listDirs(weatherDir)).filter((id) => !id.startsWith('.'));

  const weathers = await Promise.all(ids.map(async (id): Promise<Weather | null> => {
    let ini;
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
}

/** Installed CSP weather controllers, from extension/weather-controllers. */
export async function scanWeatherControllers(acRoot: string): Promise<WeatherController[]> {
  const dir = path.join(acRoot, 'extension', 'weather-controllers');
  const ids = await listDirs(dir);

  return Promise.all(ids.map(async (id): Promise<WeatherController> => {
    let ini = {} as ReturnType<typeof parseIni>;
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
}

/** Everything at once, for the scan command and for race validation. */
export async function scanContent(contentDir: string): Promise<Content> {
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
}

/** Preview image for a car skin, as an absolute path (may not exist). */
export function skinPreview(contentDir: string, carId: string, skinId: string): string {
  return path.join(contentDir, 'cars', carId, 'skins', skinId, 'preview.jpg');
}

export async function fileExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}
