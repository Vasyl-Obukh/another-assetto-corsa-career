import type { CareerSummary } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Every career on disk, and what the start screen and the Careers list do with
 * them.
 */
export interface CareersState {
  /**
   * The careers, played most recently first, or null while they are read.
   */
  careers: readonly CareerSummary[] | null;
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
}
