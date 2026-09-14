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
 * A switch on every card, for a browser that decides something about each entry
 * rather than opening or picking one.
 */
export interface BrowserToggle {
  /**
   * Whether an entry's switch is on.
   * @param id The entry's folder ID
   * @returns True when it is on
   */
  isOn(id: string): boolean;
  /**
   * Flips an entry's switch.
   * @param id The entry's folder ID
   * @param on Whether it should now be on
   */
  onToggle(id: string, on: boolean): void;
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
