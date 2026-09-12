// Settings persistence in the user data folder. Writes are atomic and debounced;
// reads are tolerant, because a settings file that has been corrupted or
// hand-edited must never be the reason the app refuses to open.

import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SETTINGS_FILE, WRITE_DEBOUNCE_MS } from './constants.ts';
import type { SettingsStore } from './types.ts';
import { quarantine } from './utils.ts';
import { DEFAULT_SETTINGS } from '../../shared/constants/index.ts';
import type { Settings } from '../../shared/types/index.ts';
import { applyPatch, readSettings } from '../../shared/utils/settings/index.ts';

export type { SettingsStore } from './types.ts';

/**
 * Loads the settings file and returns a store over it.
 * @param userDataDir Folder to keep settings.json in
 * @returns A store holding the loaded settings, or the defaults when none loaded
 */
export const createSettingsStore = async (userDataDir: string): Promise<SettingsStore> => {
  const file = path.join(userDataDir, SETTINGS_FILE);
  const tmp = `${file}.tmp`;

  let current: Settings;
  try {
    const text = await readFile(file, 'utf8');
    current = readSettings(JSON.parse(text));
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    if (!missing) {
      const moved = await quarantine(file);
      console.warn(`Settings file was unreadable; ${moved ? `moved to ${moved}` : 'ignoring it'}.`, error);
    }
    current = structuredClone(DEFAULT_SETTINGS);
  }

  const listeners = new Set<(settings: Settings) => void>();
  let timer: NodeJS.Timeout | null = null;
  let pending: Promise<void> = Promise.resolve();

  const write = async (): Promise<void> => {
    const snapshot = JSON.stringify(current, null, 2);
    try {
      await writeFile(tmp, snapshot, 'utf8');
      await rename(tmp, file);
    } catch (error) {
      console.error('Could not save settings.', error);
    }
  };

  const schedule = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      pending = write();
    }, WRITE_DEBOUNCE_MS);
  };

  return {
    get: () => current,

    patch(next) {
      current = applyPatch(current, next);
      schedule();
      for (const listener of listeners) listener(current);
      return current;
    },

    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        pending = write();
      }
      await pending;
    },

    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
