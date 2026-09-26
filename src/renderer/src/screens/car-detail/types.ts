import type { ClassEntry } from '../../../../shared/types';

/**
 * A championship that races a car, and the classes in it the car may enter.
 */
export interface CarChampionship {
  /**
   * The championship's id, for the link to its page.
   */
  id: string;
  /**
   * What it is called.
   */
  name: string;
  /**
   * Every class of it the car may be fielded in, in the championship's order.
   */
  entries: readonly ClassEntry[];
}

/**
 * One axis of the curves chart: where it ends and where its lines are drawn.
 */
export interface ChartAxis {
  /**
   * The value at the top of the axis, rounded up to a figure worth labelling.
   */
  max: number;
  /**
   * The values a gridline is drawn at, the floor included.
   */
  ticks: readonly number[];
}
