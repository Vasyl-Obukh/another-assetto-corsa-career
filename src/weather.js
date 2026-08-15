// Career weather presets, installed into AC's content folder as ordinary
// weathers (so they show up in Content Manager's list too).
//
// Each carries a [RAINFX] section. PURE's controller reads those values
// directly and skips preset_rain() entirely, making rain deterministic instead
// of dependent on how the controller resolves a weather type. None of AC's
// shipped weathers have that section.

import { writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { writeIni } from './ini.js';

// Rain values are taken verbatim from PURE's defaults table
// (apps/lua/PurePlanner/settings/settings_defaults.lua) rather than invented.
export const CAREER_WEATHERS = [
  { id: 'career_clear', name: 'Career - Clear', type: 15, intensity: 0, wetness: 0, water: 0, coeff: 1, cover: 0 },
  { id: 'career_overcast', name: 'Career - Overcast', type: 19, intensity: 0, wetness: 0, water: 0, coeff: 0.01, cover: 0.9 },
  { id: 'career_light_rain', name: 'Career - Light Rain', type: 6, intensity: 0.05, wetness: 0.05, water: 0.3, coeff: -0.2, cover: 0.9 },
  { id: 'career_rain', name: 'Career - Rain', type: 7, intensity: 0.125, wetness: 0.125, water: 0.6, coeff: -0.2, cover: 0.95 },
  { id: 'career_heavy_rain', name: 'Career - Heavy Rain', type: 8, intensity: 0.6, wetness: 0.6, water: 1.0, coeff: -0.5, cover: 1 },
  { id: 'career_thunderstorm', name: 'Career - Thunderstorm', type: 1, intensity: 0.2, wetness: 0.15, water: 0.4, coeff: -0.3, cover: 1 },
];

function weatherIniFor(preset) {
  return writeIni({
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
      AUTHOR: 'AC Career Mode',
      TIME_DIAPASON: '00:00-23:59',
    },
    RAINFX: {
      INTENSITY: preset.intensity,
      WETNESS: preset.wetness,
      WATER: preset.water,
    },
  });
}

/** Install every career weather into AC's content folder. Idempotent. */
export async function installCareerWeathers(contentDir) {
  const installed = [];
  for (const preset of CAREER_WEATHERS) {
    const dir = path.join(contentDir, 'weather', preset.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'weather.ini'), weatherIniFor(preset));
    installed.push({ id: preset.id, dir });
  }
  return installed;
}

/** Remove them again. Only touches folders this app created. */
export async function removeCareerWeathers(contentDir) {
  const removed = [];
  const ids = new Set(CAREER_WEATHERS.map((p) => p.id));
  for (const id of await readdir(path.join(contentDir, 'weather'))) {
    if (!ids.has(id)) continue;
    await rm(path.join(contentDir, 'weather', id), { recursive: true, force: true });
    removed.push(id);
  }
  return removed;
}
