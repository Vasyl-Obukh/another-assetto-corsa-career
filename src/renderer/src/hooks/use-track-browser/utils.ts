import type { TrackCriteria } from './types.ts';
import type { TrackQuery } from '../../../../shared/types';

/**
 * Folds the criteria and the settled search text into one query.
 * @param criteria The filters and sort currently applied
 * @param search The search text, once it has stopped changing
 * @returns The query to send, with empty search omitted rather than sent blank
 */
export const toTrackQuery = (criteria: TrackCriteria, search: string): TrackQuery => (
  search.trim() === '' ? criteria : { ...criteria, search: search.trim() }
);

/**
 * A stable identity for a query, so that changing it starts the list over.
 * @param query The query to identify
 * @returns A string that differs whenever the query does
 */
export const trackQueryKey = (query: TrackQuery): string => JSON.stringify(query);

/**
 * Whether anything has been narrowed, so Clear is worth offering.
 * @param criteria The filters currently applied
 * @param search The search text
 * @returns True when either would change the results
 */
export const isTrackFiltered = (criteria: TrackCriteria, search: string): boolean => (
  search.trim() !== ''
  || Object.entries(criteria).some(([key, value]) => {
    if (key === 'sort' || key === 'direction') return false;

    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  })
);
