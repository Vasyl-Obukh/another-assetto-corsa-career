// Career weather presets, installed into AC's content folder as ordinary
// weathers (so they show up in Content Manager's list too).
//
// Each carries a [RAINFX] section, which no shipped weather has. PURE's
// controller reads those values directly and skips preset_rain(), which is what
// makes rain deterministic rather than dependent on how a controller resolves a
// weather type.

import {
  mkdir, readdir, readFile, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  CAREER_WEATHERS, CSP_CONFIG_DIR, QUOTES, RAIN_FX_FILE, WEATHER_FX_FILE,
} from './constants.ts';
import { readIniValue, weatherIniFor } from './utils.ts';
import type { WeatherFxState } from '../../shared/types/index.ts';
import { parseIni } from '../ini/index.ts';

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

/**
 * Reads which weather controller the user's own CSP settings name.
 *
 * This is what renders a race we do not override, and knowing it is the
 * difference between a warning and a silent wrong-weather bug: a static weather
 * chosen under a dynamic controller is simply ignored. Tolerant, since the file
 * is the user's: anything unreadable or absent is null, meaning "we do not know".
 * @param documentsDir The Documents\Assetto Corsa folder
 * @returns The controller folder ID, or null when it could not be read
 */
export const readWeatherFxController = async (documentsDir: string): Promise<string | null> => {
  let text: string;
  try {
    text = await readFile(path.join(documentsDir, WEATHER_FX_FILE), 'utf8');
  } catch {
    // No CSP settings written yet, or no CSP at all.
    return null;
  }

  // CSP quotes the value - CONTROLLER='pureCtrl static' - and the reader keeps
  // the quotes, since AC's own files never use them.
  const raw = parseIni(text).BASIC?.CONTROLLER?.replace(QUOTES, '').trim();

  return raw ? raw : null;
};

/**
 * Whether CSP's weather and rain modules are switched on.
 *
 * Both are separate from the controller, and either being off makes a race run
 * in weather nobody asked for: WeatherFX off runs no controller at all, RainFX
 * off never draws rain however wet the weather says it is. Neither reports
 * itself anywhere, which is why the setup screen has to. A module is on unless
 * something says otherwise, so an unreadable file reads as enabled.
 * @param acRoot The AC install root, holding the shipped defaults
 * @param documentsDir The AC Documents folder, holding the user's own overrides
 * @returns Whether each module is enabled
 */
export const readWeatherFx = async (
  acRoot: string,
  documentsDir: string,
): Promise<WeatherFxState> => {
  /**
   * Reads one module's ENABLED flag, the user's copy winning over the shipped one.
   * @param shipped Path to the file under the AC root
   * @param override Path to the user's own copy
   * @returns Whether that module is enabled
   */
  const enabled = async (shipped: string, override: string): Promise<boolean> => {
    for (const file of [override, shipped]) {
      const value = await readIniValue(file, 'BASIC', 'ENABLED');
      if (value !== null) return value !== '0';
    }

    return true;
  };

  return {
    weatherFx: await enabled(
      path.join(acRoot, CSP_CONFIG_DIR, 'weather_fx.ini'),
      path.join(documentsDir, WEATHER_FX_FILE),
    ),
    rainFx: await enabled(
      path.join(acRoot, CSP_CONFIG_DIR, 'rain_fx.ini'),
      path.join(documentsDir, RAIN_FX_FILE),
    ),
  };
};
