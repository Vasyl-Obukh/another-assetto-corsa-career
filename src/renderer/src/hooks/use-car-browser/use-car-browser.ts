import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { EMPTY_CRITERIA, SEARCH_DEBOUNCE_MS } from './constants.ts';
import type { CarBrowser, CarCriteria } from './types.ts';
import { carQueryKey, isCarFiltered, toCarQuery } from './utils.ts';
import type { CarFacets } from '../../../../shared/types';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { PAGE_SIZE, usePagedContent } from '../use-paged-content/index.ts';
import { invoke, subscribe } from '@/lib/ipc';

export type { CarBrowser, CarCriteria } from './types.ts';

/**
 * Everything the car browser screen needs: criteria, facet counts and the list.
 * @returns The current state and the actions the screen binds to
 */
export const useCarBrowser = (): CarBrowser => {
  const [search, setSearch] = useState('');
  const [criteria, setCriteria] = useState<CarCriteria>(EMPTY_CRITERIA);
  const [facets, setFacets] = useState<CarFacets | null>(null);
  const [stale, setStale] = useState(false);

  const settled = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const query = useMemo(() => toCarQuery(criteria, settled), [criteria, settled]);
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
  }, [query]);

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
  useEffect(() => subscribe('content:changed', () => {
    if (shallow) refresh();
    else setStale(true);
  }), [shallow, refresh]);

  return {
    search,
    criteria,
    facets,
    list,
    stale,
    filtered: isCarFiltered(criteria, search),
    setSearch,
    setCriteria,
    clear: () => {
      setSearch('');
      setCriteria(EMPTY_CRITERIA);
    },
    refresh,
  };
};
