// Reading mod content leniently, and working out what has changed since last
// time. Mod authors ship malformed ui_*.json routinely, so every read here
// recovers rather than throwing - and says how it recovered, so a broken mod can
// be reported instead of silently becoming its own folder name.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  ARCMINUTES_PER_DEGREE,
  ARCSECONDS_PER_DEGREE,
  BARE_LENGTH_IS_KM_BELOW,
  MAX_TRACK_LENGTH_M,
  MAX_TRACK_WIDTH_M,
  MIN_TRACK_LENGTH_M,
  MIN_TRACK_WIDTH_M,
  SKINS_DIR,
  TRACKS_DIR,
  UI_CAR_FILE,
  UI_DIR,
  UI_SKIN_FILE,
  UI_TRACK_FILE,
} from './constants.ts';
import type { JsonRead, LooseJson, UiTrack } from './types.ts';
import { M_PER_KM, M_PER_MILE } from '../../shared/constants/index.ts';
import type { Track, WeatherFollow, WeatherRain } from '../../shared/types/index.ts';
import { trackProvenance } from '../content-catalogue/index.ts';
import type { IniSection } from '../ini/index.ts';
import {
  inRange, parseDecimalNumber, parseLooseNumber, specString,
} from '../loose-number/index.ts';

/**
 * Escapes raw newlines and tabs that sit inside a JSON string literal.
 *
 * Kunos' own ui_car.json files put unescaped newlines and tabs in `description`,
 * which is invalid JSON - every base-game car fails a strict parse. Stripping
 * them outright would run words together, so they are escaped in place, and only
 * inside strings, where they are the thing making the file invalid.
 * @param text The cleaned file contents
 * @returns The same text with in-string control characters escaped
 */
const escapeRawControls = (text: string): string => {
  let out = '';
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (escaped) {
      escaped = false;
      out += char;
    } else if (char === '\\') {
      escaped = inString;
      out += char;
    } else if (char === '"') {
      inString = !inString;
      out += char;
    } else if (inString && char === '\n') {
      out += '\\n';
    } else if (inString && char === '\t') {
      out += '\\t';
    } else {
      out += char;
    }
  }

  return out;
};

/**
 * JSON.parse, but tolerant of what mod authors actually ship.
 *
 * Strips a BOM, carriage returns, stray control characters and trailing commas,
 * then repairs unescaped newlines and tabs inside strings. When the file is
 * still beyond repair it salvages just the name, since that is enough to list
 * the entry rather than hide it.
 * @param text The raw file contents
 * @returns The parsed value, and whether it had to fall back to the name alone
 */
export const looseJson = <T>(text: string): LooseJson<T> => {
  const cleaned = text
    .replace(/^﻿/, '')
    .replace(/\r/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/,\s*([}\]])/g, '$1');

  try {
    return { value: JSON.parse(cleaned) as T, salvaged: false };
  } catch { /* the cheap path failed; try repairing the file */ }

  try {
    return { value: JSON.parse(escapeRawControls(cleaned)) as T, salvaged: false };
  } catch {
    // Last resort for files with broken encodings: salvage just the name.
    const name = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(cleaned);
    if (name?.[1] === undefined) return { value: null, salvaged: false };

    return { value: { name: name[1] } as T, salvaged: true };
  }
};

/**
 * Reads and leniently parses a JSON file.
 * @param file Absolute path to the file
 * @returns The parse outcome, with error set when the file could not be read
 */
export const readJsonFile = async <T>(file: string): Promise<JsonRead<T>> => {
  let text: string;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    return { value: null, salvaged: false, error: (error as Error).message };
  }

  return { ...looseJson<T>(text), error: null };
};

/**
 * Lists the subdirectory names of a folder.
 * @param dir Absolute path to the folder
 * @returns The subdirectory names, or an empty array when the folder is unreadable
 */
export const listDirs = async (dir: string): Promise<string[]> => {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
};

/**
 * Runs an async function over every item, a bounded number at a time.
 *
 * Order is preserved, so callers can keep sorting the result as they did with
 * Promise.all. Module-internal for now; the moment a second module wants it, it
 * should move to src/shared/utils/ rather than being copied.
 * @param items What to map over
 * @param limit How many may be in flight at once
 * @param fn Called with each item and its index
 * @returns The results, in the order the items came in
 */
export const mapLimit = async <T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async (): Promise<void> => {
    const index = next;
    next += 1;
    if (index < items.length) {
      results[index] = await fn(items[index], index);
      await worker();
    }
  };

  const workers = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workers }, worker));

  return results;
};

