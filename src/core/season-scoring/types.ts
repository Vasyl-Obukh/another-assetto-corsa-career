// What scoring a weekend is handed.

import type { RaceOut } from '../../shared/types/index.ts';

/**
 * One launch of a weekend and what Assetto Corsa wrote for it.
 *
 * The raw race_out.json rather than a summary: a summary identifies a driver by
 * name, and scoring needs the car index, which is what joins a result back to
 * the seat that raced it.
 */
export interface LaunchResult {
  /**
   * Which launch of the weekend this is, by its index in the plan.
   */
  launch: number;
  /**
   * The whole of what that launch wrote.
   */
  raceOut: RaceOut;
}
