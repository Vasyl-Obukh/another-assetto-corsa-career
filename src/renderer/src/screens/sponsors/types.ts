import type { SponsorDeal, SponsorEnd } from '../../../../shared/types';

/**
 * One deal as the History tab lists it.
 */
export interface DealRow {
  /**
   * The deal.
   */
  deal: SponsorDeal;
  /**
   * What it paid, all told.
   */
  paid: number;
  /**
   * How many races it covered that the player drove.
   */
  races: number;
  /**
   * How it ended, or that it is running.
   */
  end: SponsorEnd | 'running' | 'renewed';
}
