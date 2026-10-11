import type { QuickRaceArchives } from '../../../../shared/types';

/**
 * Which archives each race event of the player's own wrote.
 */
export interface QuickArchivesState {
  /**
   * One entry per race, or null until the first answer and when they could
   * not be read.
   */
  archives: readonly QuickRaceArchives[] | null;
  /**
   * Whether they are still loading. A read that failed is not loading, so a
   * page waiting on it goes on without the links rather than waiting for ever.
   */
  loading: boolean;
}
