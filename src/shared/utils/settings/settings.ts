// Reading settings tolerantly. Shared by main, which loads the file, and by the
// renderer, which applies patches optimistically before main confirms them.
//
// Every coercion here takes unknown and returns something valid, because the
// file may have been hand edited into nonsense and that must not stop the app
// opening.

import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from './constants.ts';
import {
  DEFAULT_ALLOWED_WEATHER,
  DEFAULT_SETTINGS,
  DRIVING_AID_FLAGS,
  DRIVING_AID_NUMBERS,
  LANGUAGES,
  THEME_CHOICES,
  WEATHER_SYSTEMS,
  WEATHER_TYPE_ORDER,
} from '../../constants/index.ts';
import type { WeatherType } from '../../constants/index.ts';
import type {
  AddedContent, DrivingAids, PathOverrides, Settings, WindowState,
} from '../../types/index.ts';
import { isRecord, memberOf } from '../coerce/index.ts';

/**
 * Reads a trimmed, non-empty string. A blank override means "unset".
 * @param value The value to read
 * @returns The trimmed string, or undefined when it is not a usable one
 */
export const cleanString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * Reads a value that must be one of a closed set.
 * @param value The value to read
 * @param allowed Every acceptable value
 * @param fallback Returned when the value is not one of them
 * @returns The value if allowed, otherwise the fallback
 */
export const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => (
  allowed.includes(value as T) ? value as T : fallback
);

/**
 * Reads a finite number, rejecting NaN and the infinities.
 * @param value The value to read
 * @returns The number, or undefined when it is not a finite one
 */
export const finiteNumber = (value: unknown): number | undefined => (
  typeof value === 'number' && Number.isFinite(value) ? value : undefined
);

/**
 * Reads persisted path overrides, dropping any that are blank.
 * @param raw The value read from disk
 * @returns Overrides containing only the keys that held a usable path
 */
export const readPaths = (raw: unknown): PathOverrides => {
  if (!isRecord(raw)) return {};

  const contentManager = cleanString(raw.contentManager);
  const acRoot = cleanString(raw.acRoot);
  const documents = cleanString(raw.documents);

  return {
    ...(contentManager ? { contentManager } : {}),
    ...(acRoot ? { acRoot } : {}),
    ...(documents ? { documents } : {}),
  };
};

/**
 * Reads a list of folder IDs, dropping anything that is not a usable one.
 * @param raw The value read from disk
 * @returns The IDs, each once, sorted so the file diffs cleanly
 */
const readIds = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];

  const ids = raw.map(cleanString).filter((id): id is string => id !== undefined);
  return [...new Set(ids)].sort();
};

/**
 * Reads the content the user added to the library themselves.
 * @param raw The value read from disk
 * @returns Both lists, empty where nothing usable was there
 */
export const readAddedContent = (raw: unknown): AddedContent => {
  if (!isRecord(raw)) return { cars: [], tracks: [] };

  return { cars: readIds(raw.cars), tracks: readIds(raw.tracks) };
};

/**
 * Reads the weather types the user lets into the sim.
 *
 * Anything that is not a list falls back to the default rather than to nothing,
 * since a sim with no weather allowed cannot race. An empty list is honoured -
 * the settings screen never writes one, so it was put there by hand.
 * @param raw The value read from disk
 * @returns Every allowed type once, in menu order
 */
export const readAllowedWeather = (raw: unknown): WeatherType[] => {
  if (!Array.isArray(raw)) return [...DEFAULT_ALLOWED_WEATHER];

  const allowed = new Set(raw.map((value) => memberOf(value, WEATHER_TYPE_ORDER)));
  return WEATHER_TYPE_ORDER.filter((type) => allowed.has(type));
};

/**
 * Reads an optional boolean, treating anything that is not a boolean as absent.
 * @param value The value to read
 * @returns The boolean, or undefined when there was not one
 */
