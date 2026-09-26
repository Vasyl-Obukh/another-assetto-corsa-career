/**
 * The names drivers of one nation are drawn from.
 */
export interface NameBook {
  /**
   * First names, any of which goes with any surname.
   */
  first: readonly string[];
  /**
   * Surnames.
   */
  last: readonly string[];
}
