import type { QuickRace, QuickRaceView } from '../../../../shared/types';
import type { toDisplayableError } from '@/lib/ipc';

/**
 * One race event of the player's own, and the commands its page runs on it.
 */
export interface QuickRaceState {
  /**
   * The race, or null before the first read.
   */
  view: QuickRaceView | null;
  /**
   * Whether the first read is still in flight.
   */
  loading: boolean;
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
   * Changes the race. Shown at once, and saved behind it.
   * @param race The race as edited
   */
  edit: (race: QuickRace) => void;
  /**
   * Runs its next session.
   * @returns Resolves once Content Manager has been handed it
   */
  launch: () => Promise<void>;
  /**
   * Stops waiting for the session in flight.
   * @returns Resolves once it has stopped
   */
  cancel: () => Promise<void>;
  /**
   * Throws away what has run, so it can be changed and run again.
   * @returns Resolves once it has been
   */
  restart: () => Promise<void>;
  /**
   * Sets the race's own step on the AI's strength, which may change between
   * sessions as nothing else about it may.
   * @param strength The step, zero for none
   * @returns Resolves once it has been kept
   */
  setStrength: (strength: number) => Promise<void>;
}
