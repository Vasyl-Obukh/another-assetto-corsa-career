import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { EMPTY_CRITERIA, SEARCH_DEBOUNCE_MS } from './constants.ts';
import type { TrackBrowser, TrackCriteria } from './types.ts';
import { isTrackFiltered, toTrackQuery, trackQueryKey } from './utils.ts';
import type { TrackFacets } from '../../../../shared/types';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { PAGE_SIZE, usePagedContent } from '../use-paged-content/index.ts';
import { invoke, subscribe } from '@/lib/ipc';

export type { TrackBrowser, TrackCriteria } from './types.ts';

/**
 * Everything the track browser screen needs: criteria, facet counts and the list.
 * @returns The current state and the actions the screen binds to
 */
export const useTrackBrowser = (): TrackBrowser => {
  const [search, setSearch] = useState('');
  const [criteria, setCriteria] = useState<TrackCriteria>(EMPTY_CRITERIA);
  const [facets, setFacets] = useState<TrackFacets | null>(null);
  const [stale, setStale] = useState(false);

  const settled = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const query = useMemo(() => toTrackQuery(criteria, settled), [criteria, settled]);
  const key = useMemo(() => trackQueryKey(query), [query]);

  const load = useCallback(
    (offset: number, limit: number) => invoke('content:tracks', { ...query, offset, limit }),
    [query],
  );

  const list = usePagedContent(load, key, (track) => track.key);

  // content:trackFacets takes a wrapper object, unlike content:tracks.
  useEffect(() => {
    let live = true;
    invoke('content:trackFacets', { query }).then(
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
  // nothing. Past that, only say that what they are looking at is out of date.
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
    filtered: isTrackFiltered(criteria, search),
    setSearch,
    setCriteria,
    clear: () => {
      setSearch('');
      setCriteria(EMPTY_CRITERIA);
    },
    refresh,
  };
};
