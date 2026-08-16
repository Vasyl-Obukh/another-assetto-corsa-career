// Reading settings tolerantly. Shared by main, which loads the file, and by the
// renderer, which applies patches optimistically before main confirms them.

import {
  isRecord, oneOf, readPaths, readWindow,
} from './utils.ts';
import { DEFAULT_SETTINGS, LANGUAGES, THEME_CHOICES } from '../../constants/index.ts';
import type { Settings } from '../../types/index.ts';

/**
 * Coerces whatever was on disk into valid settings.
 *
 * Never throws. Unknown or malformed fields fall back to their defaults field by
 * field, so one bad value does not discard the rest of the file.
 * @param raw The parsed contents of settings.json, or anything else
 * @returns Valid settings
 */
export const migrateSettings = (raw: unknown): Settings => {
  if (!isRecord(raw)) return structuredClone(DEFAULT_SETTINGS);

  return {
    version: 1,
    theme: oneOf(raw.theme, THEME_CHOICES, DEFAULT_SETTINGS.theme),
    language: oneOf(raw.language, LANGUAGES, DEFAULT_SETTINGS.language),
    paths: readPaths(raw.paths),
    window: readWindow(raw.window),
  };
};

/**
 * Merges a patch onto settings and re-validates the result.
 * @param current The settings to patch
 * @param patch The fields to replace
 * @returns The merged settings, validated
 */
export const applyPatch = (current: Settings, patch: Partial<Settings>): Settings => (
  migrateSettings({ ...current, ...patch })
);
