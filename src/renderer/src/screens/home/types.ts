import type { LadderPosition, SeasonEvent } from '../../../../shared/types';

/**
 * Where one round of an entered championship stands, as its progress bar draws
 * it.
 */
export type RoundMark = 'raced' | 'missed' | 'next' | 'later';

/**
 * One championship the career has entered this season, as Home lists it.
 */
export interface SeasonProgress {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which class of it was entered, by its class entry id.
   */
  entry: string;
  /**
   * The championship's display name.
   */
  name: string;
  /**
   * The class's display name, or null for a championship of one class, where
   * naming it says nothing.
   */
  className: string | null;
  /**
   * Which discipline and rung the class sits at, or null when the class has
   * gone from the frozen championship.
   */
  ladder: LadderPosition | null;
  /**
   * Every round, in the order they run.
   */
  marks: readonly RoundMark[];
  /**
   * Where the player stands in the class, or null before anything is raced.
   */
  position: number | null;
  /**
   * How many drivers the class's table holds.
   */
  field: number;
  /**
   * Points the player has scored so far.
   */
  points: number;
  /**
   * The next round still to run, or null once the season is done.
   */
  next: SeasonEvent | null;
}
