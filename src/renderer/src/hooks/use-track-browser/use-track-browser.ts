import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { EMPTY_CRITERIA, SEARCH_DEBOUNCE_MS, TRACK_PICKER_MEMORY } from './constants.ts';
import type { TrackBrowser } from './types.ts';
import {
  isTrackFiltered, readTrackCriteria, toTrackQuery, trackQueryKey,
} from './utils.ts';
import type { TrackFacets, TrackQuery } from '../../../../shared/types';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { PAGE_SIZE, usePagedContent } from '../use-paged-content/index.ts';
import { usePreference } from '../use-preference/index.ts';
import { useRememberedSearch } from '../use-remembered-search/index.ts';
import { invoke, subscribe } from '@/lib/ipc';
import { viewOnly } from '@/lib/stored-preference';

export type { TrackBrowser, TrackCriteria } from './types.ts';

/**
 * Everything the track browser screen needs: criteria, facet counts and the list.
 * @param base A query every request is narrowed by, for a browser with a
 *   restricted set of tracks to offer
 * @param memoryId Which browser this is, for one that comes back where it was;
 *   without one it is a picker, which keeps only the layout every track picker
 *   shares
 * @param raced Every track a championship races, or undefined until that is known
 * @returns The current state and the actions the screen binds to
 */
export const useTrackBrowser = (
  base?: TrackQuery,
  memoryId?: string,
  raced?: readonly string[],
): TrackBrowser => {
  const [search, setSearch] = useRememberedSearch(memoryId);
  const [criteria, setCriteria] = usePreference(
    memoryId === undefined ? TRACK_PICKER_MEMORY : `${memoryId}.criteria`,
    readTrackCriteria,
    memoryId === undefined ? viewOnly : undefined,
  );
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