export const optionalBoolean = (value: unknown): boolean | undefined => (
  typeof value === 'boolean' ? value : undefined
);

/**
 * Reads the persisted driving aids, dropping anything malformed.
 *
 * Absent rather than defaulted, field by field: an aid nobody has chosen has to
 * stay distinguishable from one deliberately set to what Assetto Corsa ships,
 * because a race may only override what the player actually asked for.
 * @param raw The value read from disk
 * @returns Aids containing only the keys that held a usable value
 */
export const readDrivingAids = (raw: unknown): DrivingAids => {
  if (!isRecord(raw)) return {};

  const aids: DrivingAids = {};

  DRIVING_AID_FLAGS.forEach((key) => {
    const value = optionalBoolean(raw[key]);
    if (value !== undefined) aids[key] = value;
  });
  DRIVING_AID_NUMBERS.forEach((key) => {
    const value = finiteNumber(raw[key]);
    if (value !== undefined) aids[key] = value;
  });

  return aids;
};

/**
 * Reads persisted window geometry, clamped to a usable size.
 * @param raw The value read from disk
 * @returns Valid window state, falling back to the defaults field by field
 */
export const readWindow = (raw: unknown): WindowState => {
  const fallback = DEFAULT_SETTINGS.window;
  if (!isRecord(raw)) return { ...fallback };

  // A window smaller than this is unusable however it got into the file.
  const width = Math.max(MIN_WINDOW_WIDTH, Math.round(finiteNumber(raw.width) ?? fallback.width));
  const height = Math.max(MIN_WINDOW_HEIGHT, Math.round(finiteNumber(raw.height) ?? fallback.height));
  const x = finiteNumber(raw.x);
  const y = finiteNumber(raw.y);

  return {
    width,
    height,
    ...(x === undefined ? {} : { x: Math.round(x) }),
    ...(y === undefined ? {} : { y: Math.round(y) }),
    maximized: raw.maximized === true,
  };
};

/**
 * Coerces whatever was on disk into valid settings.
 *
 * Never throws. Unknown or malformed fields fall back to their defaults field by
 * field, so one bad value does not discard the rest of the file.
 *
 * A tolerant reader rather than a migration: nothing branches on the incoming
 * version. It earns its keep because settings.json may reasonably be hand-edited.
 * @param raw The parsed contents of settings.json, or anything else
 * @returns Valid settings
 */
export const readSettings = (raw: unknown): Settings => {
  if (!isRecord(raw)) return structuredClone(DEFAULT_SETTINGS);

  const setupCompletedAt = cleanString(raw.setupCompletedAt);
  const driverName = cleanString(raw.driverName);

  return {
    version: 1,
    theme: oneOf(raw.theme, THEME_CHOICES, DEFAULT_SETTINGS.theme),
    language: oneOf(raw.language, LANGUAGES, DEFAULT_SETTINGS.language),
    weatherSystem: oneOf(raw.weatherSystem, WEATHER_SYSTEMS, DEFAULT_SETTINGS.weatherSystem),
    allowedWeather: readAllowedWeather(raw.allowedWeather),
    // Absent rather than empty, so clearing the field means "let Assetto Corsa
    // decide" rather than racing under a blank name.
    ...(driverName ? { driverName } : {}),
    drivingAids: readDrivingAids(raw.drivingAids),
    addedContent: readAddedContent(raw.addedContent),
    paths: readPaths(raw.paths),
    window: readWindow(raw.window),
    // Absent rather than empty, so "have they set up?" is a presence check.
    ...(setupCompletedAt ? { setupCompletedAt } : {}),
  };
};

/**
 * Merges a patch onto settings and re-validates the result.
 * @param current The settings to patch
 * @param patch The fields to replace
 * @returns The merged settings, validated
 */
export const applyPatch = (current: Settings, patch: Partial<Settings>): Settings => (
  readSettings({ ...current, ...patch })
);
