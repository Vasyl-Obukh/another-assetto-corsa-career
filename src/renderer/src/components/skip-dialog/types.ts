import type { SkippedRound } from '../../../../shared/types';

/**
 * A run of the confirmation's rows under one heading.
 */
export interface SkipGroup {
  /**
   * What the rows share: a championship's id, or "clash" for the events
   * sharing days with the one being raced.
   */
  key: string;
  /**
   * The championship's name, or null for the clash group, whose heading is the
   * dialog's own.
   */
  seriesName: string | null;
  /**
   * Its rounds, earliest first.
   */
  rounds: readonly SkippedRound[];
}
