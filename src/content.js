// Scanning installed content. Car and track IDs are just folder names, so mods
// need no special handling -- but mod authors ship malformed ui_*.json
// routinely, so reads are lenient and failures skip the entry.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseIni } from './ini.js';

/** JSON.parse, but tolerant of what mod authors actually ship. */
export function looseJson(text) {
  const cleaned = text
    .replace(/^﻿/, '')          // BOM
    .replace(/\r/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')  // stray control characters
    .replace(/,\s*([}\]])/g, '$1');  // trailing commas

  try {
    return JSON.parse(cleaned);
  } catch {
    // Last resort for files with broken encodings: salvage just the name.
    const name = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(cleaned);
    return name ? { name: name[1] } : null;
  }
}

async function readJsonFile(file) {
  try {
    return looseJson(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function listDirs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Convert AC's geotag strings to decimal degrees.
 * They come in two shapes: `52° 50′ 50″ N` and plain `52.8472`.
 */
export function parseGeotag(value) {
  if (typeof value !== 'string') return null;

  const dms = /^\s*(-?[\d.]+)\s*[°d]\s*(?:([\d.]+)\s*[′'′]\s*)?(?:([\d.]+)\s*[″"”]\s*)?([NSEW])?/i.exec(value);
  if (dms) {
    const [, deg, min = '0', sec = '0', hemi] = dms;
    let decimal = Math.abs(parseFloat(deg)) + parseFloat(min) / 60 + parseFloat(sec) / 3600;
    if (parseFloat(deg) < 0 || /[SW]/i.test(hemi ?? '')) decimal = -decimal;
    return decimal;
  }

  const plain = parseFloat(value);
  return Number.isFinite(plain) ? plain : null;
}

/** All installed cars: { id, name, brand, skins[] }. */
export async function scanCars(contentDir) {
  const carsDir = path.join(contentDir, 'cars');
  const cars = [];

  for (const id of await listDirs(carsDir)) {
    if (id.startsWith('.')) continue;
    const ui = await readJsonFile(path.join(carsDir, id, 'ui', 'ui_car.json'));
    const skins = await listDirs(path.join(carsDir, id, 'skins'));
    // No ui_car.json is unusual but not fatal -- AC still loads the car.
    cars.push({
      id,
      name: ui?.name ?? id,
      brand: ui?.brand ?? null,
      tags: Array.isArray(ui?.tags) ? ui.tags : [],
      skins,
    });
  }
  return cars.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * All installed tracks. Multi-layout tracks appear once per layout, because
 * that is the granularity race.ini works at (TRACK + CONFIG_TRACK).
 */
export async function scanTracks(contentDir) {
  const tracksDir = path.join(contentDir, 'tracks');
  const tracks = [];

  for (const id of await listDirs(tracksDir)) {
    if (id.startsWith('.')) continue;
    const uiDir = path.join(tracksDir, id, 'ui');

    // Single-layout tracks put ui_track.json directly in ui/.
    const root = await readJsonFile(path.join(uiDir, 'ui_track.json'));
    if (root) {
      tracks.push(makeTrack(id, '', root));
      continue;
    }

    for (const layout of await listDirs(uiDir)) {
      const ui = await readJsonFile(path.join(uiDir, layout, 'ui_track.json'));
      if (ui) tracks.push(makeTrack(id, layout, ui));
    }
  }
  return tracks.sort((a, b) => a.name.localeCompare(b.name));
}

function makeTrack(id, layout, ui) {
  const [lat, lon] = Array.isArray(ui.geotags) ? ui.geotags : [];
  const pitboxes = parseInt(ui.pitboxes, 10);
  return {
    id,
    layout,
    // The key used everywhere else in the app, and in results matching.
    key: layout ? `${id}/${layout}` : id,
    name: ui.name ?? id,
    country: ui.country ?? null,
    // Grid size ceiling. Exceeding it makes AC drop cars or fail to load.
    pitboxes: Number.isFinite(pitboxes) ? pitboxes : null,
    geotags: { lat: parseGeotag(lat), lon: parseGeotag(lon) },
  };
}

/**
 * All installed weathers, with the CSP weather type read straight out of each
 * weather.ini rather than a hardcoded table -- which is how Content Manager
 * itself gets it, and means mod weathers work without any extra mapping.
 */
export async function scanWeather(contentDir) {
  const weatherDir = path.join(contentDir, 'weather');
  const weathers = [];

  for (const id of await listDirs(weatherDir)) {
    if (id.startsWith('.')) continue;
    let ini;
    try {
      ini = parseIni(await readFile(path.join(weatherDir, id, 'weather.ini'), 'utf8'));
    } catch {
      continue;
    }
    const type = ini.__LAUNCHER_CM?.WEATHER_TYPE;
    weathers.push({
      id,
      name: ini.LAUNCHER?.NAME ?? id,
      // Kunos weathers have no __LAUNCHER_CM section; CM infers their type from
      // the folder name. null here means "let CM decide".
      type: type === undefined ? null : parseInt(type, 10),
      temperatureCoeff: parseFloat(ini.LAUNCHER?.TEMPERATURE_COEFF ?? '0') || 0,
      author: ini.__LAUNCHER_CM?.AUTHOR ?? null,
    });
  }
  return weathers.sort((a, b) => a.id.localeCompare(b.id));
}

/** Installed CSP weather controllers, from extension/weather-controllers. */
export async function scanWeatherControllers(acRoot) {
  const dir = path.join(acRoot, 'extension', 'weather-controllers');
  const controllers = [];

  for (const id of await listDirs(dir)) {
    let ini = {};
    try {
      ini = parseIni(await readFile(path.join(dir, id, 'manifest.ini'), 'utf8'));
    } catch {
      // A controller without a manifest still works; the id is what matters.
    }
    controllers.push({
      id,
      name: ini.ABOUT?.NAME ?? id,
      author: ini.ABOUT?.AUTHOR ?? null,
      description: ini.ABOUT?.DESCRIPTION ?? null,
    });
  }
  return controllers;
}

/** Everything at once, for the scan command and for race validation. */
export async function scanContent(contentDir) {
  const acRoot = path.dirname(contentDir);
  const [cars, tracks, weather, controllers] = await Promise.all([
    scanCars(contentDir),
    scanTracks(contentDir),
    scanWeather(contentDir),
    scanWeatherControllers(acRoot),
  ]);
  return { cars, tracks, weather, controllers };
}

/** Preview image for a car skin, as an absolute path (may not exist). */
export function skinPreview(contentDir, carId, skinId) {
  return path.join(contentDir, 'cars', carId, 'skins', skinId, 'preview.jpg');
}

export async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}
