import type { LedgerKind } from '../../../../shared/types';

/**
 * The kinds a breakdown weighs, in the order it lists them: what paid the
 * career, then what it paid.
 */
export const BREAKDOWN: readonly LedgerKind[] = ['race', 'standings', 'historic', 'fee'];

/**
 * The kinds of line that paid the career a prize.
 */
export const PRIZE_KINDS: readonly LedgerKind[] = ['race', 'standings', 'historic'];
