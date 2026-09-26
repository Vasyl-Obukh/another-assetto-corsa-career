import type { Discipline } from '../../../../shared/types';

/**
 * Where one car or circuit races in the championships a career can enter.
 */
export interface Racing {
  /**
   * How many championships race it.
   */
  championships: number;
  /**
   * Which disciplines those championships enter it at, in ladder order.
   */
  disciplines: readonly Discipline[];
}

/**
 * Where every car and circuit races, keyed by folder ID. Anything absent races
 * nowhere.
 */
export interface RacingIndex {
  /**
   * Keyed by car folder ID.
   */
  cars: ReadonlyMap<string, Racing>;
  /**
   * Keyed by track folder ID, so every layout of a circuit shares one entry.
   */
  tracks: ReadonlyMap<string, Racing>;
}
