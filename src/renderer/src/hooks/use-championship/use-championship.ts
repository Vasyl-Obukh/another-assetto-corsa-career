import { useEffect, useState } from 'react';

import type { ChampionshipLoad, ChampionshipState } from './types.ts';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { ChampionshipState } from './types.ts';

/**
 * Loads one championship, and keeps it current as the library and the install
 * move.
 * @param id The championship's id, from the route
 * @returns The listing, and what is stopping it loading
 */
export const useChampionship = (id: string): ChampionshipState => {
  const [nonce, setNonce] = useState(0);
  const [load, setLoad] = useState<ChampionshipLoad>({ key: '', listing: null });
  const [error, setError] = useState<DisplayableError | null>(null);

  const key = `${nonce}:${id}`;

  useEffect(() => {
    let live = true;

    invoke('series:get', { id }).then(
      (listing) => { if (live) { setLoad({ key, listing }); setError(null); } },
      (thrown: unknown) => {
        if (live) { setLoad({ key, listing: null }); setError(toDisplayableError(thrown)); }
      },
    );

    return () => { live = false; };
  }, [id, key]);

  // Availability is a fact about the library, so installing a mod while this
  // screen is open changes what it should say, and so does a command written
  // anywhere else. This screen wants one championship out of the pushed
  // library rather than the library itself, so it re-reads either way.
  useEffect(() => subscribe('content:changed', () => setNonce((prev) => prev + 1)), []);
  useEffect(() => subscribe('series:changed', () => setNonce((prev) => prev + 1)), []);

  return {
    listing: load.listing,
    loading: load.key !== key,
    error,
    dismissError: () => setError(null),
  };
};
