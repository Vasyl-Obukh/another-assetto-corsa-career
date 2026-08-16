// Main owns the resolved theme. Doing this in the renderer with
// prefers-color-scheme would leave the native title bar and file dialogs on the
// old theme, so nativeTheme is the source of truth and the renderer just follows.

import { nativeTheme } from 'electron';

import type { ResolvedTheme, ThemeChoice } from '../../shared/types/index.ts';

export { WINDOW_BACKGROUND } from './constants.ts';

/**
 * Applies the user's theme choice to Electron, which also restyles native chrome.
 * @param choice What the user picked, including "system"
 */
export const applyThemeChoice = (choice: ThemeChoice): void => {
  nativeTheme.themeSource = choice;
};

/**
 * Reads the theme actually in force.
 * @returns Light or dark, with "system" already resolved against the OS
 */
export const resolvedTheme = (): ResolvedTheme => (
  nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
);

/**
 * Subscribes to theme changes, which fire on OS changes and on themeSource
 * assignments alike.
 * @param listener Called with the newly resolved theme
 * @returns A function that removes the listener
 */
export const onThemeChange = (listener: (theme: ResolvedTheme) => void): () => void => {
  const handler = (): void => listener(resolvedTheme());
  nativeTheme.on('updated', handler);

  return () => { nativeTheme.off('updated', handler); };
};
