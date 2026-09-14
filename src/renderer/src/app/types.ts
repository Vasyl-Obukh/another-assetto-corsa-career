import type { ClassCatalogue, ClassLayer, Settings } from '../../../shared/types';

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

/**
 * The class catalogue, with the user's layer resolved over what the app ships.
 */
export interface ClassesContextValue {
  /**
   * The user's layer as main last wrote it.
   */
  layer: ClassLayer;
  /**
   * The catalogue resolved from it, which every class and spec question reads.
   */
  catalogue: ClassCatalogue;
  /**
   * Takes a layer a command answered with, ahead of main's push.
   * @param layer The layer as it now stands
   */
  adopt(layer: ClassLayer): void;
}
