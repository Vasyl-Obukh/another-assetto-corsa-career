import type { PayFilter } from './types.ts';

/**
 * Every way the contract table can be narrowed, in the order offered.
 */
export const PAY_FILTERS: readonly PayFilter[] = ['all', 'salary', 'free', 'seat'];

/**
 * Where the contract table keeps its filter.
 */
export const PAY_FILTER_MEMORY = 'contracts.filter';
