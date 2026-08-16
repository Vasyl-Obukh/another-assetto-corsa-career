// Settings defaults and the closed sets of values they accept.

import type { Language, Settings, ThemeChoice } from '../types/index.ts';

/**
 * Every theme choice the UI offers, in menu order.
 */
export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark'];

/**
 * Every language the UI offers, in menu order. English is the fallback.
 */
export const LANGUAGES: readonly Language[] = ['en', 'uk'];

/**
 * What a fresh install starts with, and what any unreadable field falls back to.
 */
export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  theme: 'system',
  language: 'en',
  paths: {},
  window: { width: 1180, height: 800, maximized: false },
};
