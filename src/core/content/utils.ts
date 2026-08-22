// Reading mod content leniently, and working out what has changed since last
// time. Mod authors ship malformed ui_*.json routinely, so every read here
// recovers rather than throwing - and says how it recovered, so a broken mod can
// be reported instead of silently becoming its own folder name.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  ARCMINUTES_PER_DEGREE,
  ARCSECONDS_PER_DEGREE,
  SKINS_DIR,
  TRACKS_DIR,
  UI_CAR_FILE,
  UI_DIR,
  UI_TRACK_FILE,
} from './constants.ts';
import type { JsonRead, LooseJson, UiTrack } from './types.ts';
import type { Track } from '../../shared/types/index.ts';
import { trackProvenance } from '../content-catalogue/index.ts';

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
 * Fingerprints one car, so an unchanged one need not be read again.
 *
 * The ui file is stamped rather than its folder, because a folder's mtime moves
 * only when its entries are added or removed - not when a mod author saves over
 * ui_car.json, which is the commonest update there is.
 * @param carsDir The content/cars directory
 * @param id Car folder name
 * @returns A fingerprint to compare against the one the last scan recorded
 */
export const fingerprintCar = async (carsDir: string, id: string): Promise<string> => {
  const [ui, skins] = await Promise.all([
    fileStamp(path.join(carsDir, id, UI_DIR, UI_CAR_FILE)),
    dirStamp(path.join(carsDir, id, SKINS_DIR)),
  ]);

  return `${ui}|${skins}`;
};

/**
 * Fingerprints one track and all of its layouts.
 *
 * The ui folder's own stamp covers layouts appearing and disappearing, so when
 * it has not moved the layout list cannot have changed - which is what lets a
 * track be revalidated without listing its directory again.
 *
 * Layouts are sorted before stamping. A fresh scan discovers them in readdir
 * order while a later one reads them back off entries sorted by display name,
 * and encoding those two orders differently made every multi-layout track look
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
    geotags: { lat: parseGeotag(lat), lon: parseGeotag(lon) },
    provenance: trackProvenance(id, layout),
  };
};
