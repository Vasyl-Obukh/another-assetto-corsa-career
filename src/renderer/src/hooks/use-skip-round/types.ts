import type { SkippedRound } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Which round is to be skipped.
 */
export interface SkipRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * The round's id.
   */
  round: string;
  /**
   * Which of the season's editions, or the one the career is racing.
   */
  edition?: number;
}

/**
 * A skip waiting on the player to confirm what it costs.
 */
export interface PendingSkip extends SkipRequest {
  /**
   * The round and every round of the career's skipping it leaves unraced, the
   * round itself last.
   */
  rounds: readonly SkippedRound[];
}

/**
 * Skipping a round the install cannot race, asking first.
 */
export interface SkipRound {
  /**
   * Asks to skip a round: reads what it costs and holds it as `pending`.
   * @param request Which round
   */
  ask: (request: SkipRequest) => void;
  /**
   * The skip waiting on the player, or null.
   */
  pending: PendingSkip | null;
  /**
   * Whether a read or the skip itself is in flight.
   */
  busy: boolean;
  /**
   * Why the last read or skip failed, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError: () => void;
  /**
   * Makes the skip waiting on the player.
   */
  confirm: () => void;
  /**
   * Drops the skip waiting on the player.
   */
  cancel: () => void;
}
