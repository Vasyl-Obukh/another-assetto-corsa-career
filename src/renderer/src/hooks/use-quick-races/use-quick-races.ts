import { useCallback, useEffect, useState } from 'react';

import type { QuickRacesState } from './types.ts';
import type { QuickRaceView } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { QuickRacesState } from './types.ts';

/**
 * Loads every race weekend of the player's own and keeps the list current.
 * @returns The races and the commands the list runs on them
 */
export const useQuickRaces = (): QuickRacesState => {
  const [races, setRaces] = useState<readonly QuickRaceView[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);

  const load = useCallback((): (() => void) => {
    let live = true;
    invoke('quick:list', undefined).then(
      (next) => { if (live) setRaces(next); },
      (thrown: unknown) => { if (live) setError(toDisplayableError(thrown)); },
    );

    return () => { live = false; };
  }, []);

  useEffect(load, [load]);
  // The push carries the whole list, so nothing needs asking for again.
  useEffect(() => subscribe('quick:changed', setRaces), []);
  useEffect(() => subscribe('content:changed', () => { load(); }), [load]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param command What to run
   * @returns What it answered, or null when it failed
   */
  const run = useCallback(async <T>(command: () => Promise<T>): Promise<T | null> => {
    setBusy(true);
    try {
      const answer = await command();
      setError(null);

      return answer;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    races,
    busy,
    error,
    dismissError: () => setError(null),
    create: async () => (await run(() => invoke('quick:create', undefined)))?.race.id ?? null,
    duplicate: async (id) => { await run(() => invoke('quick:duplicate', { id })); },
    remove: async (id) => { await run(() => invoke('quick:remove', { id })); },
  };
};
