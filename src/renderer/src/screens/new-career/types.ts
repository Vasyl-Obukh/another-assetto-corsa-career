/**
 * A rung a new career may start on.
 */
export interface LevelOption {
  /**
   * The rung, 1 being the top.
   */
  tier: number;
  /**
   * How many championships a career starting on it could enter - those with a
   * class at it or below.
   */
  count: number;
  /**
   * A few of the championships with a class at exactly this rung.
   */
  examples: string[];
}
