import type { SkippedRound } from '../../../../shared/types';

/**
 * A move of the clock waiting on the player to confirm what it costs.
 */
export interface PendingMove {
  /**
   * The ISO date the clock would move to.
   */
  date: string;
  /**
   * Every round of the career's the move would leave unraced.
   */
  rounds: readonly SkippedRound[];
}

/**
 * Moving the career's clock, asking first wherever that costs rounds.
 */
export interface ClockMove {
  /**
   * Asks to move the clock to a date: straight there when nothing is lost,
   * otherwise held as `pending` for the player to confirm.
   * @param date The ISO date to move to
   */
  moveTo: (date: string) => void;
  /**
   * The move waiting on the player, or null.
   */
  pending: PendingMove | null;
  /**
   * Makes the move waiting on the player, rounds and all.
   */
  confirm: () => void;
  /**
   * Drops the move waiting on the player.
   */
  cancel: () => void;
}
