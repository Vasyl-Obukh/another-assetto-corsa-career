/**
 * The Store's own switches, above the car browser's filters: they narrow by
 * the career rather than by the cars, so they are applied as a base query.
 */
export interface StoreSwitches {
  /**
   * Keep only the cars the career owns.
   */
  owned: boolean;
  /**
   * Keep only the cars the career can pay for.
   */
  affordable: boolean;
  /**
   * Keep only the cars on sale this week.
   */
  onSale: boolean;
}
