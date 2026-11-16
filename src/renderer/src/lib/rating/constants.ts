import type { RatingFilter } from './types.ts';

/**
 * Every way the rating log can be narrowed, in the order offered.
 */
export const RATING_FILTERS: readonly RatingFilter[] = ['all', 'sessions', 'levels'];
