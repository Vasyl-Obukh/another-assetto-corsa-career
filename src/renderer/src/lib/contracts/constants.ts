import type { LedgerKind } from '../../../../shared/types';

/**
 * The kinds of ledger line that pay the player under a contract.
 */
export const EARNED_KINDS: ReadonlySet<LedgerKind> = new Set<LedgerKind>(['salary', 'bonus', 'race', 'standings']);

/**
 * The kinds of ledger line a contract costs or gives back.
 */
export const PAID_KINDS: ReadonlySet<LedgerKind> = new Set<LedgerKind>(['seat', 'fine', 'fee', 'release', 'refund']);
