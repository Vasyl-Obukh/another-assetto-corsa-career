// Types local to reading a championship. Anything that crosses IPC lives in
// src/shared/types/series.ts instead.

import type { Championship } from '../../shared/types/index.ts';

/**
 * Everything needed to lower one round into a race.
 *
 * An object rather than positional parameters, and the round is named by its id
 * rather than by its index: a forked championship that inserts a round shifts
 * every index after it, and a career holding an index would then point at the
 * wrong event.
 */
export interface RoundRaceRequest {
  /**
   * The championship the round belongs to.
   */
  series: Championship;
  /**
   * Which class entry the player is racing in, by its id.
   */
  entry: string;
  /**
   * Which round to race, by its id.
   */
  round: string;
  /**
   * The car the player is driving.
   *
   * Deliberately narrower than PlayerCar: ballast, restrictor and AI level are
   * the series' to set through balance of performance, not the caller's.
   */
  car: {
    /**
     * Car folder ID, which must be eligible for the class entry at this round.
     */
    model: string;
    /**
     * Livery folder ID, assigned automatically when omitted.
     */
    skin?: string;
  };
}
