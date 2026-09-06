import { useCallback, useEffect, useState } from 'react';

import type { ChampionshipLoad, ChampionshipState } from './types.ts';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { ChampionshipState } from './types.ts';

/**
 * Loads one championship, and sets one of its rounds up to be raced.
 *
 * Entering a round is a command rather than a patch: main lowers the round into
 * a race definition and hands it to the race store, which validates it and
 * refuses while a launch is in flight. That refusal travels back here and is
 * rendered like any other, rather than being second-guessed before it is sent.
 * @param id The championship's id, from the route
 * @returns The listing, what is stopping it loading, and the enter action
 */
export const useChampionship = (id: string): ChampionshipState => {
  const [nonce, setNonce] = useState(0);
  const [load, setLoad] = useState<ChampionshipLoad>({ key: '', listing: null });
  const [error, setError] = useState<DisplayableError | null>(null);
  const [busy, setBusy] = useState(false);

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
  // screen is open changes what it should be saying.
  useEffect(() => subscribe('content:changed', () => setNonce((prev) => prev + 1)), []);

  const enterRound = useCallback(
    async (entry: string, round: string, car: string, skin?: string): Promise<boolean> => {
      setBusy(true);
      try {
        await invoke('series:setupRound', {
          series: id, entry, round, car: { model: car, skin },
        });
        setError(null);

        return true;
      } catch (thrown: unknown) {
        setError(toDisplayableError(thrown));

        return false;
      } finally {
        setBusy(false);
      }
    },
    [id],
  );

  return {
    listing: load.listing,
    loading: load.key !== key,
    busy,
    error,
    dismissError: () => setError(null),
    enterRound,
  };
};
