// What the settings screen offers, and in what order. The aid lists themselves
// are shared, since the settings migration reads the same fields.

import type { AidMode, SettingsCmFlag, SettingsTab } from './types.ts';
import { path } from '@/lib/routes';

/**
 * The settings screen's tabs, in the order they are shown.
 */
export const SETTINGS_TABS: readonly SettingsTab[] = [
  { to: path.settings(), label: 'settings.tabs.general', end: true },
  { to: path.settingsContent(), label: 'settings.tabs.content', end: false },
  { to: path.settingsClasses(), label: 'settings.tabs.classes', end: false },
];

/**
 * The aids Assetto Corsa gives three settings rather than two.
 */
export const AID_MODES: readonly AidMode[] = ['abs', 'tractionControl'];

/**
 * Assetto Corsa's three modes: off, whatever the car itself has, forced on.
 */
export const ASSIST_MODES = [0, 1, 2] as const;

/**
 * Highest stability control percentage Assetto Corsa accepts.
 */
export const MAX_STABILITY_CONTROL = 100;

/**
 * The Content Manager flags that are ordinary preferences.
 *
 * Both make a career loop smoother and neither can stop a race happening,
 * which is the line `SettingsCmFlag` draws.
 */
export const SETTINGS_CM_FLAGS: readonly SettingsCmFlag[] = [
  '--skip-all-results',
  '--hide-race-cancel-button',
];
