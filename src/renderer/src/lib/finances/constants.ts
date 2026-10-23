import type { LedgerKind } from '../../../../shared/types';

/**
 * The kinds a breakdown weighs, in the order it lists them: what paid the
 * career, then what it paid.
 */
export const BREAKDOWN: readonly LedgerKind[] = [
  'race', 'standings', 'historic', 'sale', 'fee', 'rent', 'purchase', 'repaint',
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
