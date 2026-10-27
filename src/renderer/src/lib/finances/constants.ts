import type { LedgerKind } from '../../../../shared/types';

/**
 * The kinds a breakdown weighs, in the order it lists them: what paid the
 * career, then what it paid.
 */
export const BREAKDOWN: readonly LedgerKind[] = [
  'race', 'standings', 'historic', 'salary', 'bonus', 'sale', 'refund',
  'fee', 'rent', 'seat', 'fine', 'release', 'purchase', 'repaint',
];

/**
 * The kinds of line that paid the career a prize.
 */
export const PRIZE_KINDS: readonly LedgerKind[] = ['race', 'standings', 'historic'];

/**
 * The kinds of line it costs to race a round.
 */
export const ROUND_COST_KINDS: readonly LedgerKind[] = ['fee', 'rent'];

/**
 * The kinds of line the garage moved: a car bought, sold or repainted.
 */
export const CAR_KINDS: readonly LedgerKind[] = ['purchase', 'sale', 'repaint'];

/**
 * The kinds of line a team's contract moved: what it paid, what was paid for
 * its seat, and what it fined or charged.
 */
export const CONTRACT_KINDS: readonly LedgerKind[] = ['salary', 'bonus', 'seat', 'refund', 'fine', 'release'];
