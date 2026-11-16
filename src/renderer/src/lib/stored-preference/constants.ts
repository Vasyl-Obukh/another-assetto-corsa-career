import type { SortDirection } from '../../../../shared/types';

/**
 * Every way a stored sort can run.
 */
export const SORT_DIRECTIONS = ['asc', 'desc'] as const satisfies readonly SortDirection[];
