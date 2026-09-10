import { useCallback, useEffect, useState } from 'react';

import type { ChampionshipsState } from './types.ts';
import type { SeriesLibrary } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { ChampionshipsState } from './types.ts';

/**
 * Loads every championship and whether the install can race it.
 *
 * Re-read on content:changed rather than only on mount: a championship's
 * availability is a fact about the library, so installing a mod while the
 * screen is open changes the answer. And adopted straight off series:changed,
 * so a championship written from the detail screen reaches the list behind it.
 * @returns The listings and what is stopping them loading
 */
export const useChampionships = (): ChampionshipsState => {
  const [library, setLibrary] = useState<SeriesLibrary | null>(null);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);

  const load = useCallback((): (() => void) => {
    let live = true;

    invoke('series:list', undefined).then(
      (next) => { if (live) { setLibrary(next); setError(null); } },
      (thrown: unknown) => { if (live) setError(toDisplayableError(thrown)); },
    );

    return () => { live = false; };
  }, []);

  useEffect(load, [load]);
  useEffect(() => subscribe('content:changed', () => { load(); }), [load]);
  // The push carries the whole library, which is exactly what series:list
  // answers - so unlike content:changed beside it, this needs no round trip.
  useEffect(() => subscribe('series:changed', setLibrary), []);

  return {
    listings: library?.series ?? [],
    problems: library?.problems ?? [],
    loading: library === null && error === null,
    error,
    dismissError: () => setError(null),
  };
};
