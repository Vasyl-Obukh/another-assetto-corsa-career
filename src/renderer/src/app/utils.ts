import { createContext, useContext } from 'react';

import type { SettingsContextValue } from './types.ts';

/**
 * Holds the settings for the whole renderer. Null until a provider mounts.
 */
export const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Reads the settings context.
 * @returns The settings and the patch function
 * @throws When called outside a SettingsProvider
 */
export const useSettings = (): SettingsContextValue => {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');

  return value;
};
