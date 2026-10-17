import type { SaveSummary } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * A career's saves, and what the Careers page and the slot menu do with them.
 * Loading is not among them: it opens the career, which is the slot's to do.
 */
export interface SavesState {
  /**
   * The saves, newest first, or null while they are read or with no career
   * to read them for.
   */
  saves: readonly SaveSummary[] | null;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * The last thing that went wrong, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
  /**
   * Saves the open career under a name.
   * @param name The name
   * @param over The named save to write over, or absent for a save of its own
   * @returns Whether it saved
   */
  save(name: string, over?: string): Promise<boolean>;
  /**
   * Writes the open career over its quick save.
   * @returns Whether it saved
   */
  quickSave(): Promise<boolean>;
  /**
   * Renames a named save.
   * @param save The save's id
   * @param name Its new name
   * @returns Whether it was renamed
   */
  rename(save: string, name: string): Promise<boolean>;
  /**
   * Deletes a named save.
   * @param save The save's id
   * @returns Whether it was deleted
   */
  remove(save: string): Promise<boolean>;
  /**
   * Shows the career's saves folder in the system's file browser.
   * @returns Resolves once it is shown, or the failure is
   */
  showFolder(): Promise<void>;
}
