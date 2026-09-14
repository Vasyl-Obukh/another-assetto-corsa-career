import type { CarCriteria } from './types.ts';
import type { CarQuery, ClassCatalogue } from '../../../../shared/types';

/**
 * Drops any class or spec the catalogue no longer has from the filters.
 *
 * A user's own can be deleted while a browser remembers it ticked, and a spec
 * that is gone matches no car and is listed nowhere to untick.
 * @param criteria The filters currently applied
 * @param catalogue The catalogue as it now stands
 * @returns The very criteria given when nothing was dropped, so the query built
 *   from them keeps its identity
 */
export const withKnownClasses = (criteria: CarCriteria, catalogue: ClassCatalogue): CarCriteria => {
  const classes = criteria.classes?.filter((one) => catalogue.classById.has(one));
  const specs = criteria.specs?.filter((one) => catalogue.specById.has(one));
  if (classes?.length === criteria.classes?.length && specs?.length === criteria.specs?.length) return criteria;

  return { ...criteria, classes, specs };
};

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
