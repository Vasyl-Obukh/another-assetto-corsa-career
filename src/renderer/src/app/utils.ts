import { createContext, useContext } from 'react';

import type { ClassesContextValue, SettingsContextValue } from './types.ts';

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

/**
 * Holds the class catalogue for the whole renderer. Null until a provider mounts.
 */
export const ClassesContext = createContext<ClassesContextValue | null>(null);

/**
 * Reads the class catalogue context.
 * @returns The user's layer, the catalogue resolved from it, and adopt
 * @throws When called outside a ClassesProvider
 */
export const useClasses = (): ClassesContextValue => {
  const value = useContext(ClassesContext);
  if (!value) throw new Error('useClasses must be used inside ClassesProvider');

  return value;
};