/**
 * Stamps a file by modification time and size.
 *
 * Size comes free from the same stat and catches a file copied over another with
 * its timestamp preserved, which mod installers do.
 * @param file Absolute path to the file
 * @returns The stamp, or an empty string when the file is not there
 */
const fileStamp = async (file: string): Promise<string> => {
  try {
    const stats = await stat(file);
    return `${stats.mtimeMs}:${stats.size}`;
  } catch {
    return '';
  }
};

/**
 * Stamps a directory by modification time, which moves when its entries do.
 * @param dir Absolute path to the directory
 * @returns The stamp, or an empty string when the directory is not there
 */
const dirStamp = async (dir: string): Promise<string> => {
  try {
    return String((await stat(dir)).mtimeMs);
  } catch {
    return '';
  }
};

/**
 * Fingerprints one car and every livery it ships, so an unchanged one need not
 * be read again.
 *
 * The ui files are stamped rather than their folders: a folder's mtime moves
 * only when entries are added or removed, not when a mod author saves over
 * ui_car.json or a ui_skin.json. Skins are sorted first, for the reason
 * fingerprintTrack records below.
 * @param carsDir The content/cars directory
 * @param id Car folder name
 * @param skins The livery folder names this car is known to have
 * @returns A fingerprint to compare against the one the last scan recorded
 */
export const fingerprintCar = async (
  carsDir: string,
  id: string,
  skins: readonly string[],
): Promise<string> => {
  const skinsDir = path.join(carsDir, id, SKINS_DIR);
  const ordered = [...skins].sort();

  const [ui, dir, ...nested] = await Promise.all([
    fileStamp(path.join(carsDir, id, UI_DIR, UI_CAR_FILE)),
    dirStamp(skinsDir),
    ...ordered.map((skin) => fileStamp(path.join(skinsDir, skin, UI_SKIN_FILE))),
  ]);

  const parts = ordered.map((skin, index) => `${skin}=${nested[index]}`);

  return [ui, dir, ...parts].join('|');
};

/**
 * Fingerprints one track and all of its layouts.
 *
 * The ui folder's own stamp covers layouts appearing and disappearing, so an
 * unmoved one means the layout list cannot have changed. Layouts are sorted
 * first: a fresh scan finds them in readdir order and a revalidation in display
 * order, and encoding those differently made every multi-layout track look
 * changed on every scan.
 * @param contentDir The AC content directory
 * @param id Track folder name
 * @param layouts The layout folder names this track is known to have
 * @returns A fingerprint to compare against the one the last scan recorded
 */
export const fingerprintTrack = async (
  contentDir: string,
  id: string,
  layouts: readonly string[],
): Promise<string> => {
  const uiDir = path.join(contentDir, TRACKS_DIR, id, UI_DIR);
  const ordered = [...layouts].sort();

  const [dir, root, ...nested] = await Promise.all([
    dirStamp(uiDir),
    fileStamp(path.join(uiDir, UI_TRACK_FILE)),
    ...ordered.map((layout) => fileStamp(path.join(uiDir, layout, UI_TRACK_FILE))),
  ]);

  const parts = ordered.map((layout, index) => `${layout}=${nested[index]}`);

  return [dir, root, ...parts].join('|');
};

/**
 * Reads a ui_* string field, treating blank as absent.
 *
 * A quarter of liveries ship an empty skinname and most of the rest of the
 * fields blank, so "" and "missing" have to mean the same thing.
 * @param value The raw field, which may be anything at all
 * @returns The trimmed string, or null when there is nothing in it
 */
export const trimmed = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const text = value.trim();

  return text === '' ? null : text;
};

/**
 * Reads a livery's racing number.
 *
 * Kept as a string, since a leading zero is meaningful on a car - AC ships
 * `"number": 06` and it means 06, not 6. "0" is the value AC's own template
 * writes for a livery that carries no number at all, so it reads as absent
 * rather than as car zero.
 * @param value The raw number field, written as a string or a number
 * @returns The number as written, or null when the livery carries none
 */
export const skinNumber = (value: unknown): string | null => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();

  return text === '' || text === '0' ? null : text;
};

/**
 * Converts one of AC's geotag strings to decimal degrees.
 *
 * They come in two shapes: `52° 50′ 50″ N` and plain `52.8472`.
 * @param value The raw geotag, which may be anything at all
 * @returns Decimal degrees, negative for south and west, or null when unreadable
 */
