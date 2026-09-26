import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { EMPTY_CRITERIA, SEARCH_DEBOUNCE_MS } from './constants.ts';
import type { TrackBrowser, TrackCriteria } from './types.ts';
import { isTrackFiltered, toTrackQuery, trackQueryKey } from './utils.ts';
import type { TrackFacets, TrackQuery } from '../../../../shared/types';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { PAGE_SIZE, usePagedContent } from '../use-paged-content/index.ts';
import { readBrowserMemory, rememberBrowser } from '@/lib/browser-memory';
import { invoke, subscribe } from '@/lib/ipc';

export type { TrackBrowser, TrackCriteria } from './types.ts';

/**
 * Everything the track browser screen needs: criteria, facet counts and the list.
 * @param base A query every request is narrowed by, for a browser with a
 *   restricted set of tracks to offer
 * @param memoryId Which browser this is, for one that comes back where it was
 * @param raced Every track a championship races, or undefined until that is known
 * @returns The current state and the actions the screen binds to
 */
export const useTrackBrowser = (
  base?: TrackQuery,
  memoryId?: string,
  raced?: readonly string[],
): TrackBrowser => {
  // Read once, at mount: the store keeps being written while the screen is
  // open, and reading it again would answer with what the user is looking at
  // rather than what they were.
  const [memory] = useState(() => readBrowserMemory<TrackCriteria>(memoryId));

  const [search, setSearch] = useState(memory.search);
  const [criteria, setCriteria] = useState<TrackCriteria>(memory.criteria ?? EMPTY_CRITERIA);
  const [facets, setFacets] = useState<TrackFacets | null>(null);
  const [stale, setStale] = useState(false);

  const settled = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  // Serialised rather than depended on directly, as the car browser's is, since
  // a caller rebuilding its base query each render would never settle.
  const baseKey = useMemo(() => JSON.stringify(base ?? null), [base]);
  const query = useMemo(
    () => toTrackQuery(criteria, settled, base, raced),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- baseKey stands in for base
    [criteria, settled, baseKey, raced],
  );
  const key = useMemo(() => trackQueryKey(query), [query]);

  const load = useCallback(
    (offset: number, limit: number) => invoke('content:tracks', { ...query, offset, limit }),
    [query],
  );

  const list = usePagedContent(load, key, (group) => group.id);

  // content:trackFacets takes a wrapper object, unlike content:tracks.
  useEffect(() => {
    let live = true;
    invoke('content:trackFacets', { query }).then(
      (next) => { if (live) setFacets(next); },
      () => { /* the grid's own error already says why nothing loaded */ },
    );

    return () => { live = false; };
  }, [query]);

  // Written to a module store rather than lifted into a provider: nothing
  // renders from it, and the only reader is the next mount of this browser.
  // The list itself is not remembered - coming back to the same filters at the
  // first page is the point, and restoring a scroll offset would mean paging
  // every entry under it back in first.
  useEffect(() => {
    rememberBrowser<TrackCriteria>(memoryId, { search, criteria });
  }, [memoryId, search, criteria]);

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
    // The layout is a way of looking rather than a filter, so it survives.
    clear: () => {
      setSearch('');
      setCriteria({ ...EMPTY_CRITERIA, view: criteria.view });
    },
    refresh,
  };
};
