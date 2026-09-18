import type { IpcRequest } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Every channel that writes the user's class layer.
 */
export type ClassChannel =
  | 'classes:assignCar'
  | 'classes:revertCar'
  | 'classes:saveClass'
  | 'classes:deleteClass'
  | 'classes:copyClass'
  | 'classes:saveSpec'
  | 'classes:deleteSpec';

/**
 * The commands that write the user's class layer.
 *
 * Each is a command rather than a patch: main checks and writes, then pushes
 * the layer to every screen that is open.
 */
export interface ClassCommandsState {
  /**
   * Whether a command is running right now, which disables all of them.
   */
  busy: boolean;
  /**
   * Why the last command failed, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
  /**
   * Restates which specs a car races in.
   * @param car Car folder ID
   * @param specs Every spec it should race in; empty leaves it unclassified
   * @returns True when it was written
   */
  assignCar(car: string, specs: string[]): Promise<boolean>;
  /**
   * Puts a car back to whatever the app ships for it.
   * @param car Car folder ID
   * @returns True when it was written
   */
  revertCar(car: string): Promise<boolean>;
  /**
   * Adds a class of the user's, or renames one.
   * @param draft The class as the form left it
   * @returns The class's id, or null when it failed
   */
  saveClass(draft: IpcRequest<'classes:saveClass'>): Promise<string | null>;
  /**
   * Deletes a class of the user's, and every spec in it with it.
   * @param id The class
   * @returns True when it was deleted
   */
  deleteClass(id: string): Promise<boolean>;
  /**
   * Copies a class into a new class of the user's, specs and cars included.
   * @param id The class to copy
   * @param name What to call the copy
   * @returns The new class's id, or null when it failed
   */
  copyClass(id: string, name: string): Promise<string | null>;
  /**
   * Adds a spec of the user's, or renames or moves one.
   * @param draft The spec as the form left it
   * @returns The spec's id, or null when it failed
   */
  saveSpec(draft: IpcRequest<'classes:saveSpec'>): Promise<string | null>;
  /**
   * Deletes a spec of the user's.
   * @param id The spec
   * @returns True when it was deleted
   */
  deleteSpec(id: string): Promise<boolean>;
}
