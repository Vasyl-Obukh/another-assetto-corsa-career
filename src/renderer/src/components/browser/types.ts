import type { ParseKeys } from 'i18next';

/**
 * One option in a sort menu.
 */
export interface SortItem<K extends string> {
  /**
   * The sort key sent in the query.
   */
  key: K;
  /**
   * The catalogue key for its label.
   */
  label: ParseKeys;
}

/**
 * A numeric range filter's current value. Either end may be unset.
 */
export interface RangeValue {
  /**
   * Lowest acceptable value, or undefined for no lower bound.
   */
  from?: number;
  /**
   * Highest acceptable value, or undefined for no upper bound.
   */
  to?: number;
}
