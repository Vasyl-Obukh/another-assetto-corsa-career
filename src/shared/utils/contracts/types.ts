/**
 * What terminating a contract comes to.
 */
export interface Termination {
  /**
   * How many rounds are still to race.
   */
  left: number;
  /**
   * The release fee: a quarter of each round's fine still to race, and never
   * less than one whole fine - nothing for a paid seat.
   */
  release: number;
  /**
   * What a paid seat gives back: half of what the rounds still to race were
   * worth - nothing for any other.
   */
  refund: number;
  /**
   * The salary the rounds still to race would have paid.
   */
  salaryLeft: number;
}
