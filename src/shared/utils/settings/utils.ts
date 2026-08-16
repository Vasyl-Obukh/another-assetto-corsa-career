// Coercion helpers for reading settings off disk. Every one of these takes
// unknown and returns something valid, because the file may have been hand
// edited into nonsense and that must not stop the app opening.

import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from './constants.ts';
import { DEFAULT_SETTINGS } from '../../constants/index.ts';
import type { PathOverrides, WindowState } from '../../types/index.ts';

/**
 * Narrows a value to a plain object, excluding arrays and null.
 * @param value The value to test
 * @returns True when the value is a plain object
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

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
