import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { EMPTY_CRITERIA, SEARCH_DEBOUNCE_MS } from './constants.ts';
import type { CarBrowser, CarCriteria } from './types.ts';
import {
  carQueryKey, isCarFiltered, toCarQuery, withKnownClasses,
} from './utils.ts';
import type { CarFacets, CarQuery } from '../../../../shared/types';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { PAGE_SIZE, usePagedContent } from '../use-paged-content/index.ts';
import { useClasses } from '@/app';
import { readBrowserMemory, rememberBrowser } from '@/lib/browser-memory';
import { invoke, subscribe } from '@/lib/ipc';

export type { CarBrowser, CarCriteria } from './types.ts';

/**
 * Everything the car browser screen needs: criteria, facet counts and the list.
 * @param base A query every request is narrowed by, for a picker with a
 *   restricted set of cars to offer
 * @param memoryId Which browser this is, for one that comes back where it was
 * @param raced Every car a championship races, or undefined until that is known
 * @returns The current state and the actions the screen binds to
 */
export const useCarBrowser = (
  base?: CarQuery,
  memoryId?: string,
  raced?: readonly string[],
): CarBrowser => {
  // Read once, at mount: the store keeps being written while the screen is
  // open, and reading it again would answer with what the user is looking at
  // rather than what they were.
  const [memory] = useState(() => readBrowserMemory<CarCriteria>(memoryId));

  const [search, setSearch] = useState(memory.search);
  const [picked, setCriteria] = useState<CarCriteria>(memory.criteria ?? EMPTY_CRITERIA);
  const [facets, setFacets] = useState<CarFacets | null>(null);
  const [stale, setStale] = useState(false);
  // Bumped when the class catalogue changes, which moves the class and spec
  // counts without the query itself changing.
  const [classified, setClassified] = useState(0);

  // Read through the catalogue rather than as picked, since a class or spec of
  // the user's can be deleted while this browser has it ticked.
  const { catalogue } = useClasses();
  const criteria = useMemo(() => withKnownClasses(picked, catalogue), [picked, catalogue]);

  const settled = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  // Serialised rather than depended on directly, since a picker rebuilds its
  // base query object on every render and the identity would never settle.
  const baseKey = useMemo(() => JSON.stringify(base ?? null), [base]);
  const query = useMemo(
    () => toCarQuery(criteria, settled, base, raced),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- baseKey stands in for base
    [criteria, settled, baseKey, raced],
  );
  const key = useMemo(() => carQueryKey(query), [query]);

  const load = useCallback(
    (offset: number, limit: number) => invoke('content:cars', { ...query, offset, limit }),
    [query],
  );

  const list = usePagedContent(load, key, (car) => car.id);

  // Counts are not cleared while they refetch: a filter panel that empties for a
  // frame every time something is ticked is worse than one that is briefly out
  // of date. content:carFacets takes a wrapper, unlike content:cars.
  useEffect(() => {
    let live = true;
    invoke('content:carFacets', { query }).then(
      (next) => { if (live) setFacets(next); },
      () => { /* the grid's own error already says why nothing loaded */ },
    );

    return () => { live = false; };
  }, [query, classified]);

  // Written to a module store rather than lifted into a provider: nothing
  // renders from it, and the only reader is the next mount of this browser.
  // The list itself is not remembered - coming back to the same filters at the
  // first page is the point, and restoring a scroll offset would mean paging
  // every entry under it back in first.
  useEffect(() => {
    rememberBrowser<CarCriteria>(memoryId, { search, criteria });
  }, [memoryId, search, criteria]);

  const { reload } = list;
  const refresh = useCallback(() => {
    setStale(false);
    reload();
  }, [reload]);

  // Below one page nothing has been scrolled past, so reloading costs the user
  // nothing and content installed while the app is open shows up without being
  // asked for. Past that, yanking a scrolled grid back to the top is worse than
  // a button, so the screen is only told that what it has is out of date.
  const shallow = list.items.length <= PAGE_SIZE;
  useEffect(() => {
    const follow = (): void => {
      if (shallow) refresh();
      else setStale(true);
    };
    const offContent = subscribe('content:changed', follow);
    // A car classified elsewhere can join or leave a class or spec filter, so the
    // list follows the same rule; the counts always refetch.
    const offClasses = subscribe('classes:changed', () => {
      setClassified((n) => n + 1);
      follow();
    });

    return () => {
      offContent();
      offClasses();
    };
  }, [shallow, refresh]);

  return {
    search,
    criteria,
    facets,
    list,
    stale,
    filtered: isCarFiltered(criteria, search),
    setSearch,
    setCriteria,
    // The layout is a way of looking rather than a filter, so it survives.
    clear: () => {
      setSearch('');
      setCriteria({ ...EMPTY_CRITERIA, view: criteria.view });
    },
    refresh,
  };
};
