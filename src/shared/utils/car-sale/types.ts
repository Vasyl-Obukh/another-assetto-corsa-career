import type { CarDeal } from '../../types/index.ts';

/**
 * A car on sale this week, and whether it is the Deal of the week.
 */
export interface LiveDeal extends CarDeal {
  /**
   * Whether it is the Deal of the week.
   */
  headline: boolean;
}
