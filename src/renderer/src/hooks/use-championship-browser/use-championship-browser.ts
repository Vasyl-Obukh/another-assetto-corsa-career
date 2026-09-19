import {
  useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';

import { EMPTY_CRITERIA } from './constants.ts';
import type {
  ChampionshipBrowser, ChampionshipCriteria, ChampionshipDimension,
} from './types.ts';
import {
  championshipFacets,
  filterChampionships,
  isChampionshipFiltered,
  sortChampionships,
  withKnownValues,
} from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import { readBrowserMemory, rememberBrowser } from '@/lib/browser-memory';

/**
 * Search, filters and sort over a championship list, remembered per list.
 *
 * All in the renderer, unlike the content browsers: the whole library is
 * already here, a hundred-odd entries, so there is nothing to page and nothing
 * to ask main.
 * @param listings The list to narrow, in ladder order
 * @param dimensions What it can be narrowed by
 * @param memoryId Which list this is, so leaving it and coming back finds it
 *   as it was, scroll position included
 * @param ready Whether the list has loaded, which is when a remembered
 *   position can be scrolled back to
 * @returns The narrowed list and the actions the screen binds to
 */
export const useChampionshipBrowser = (
  listings: readonly SeriesListing[],
  dimensions: readonly ChampionshipDimension[],
  memoryId: string,
  ready: boolean,
): ChampionshipBrowser => {
  const { compare } = useFormat();
  // Read once, at mount, as the car browser does: the store keeps being
  // written while the screen is open.
  const [memory] = useState(() => readBrowserMemory<ChampionshipCriteria>(memoryId));
  const [search, setSearch] = useState(memory.search);
  const [remembered, setCriteria] = useState(memory.criteria ?? EMPTY_CRITERIA);

  // Checked against the list rather than stored checked, so a pick survives
  // the moment the library is still loading and nothing carries anything.
  const criteria = useMemo(
    () => withKnownValues(remembered, listings, dimensions),
    [remembered, listings, dimensions],
  );

  const shown = useMemo(
    () => sortChampionships(filterChampionships(listings, dimensions, criteria, search), criteria, compare),
    [listings, dimensions, criteria, search, compare],
  );
  const facets = useMemo(
    () => championshipFacets(listings, dimensions, criteria, search),
    [listings, dimensions, criteria, search],
  );

  useEffect(() => {
    rememberBrowser<ChampionshipCriteria>(memoryId, { search, criteria: remembered });
  }, [memoryId, search, remembered]);

  // The position is recorded as the user scrolls rather than on the way out,
  // since by the time the screen unmounts its element may already be gone.
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!scroller) return undefined;

    const record = (): void => rememberBrowser(memoryId, { scroll: scroller.scrollTop });
    scroller.addEventListener('scroll', record, { passive: true });

    return () => scroller.removeEventListener('scroll', record);
  }, [scroller, memoryId]);

  // Once, and only when the cards are there: scrolling an empty list goes
  // nowhere. Before paint, so the list never shows at the top first.
  const restored = useRef(false);
  useLayoutEffect(() => {
    if (restored.current || !scroller || !ready) return;

    restored.current = true;
    scroller.scrollTo({ top: memory.scroll });
  }, [scroller, ready, memory.scroll]);

  return {
    search,
    criteria,
    facets,
    shown,
    total: listings.length,
    filtered: isChampionshipFiltered(criteria, search),
    setSearch,
    setCriteria,
    clear: () => {
      setSearch('');
      setCriteria({ ...criteria, picked: {} });
    },
    scrollRef: setScroller,
  };
};
