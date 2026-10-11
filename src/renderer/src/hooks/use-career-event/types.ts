import type { CareerEventView } from '../../../../shared/types';
import type { toDisplayableError } from '@/lib/ipc';

/**
 * One round of the career's season, and the commands the event page runs on it.
 */
export interface CareerEventState {
  /**
   * The round, or null before the first read.
   */
  view: CareerEventView | null;
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
   * Enters the championship for the season.
   * @param entry Which class of it
   * @param car The car and livery to race all season
   * @returns Resolves once it has been entered
   */
  enter: (entry: string, car: { model: string; skin?: string }) => Promise<void>;
  /**
   * Runs the next session of the round.
   * @param skip Whether the player confirmed losing the rounds the view's
   * `skips` lists, which main otherwise refuses to
   * @param scale The factor a race is shortened by, one or absent for the
   * full race
   * @returns Resolves once Content Manager has been handed it
   */
  launch: (skip?: boolean, scale?: number) => Promise<void>;
  /**
   * Sets the player's own step on the AI's strength for this round.
   * @param strength The step, zero for none
   * @returns Resolves once it has been kept
   */
  setStrength: (strength: number) => Promise<void>;
}
