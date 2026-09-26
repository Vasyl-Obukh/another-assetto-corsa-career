import type { QuickRaceView } from '../../../../shared/types';
import type { toDisplayableError } from '@/lib/ipc';

/**
 * Every race weekend of the player's own, and the commands the Race tab runs on
 * them.
 */
export interface QuickRacesState {
  /**
   * The races, the ones part-way first, or null before the first read.
   */
  races: readonly QuickRaceView[] | null;
  /**
   * Whether a command is in flight, which is what holds the buttons.
   */
  busy: boolean;
  /**
   * What went wrong, until it is dismissed.
   */
  error: ReturnType<typeof toDisplayableError> | null;
  /**
   * Forgets the last error.
   */
  dismissError: () => void;
  /**
   * Makes a new race weekend.
   * @returns Its id, or null when it could not be made
   */
  create: () => Promise<string | null>;
  /**
   * Copies a race weekend, leaving its results behind.
   * @param id The race to copy
   * @returns Resolves once copied
   */
  duplicate: (id: string) => Promise<void>;
  /**
   * Deletes a race weekend.
   * @param id The race to delete
   * @returns Resolves once deleted
   */
  remove: (id: string) => Promise<void>;
}
