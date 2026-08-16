// Reading mod content leniently. Mod authors ship malformed ui_*.json
// routinely, so every read here recovers rather than throwing.

import { readdir, readFile } from 'node:fs/promises';

import { ARCMINUTES_PER_DEGREE, ARCSECONDS_PER_DEGREE } from './constants.ts';
import type { UiTrack } from './types.ts';
import type { Track } from '../../shared/types/index.ts';

/**
 * JSON.parse, but tolerant of what mod authors actually ship.
 *
 * Strips a BOM, carriage returns, stray control characters and trailing commas.
 * When the file is beyond repair it salvages just the name, since that is enough
 * to list the entry rather than hide it.
 * @param text The raw file contents
 * @returns The parsed object, a name-only stand-in, or null when nothing survived
 */
export const looseJson = <T>(text: string): T | null => {
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
};

/**
 * Reads and leniently parses a JSON file.
 * @param file Absolute path to the file
 * @returns The parsed contents, or null when the file could not be read at all
 */
export const readJsonFile = async <T>(file: string): Promise<T | null> => {
  try {
    return looseJson<T>(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
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
  };
};
