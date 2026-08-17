// App settings, as persisted to settings.json in the user data folder.

import type { PathOverrides } from './paths.ts';

/**
 * What the user picked in the theme menu. "system" follows the OS.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

/**
 * The theme actually in force, once "system" has been resolved against the OS.
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * A supported UI language.
 */
export type Language = 'en' | 'uk';

/**
 * Where the window was last time, so it can be put back.
 */
export interface WindowState {
  /**
   * Un-maximized width in pixels.
   */
  width: number;
  /**
   * Un-maximized height in pixels.
   */
  height: number;
  /**
   * Un-maximized left edge, absent before the window has ever been placed.
   */
  x?: number;
  /**
   * Un-maximized top edge, absent before the window has ever been placed.
   */
  y?: number;
  /**
   * Whether the window was maximized when it was last closed.
   */
  maximized: boolean;
}

/**
 * Everything persisted between runs.
 */
export interface Settings {
  /**
   * Schema version, so a future shape can be migrated rather than discarded.
   */
  version: 1;
  /**
   * The user's theme choice, before resolution.
   */
  theme: ThemeChoice;
  /**
   * The user's UI language.
   */
  language: Language;
  /**
   * Paths the user has corrected by hand.
   */
  paths: PathOverrides;
  /**
   * Window geometry to restore on next launch.
   */
  window: WindowState;
  /**
   * ISO timestamp of when the user finished first-run setup. Absent means they
   * have not, which is the only reliable signal - an auto-detected install
   * writes no overrides, so empty `paths` says nothing either way.
   */
  setupCompletedAt?: string;
}
