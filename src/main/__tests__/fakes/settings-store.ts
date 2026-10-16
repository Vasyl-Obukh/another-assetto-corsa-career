import { fake } from './fake.ts';
import { DEFAULT_SETTINGS } from '../../../shared/constants/index.ts';
import type { Settings } from '../../../shared/types/index.ts';
import { applyPatch } from '../../../shared/utils/settings/index.ts';
import type { SettingsStore } from '../../settings-store/index.ts';

/**
 * A settings store held in memory: the defaults, with whatever the test sets.
 * @param over What the test wants set differently from the defaults
 * @returns The store
 */
export const fakeSettingsStore = (over: Partial<Settings> = {}): SettingsStore => {
  let settings: Settings = { ...DEFAULT_SETTINGS, ...over };

  return fake<SettingsStore>('settings', {
    get: () => settings,
    patch: (patch) => {
      settings = applyPatch(settings, patch);

      return settings;
    },
    flush: async () => {},
    onChange: () => () => false,
  });
};
