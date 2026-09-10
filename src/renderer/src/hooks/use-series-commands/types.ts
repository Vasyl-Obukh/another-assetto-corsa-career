import type { SeriesImportResult } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * The commands that write the user's half of the championship library.
 *
 * A hook of its own rather than more methods on useChampionship, because both
 * screens issue them. Each is a command rather than a patch: main validates and
 * writes, then pushes the new library to every screen that is open.
 */
export interface SeriesCommandsState {
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
   * Takes a copy of a championship the app ships, under its own id.
   * @param id The championship's id
   * @returns True when it was copied
   */
  customise(id: string): Promise<boolean>;
  /**
   * Copies a championship into a separate one of the user's own.
   * @param id The championship to copy
   * @param name What to call the copy
   * @returns The copy's id, or null when it failed
   */
  duplicate(id: string, name: string): Promise<string | null>;
  /**
   * Deletes the user's version of a championship the app ships.
   * @param id The adjusted championship's id
   * @returns True when it was reverted
   */
  revert(id: string): Promise<boolean>;
  /**
   * Deletes one of the user's own championships.
   * @param id The championship's id
   * @returns True when it was deleted
   */
  remove(id: string): Promise<boolean>;
  /**
   * Writes a championship out as a file the user can share.
   * @param id The championship's id
   * @returns The path written, or null when they cancelled or it failed
   */
  exportSeries(id: string): Promise<string | null>;
  /**
   * Reads a championship file the user picks into their library.
   * @returns What came in, or null when they cancelled or it failed
   */
  importSeries(): Promise<SeriesImportResult | null>;
}
