import type {
  Career, ClassCatalogue, ClassLayer, NewCareerRequest, Settings,
} from '../../../shared/types';

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

/**
 * Which mode the app is in: the start screen, a career open, or quick race
 * mode, which has nothing open.
 */
export type SlotMode = 'start' | 'career' | 'quick';

/**
 * The mode the app is in, and the ways in and out of each.
 */
export interface SlotContextValue {
  /**
   * Which mode.
   */
  mode: SlotMode;
  /**
   * The open career, or null outside one.
   */
  career: Career | null;
  /**
   * Opens a career.
   * @param id The career's id
   * @returns Resolves once it is open, rejecting with why it could not be
   */
  openCareer(id: string): Promise<void>;
  /**
   * Starts a new career and opens it.
   * @param request What New career asked for
   * @returns Resolves once it is open, rejecting with why it could not start
   */
  createCareer(request: NewCareerRequest): Promise<void>;
  /**
   * Enters quick race mode.
   */
  enterQuick(): void;
  /**
   * Leaves for the start screen, closing the open career.
   * @returns Resolves once it is closed, rejecting while a launch is out
   */
  toMainMenu(): Promise<void>;
  /**
   * Quits the app.
   */
  quit(): void;
}
