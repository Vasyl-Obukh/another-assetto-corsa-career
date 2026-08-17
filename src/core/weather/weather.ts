// Career weather presets, installed into AC's content folder as ordinary
// weathers (so they show up in Content Manager's list too).
//
// Each carries a [RAINFX] section. PURE's controller reads those values
// directly and skips preset_rain() entirely, making rain deterministic instead
// of dependent on how the controller resolves a weather type. None of AC's
// shipped weathers have that section.

import {
  mkdir, readdir, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { CAREER_WEATHERS } from './constants.ts';
import { weatherIniFor } from './utils.ts';

export type { WeatherPreset } from './types.ts';
export { CAREER_WEATHERS } from './constants.ts';

/**
 * Installs every career weather into AC's content folder. Idempotent.
 * @param contentDir The AC content directory
 * @returns The IDs that were installed
 */
export const installCareerWeathers = async (contentDir: string): Promise<string[]> => {
  await Promise.all(CAREER_WEATHERS.map(async (preset) => {
    const dir = path.join(contentDir, 'weather', preset.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'weather.ini'), weatherIniFor(preset));
  }));

  return CAREER_WEATHERS.map((preset) => preset.id);
};

/**
 * Removes the career weathers again. Only touches folders this app created.
 * @param contentDir The AC content directory
 * @returns The IDs that were actually present and have been removed
 */
export const removeCareerWeathers = async (contentDir: string): Promise<string[]> => {
  const ids = new Set(CAREER_WEATHERS.map((preset) => preset.id));
  const present = (await readdir(path.join(contentDir, 'weather'))).filter((id) => ids.has(id));

  await Promise.all(present.map((id) => rm(path.join(contentDir, 'weather', id), {
    recursive: true,
    force: true,
  })));

  return present;
};
