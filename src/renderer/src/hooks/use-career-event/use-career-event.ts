import { useCallback, useEffect, useState } from 'react';

import type { CareerEventState } from './types.ts';
import type { CareerEventView } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { CareerEventState } from './types.ts';

/**
 * Loads one round of the career's season and keeps it current.
 *
 * Read again on every push that could change it: the career recording a
 * session, the race store moving between launching and waiting, the library or
 * the install changing what the round can run. None of them carry the view, so
 * each is only a signal to ask again.
 * @param series The championship's id, or an empty string to load nothing
 * @param round The round's id
 * @returns The round and the commands the page runs on it
 */
export const useCareerEvent = (series: string, round: string): CareerEventState => {
  const [view, setView] = useState<CareerEventView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);

  const load = useCallback((): (() => void) => {
    if (series === '') return () => undefined;

    let live = true;
    invoke('career:event', { series, round }).then(
      (next) => { if (live) { setView(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [series, round]);

  useEffect(load, [load]);
  useEffect(() => subscribe('career:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('race:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('series:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('content:changed', () => { load(); }), [load]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param command What to run
   * @returns Resolves once it has finished, whether or not it worked
   */
  const run = useCallback(async (command: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try {
      await command();
      setError(null);
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));
    } finally {
      setBusy(false);
      load();
    }
  }, [load]);

  return {
    view,
    loading,
    busy,
    error,
    dismissError: () => setError(null),
    enter: (entry, car) => run(() => invoke('career:enrol', { series, entry, car })),
    launch: (skip) => run(() => invoke('career:launch', { series, round, skip })),
  };
};
