import type { CareerBackup, CareerListing, WrittenBackup } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Every career on disk, and what the start screen and the Careers list do with
 * them.
 */
export interface CareersState {
  /**
   * The careers, played most recently first, or null while they are read -
   * those that cannot be read among them, so they can still be deleted.
   */
  careers: readonly CareerListing[] | null;
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
   * Opens a career, which is what Continue does.
   * @param id The career's id
   * @returns Whether it opened
   */
  open(id: string): Promise<boolean>;
  /**
   * Deletes a career and its folder.
   * @param id The career's id
   * @returns Resolves once it is gone, or the failure is shown
   */
  remove(id: string): Promise<void>;
  /**
   * Shows a career's folder in the system's file browser.
   * @param id The career's id
   * @returns Resolves once it is shown, or the failure is
   */
  showFolder(id: string): Promise<void>;
  /**
   * Backs a career up, asking where with the system's own dialog.
   * @param id The career's id
   * @returns What was written, or null when the dialog was cancelled or the
   * failure is shown
   */
  backup(id: string): Promise<WrittenBackup | null>;
  /**
   * Picks a backup with the system's own dialog and reads it, restoring
   * nothing yet.
   * @returns What it holds, or null when the dialog was cancelled or the
   * failure is shown
   */
  openBackup(): Promise<CareerBackup | null>;
  /**
   * Restores a career from a backup read before.
   * @param file The backup
   * @param replace Whether the copy of the career already here is replaced
   * @returns The restored career's id, or null when the failure is shown
   */
  restore(file: string, replace: boolean): Promise<string | null>;
}
