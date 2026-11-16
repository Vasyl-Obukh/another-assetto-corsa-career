import type { ContractPay } from '../../../../shared/types';

/**
 * Which contracts the table lists: all of them, or those paying on one basis.
 */
export type PayFilter = 'all' | ContractPay;
