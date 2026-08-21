import type { ROUTES } from './constants.ts';
import type { Settings } from '../../../shared/types';

/**
 * A destination the app can navigate to.
 */
export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * The settings, and the one way to change them.
 */
export interface SettingsContextValue {
  /**
   * The settings as the renderer currently believes them to be.
   */
  settings: Settings;
  /**
   * Applies a patch locally, then persists it through main.
   * @param patch The fields to replace
   */
  patch(patch: Partial<Settings>): void;
}
