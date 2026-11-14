import type { Quantity } from '../../../../shared/utils/units';

/**
 * Measurements written in the units the player reads, from figures kept metric.
 */
export interface Units {
  /**
   * The abbreviation a quantity is shown with.
   * @param quantity What is measured
   * @returns The unit's abbreviation, already translated
   */
  unit(quantity: Quantity): string;
  /**
   * A metric figure in the unit it is shown in, rounded as it is shown - which
   * is what a field typed into shows.
   * @param quantity What is measured
   * @param metric The figure in its metric unit
   * @param digits Decimal places, where not the quantity's own
   * @returns The figure as shown
   */
  shown(quantity: Quantity, metric: number, digits?: number): number;
  /**
   * A figure typed in the unit shown, back in its metric unit and unrounded.
   * @param quantity What is measured
   * @param typed The figure as typed
   * @returns The figure in its metric unit
   */
  stored(quantity: Quantity, typed: number): number;
  /**
   * A metric figure written out without its unit, for a screen that sets the
   * unit apart from the figure.
   * @param quantity What is measured
   * @param metric The figure in its metric unit
   * @param digits Decimal places, where not the quantity's own
   * @returns The figure, rounded and formatted for the locale
   */
  figure(quantity: Quantity, metric: number, digits?: number): string;
  /**
   * A metric figure written out with its unit.
   * @param quantity What is measured
   * @param metric The figure in its metric unit
   * @param digits Decimal places, where not the quantity's own
   * @returns The figure and unit as one string
   */
  format(quantity: Quantity, metric: number, digits?: number): string;
  /**
   * A lap's length written out with its unit: a distance, or a short length
   * for one under a kilometre, so a drag strip reads 402 m rather than 0.4 km.
   * @param metres The length in metres
   * @param digits Decimal places for a distance, where not its own
   * @returns The length and unit as one string
   */
  formatLap(metres: number, digits?: number): string;
  /**
   * A span of metric figures written out with one unit.
   * @param quantity What is measured
   * @param min The lower figure in its metric unit
   * @param max The upper figure in its metric unit
   * @param digits Decimal places, where not the quantity's own
   * @returns The span and its unit as one string
   */
  formatRange(quantity: Quantity, min: number, max: number, digits?: number): string;
  /**
   * What a car's standing-start time is named: to 100 km/h, or the same
   * speed in mph.
   */
  acceleration: string;
}
