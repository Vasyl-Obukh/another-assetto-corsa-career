import type { LucideIcon } from 'lucide-react';

import type {
  Career, ClassCatalogue, ClassLayer, LoadedSave, NewCareerRequest, NewChampionshipRequest, ResolvedTheme, Settings,
} from '../../../shared/types';

/**
 * The settings, the theme they resolve to, and the one way to change them.
 */
export interface SettingsContextValue {
  /**
   * The settings as the renderer currently believes them to be.
   */
  settings: Settings;
  /**
   * The theme the window is in: the one picked, or what the system means now
   * while the setting follows it.
   */
  theme: ResolvedTheme;
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
 * Which mode the app is in: the start screen, a career or a standalone
 * championship open, or quick race mode, which has nothing open.
 */
export type SlotMode = 'start' | 'career' | 'championship' | 'quick';

/**
 * The mode the app is in, and the ways in and out of each.
 */
export interface SlotContextValue {
  /**
   * Which mode.
   */
  mode: SlotMode;
  /**
   * The open career or standalone championship, or null outside one.
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
   * Starts a standalone championship and opens it.
   * @param request What New championship asked for
   * @returns Resolves once it is open, rejecting with why it could not start
   */
  createChampionship(request: NewChampionshipRequest): Promise<void>;
  /**
   * Opens a career as one of its saves holds it.
   * @param id The career's id
   * @param save The save's id
   * @returns The career and the save, once loaded, rejecting with why it could
   * not be
   */
  loadSave(id: string, save: string): Promise<LoadedSave>;
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

/**
 * One notification, as a toast shows it.
 */
export interface ToastMessage {
  /**
   * The icon in its well.
   */
  icon: LucideIcon;
  /**
   * The well's colour classes, from an accent map.
   */
  tone: string;
  /**
   * What happened, already translated.
   */
  title: string;
  /**
   * More about it, already translated, when there is more to say.
   */
  detail?: string;
  /**
   * One thing to do about it, offered as a button beside it.
   */
  action?: {
    /**
     * The button's wording, already translated.
     */
    label: string;
    /**
     * Does it.
     */
    run(): void;
  };
}

/**
 * The way to raise a notification from anywhere in the renderer.
 */
export interface ToastContextValue {
  /**
   * Shows a toast, which goes again on its own.
   * @param message What it says
   */
  show(message: ToastMessage): void;
}

/**
 * What takes the player off the page they are on from outside it.
 */
export type LeaveAction = 'load' | 'menu';

/**
 * Whether a page holds changes it has not written, and the way to ask before
 * leaving it.
 */
export interface UnsavedContextValue {
  /**
   * Says the page holds unsaved changes, until let go.
   * @returns Lets go again
   */
  hold(): () => void;
  /**
   * Runs something that takes the player off the page, asking first while it
   * holds unsaved changes.
   * @param action What it is, which the question names
   * @param go Does it, answering whether the player has left the page
   * @returns Whether it was done: false when declined or when it failed
   */
  leave(action: LeaveAction, go: () => Promise<boolean>): Promise<boolean>;
  /**
   * Whether the player has agreed to lose the changes, so the page's own guard
   * on navigation lets them off without asking twice.
   * @returns True while they are leaving
   */
  discarding(): boolean;
}
