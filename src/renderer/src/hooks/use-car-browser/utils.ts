import type { CarCriteria } from './types.ts';
import type { CarQuery } from '../../../../shared/types';

/**
 * Folds the criteria, the settled search text and any base query into one.
 *
 * The base query is what a picker narrows itself to before the user touches
 * anything - the cars a championship's class entry may field, say. It is
 * applied last so a filter the user picks cannot widen past it.
 * @param criteria The filters and sort currently applied
 * @param search The search text, once it has stopped changing
 * @param base A query every request is narrowed by, or undefined
 * @returns The query to send, with empty search omitted rather than sent blank
 */
export const toCarQuery = (
  criteria: CarCriteria,
  search: string,
  base?: CarQuery,
): CarQuery => ({
  ...criteria,
  ...(search.trim() === '' ? {} : { search: search.trim() }),
  ...base,
});

/**
 * A stable identity for a query, so that changing it starts the list over.
 * @param query The query to identify
 * @returns A string that differs whenever the query does
 */
export const carQueryKey = (query: CarQuery): string => JSON.stringify(query);

/**
 * Whether anything has been narrowed, so Clear is worth offering.
 * @param criteria The filters currently applied
 * @param search The search text
 * @returns True when either would change the results
 */
export const isCarFiltered = (criteria: CarCriteria, search: string): boolean => (
  search.trim() !== ''
  || Object.entries(criteria).some(([key, value]) => {
    if (key === 'sort' || key === 'direction') return false;

    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  })
);