export const parseGeotag = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;

  const dms = /^\s*(-?[\d.]+)\s*[°d]\s*(?:([\d.]+)\s*[′'′]\s*)?(?:([\d.]+)\s*[″"”]\s*)?([NSEW])?/i.exec(value);
  if (dms?.[1] !== undefined) {
    const degrees = parseFloat(dms[1]);
    const minutes = parseFloat(dms[2] ?? '0');
    const seconds = parseFloat(dms[3] ?? '0');
    const decimal = Math.abs(degrees)
      + minutes / ARCMINUTES_PER_DEGREE
      + seconds / ARCSECONDS_PER_DEGREE;
    return degrees < 0 || /[SW]/i.test(dms[4] ?? '') ? -decimal : decimal;
  }

  const plain = parseFloat(value);
  return Number.isFinite(plain) ? plain : null;
};

/**
 * Reads a lap length out of whatever the author wrote, always as metres.
 *
 * The unit is the whole difficulty. ui_track.json carries "5793", "5.793",
 * "20,832", "4.5 km" and "2.2 miles" for the same kind of field, and the
 * separator rule in loose-number already turns "5.793" and "20,832" into metres
 * for us. What is left is a small bare number, which can only be kilometres.
 * @param value The raw ui_track.json length value
 * @returns Length in metres, or null when it could not be read
 */
export const parseTrackLength = (value: unknown): number | null => {
  const text = specString(value) ?? '';
  const km = /km(?![a-z])/i.test(text);
  const miles = /mi(?:le)?s?(?![a-z])/i.test(text);

  // A written unit settles the separator too: "13.626km" is Le Mans, not
  // thirteen thousand kilometres. A bare figure keeps the thousands rule, which
  // is what makes "20,832" and "5.793" both come out as metres.
  const number = km || miles ? parseDecimalNumber(value) : parseLooseNumber(value);
  if (number === null) return null;

  let metres = number;
  if (miles) metres = number * M_PER_MILE;
  else if (km || number < BARE_LENGTH_IS_KM_BELOW) metres = number * M_PER_KM;

  return inRange(metres, MIN_TRACK_LENGTH_M, MAX_TRACK_LENGTH_M);
};

/**
 * Reads a track width, which authors write in metres and nothing else.
 * @param value The raw ui_track.json width value
 * @returns Width in metres, or null when it could not be read
 */
export const parseTrackWidth = (value: unknown): number | null => (
  inRange(parseLooseNumber(value), MIN_TRACK_WIDTH_M, MAX_TRACK_WIDTH_M)
);

/**
 * Builds a track entry from one parsed ui_track.json.
 * @param id Track folder name
 * @param layout Layout folder name, or an empty string for single-layout tracks
 * @param ui The parsed ui_track.json
 * @returns The track, with anything unreadable left null
 */
export const makeTrack = (id: string, layout: string, ui: UiTrack): Track => {
  const [lat, lon] = Array.isArray(ui.geotags) ? ui.geotags : [];
  const pitboxes = parseInt(String(ui.pitboxes), 10);

  return {
    id,
    layout,
    key: layout ? `${id}/${layout}` : id,
    name: ui.name ?? id,
    country: ui.country ?? null,
    pitboxes: Number.isFinite(pitboxes) ? pitboxes : null,
    lengthM: parseTrackLength(ui.length),
    widthM: parseTrackWidth(ui.width),
    geotags: { lat: parseGeotag(lat), lon: parseGeotag(lon) },
    provenance: trackProvenance(id, layout),
  };
};

/**
 * Reads a weather controller's follow flag.
 *
 * Three answers rather than two, because the flag is not always a literal: PURE
 * and Live write `FOLLOWS_SELECTED_TEMPERATURE = not SETTINGS/REAL_TEMPERATURE`,
 * a query into their own settings. Reporting that as "depends" beats guessing,
 * which would be a silent wrong-weather bug. An absent flag is "yes", which is
 * how the CSP-shipped controllers declare that they follow the race.
 * @param value The raw manifest value, or undefined when the key is absent
 * @returns Whether the controller honours what the race asked for
 */
export const parseFollows = (value: string | undefined): WeatherFollow => {
  if (value === undefined) return 'yes';

  const trimmedValue = value.trim();
  if (trimmedValue === '0') return 'no';
  if (trimmedValue === '1' || trimmedValue === '') return 'yes';

  return 'depends';
};

/**
 * Reads a `[RAINFX]` section into rain figures.
 * @param section The section, or undefined when the preset carries none
 * @returns The figures, or null when there is no section to read
 */
export const parseRain = (section: IniSection | undefined): WeatherRain | null => {
  if (!section) return null;

  return {
    intensity: parseFloat(section.INTENSITY ?? '0') || 0,
    wetness: parseFloat(section.WETNESS ?? '0') || 0,
    water: parseFloat(section.WATER ?? '0') || 0,
  };
};
