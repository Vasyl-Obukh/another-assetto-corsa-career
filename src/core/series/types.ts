// Types local to reading a championship. Anything that crosses IPC lives in
// src/shared/types/series.ts instead.

import type { Championship, FieldSeat, RoundDraw } from '../../shared/types/index.ts';

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
  /**
   * The weather already drawn for this round, when a career has issued it.
   *
   * Given one, the round races that draw rather than rolling a fresh one, which
   * is what makes the forecast the player was shown a week ago the forecast
   * they actually race. Absent outside a career, where there is nowhere to have
   * stored a draw and the seed alone keeps the two answers the same.
   */
  draw?: RoundDraw;
  /**
   * The AI field the season froze, when a career has entered the championship.
   *
   * Given one, every seat races the car, livery and offsets it was dealt when
   * the season began. Absent outside a career, where the field is drawn afresh
   * and unsalted - which comes out the same every time, and so is just as
   * stable across a championship's rounds.
   */
  field?: readonly FieldSeat[];
  /**
   * Whether the round may race in the wet, as the career's edition and round
   * resolve it. Absent outside a career, where the championship's own says.
   */
  rain?: boolean;
}
