import type { RaceSetup } from '../../../../shared/types';

/**
 * The launch slot as a page waiting on it needs it.
 */
export interface RaceStatusState {
  /**
   * What the slot holds and where its launch is up to, or null before the
   * first answer.
   */
  setup: RaceSetup | null;
  /**
   * Stops waiting for the launch in flight.
   */
  cancel: () => void;
}
