import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import type { QuickRaceState } from './types.ts';
import type { QuickRace, QuickRaceView } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { QuickRaceState } from './types.ts';

/**
 * Loads one race event of the player's own and keeps it current.
 *
 * An edit shows at once and is saved behind it, every keystroke a whole race:
 * only the answer to the latest save is taken, so a slow early one can never
 * put back what was typed after it, and a push arriving while saves are still
 * out is left for the save's own answer to supersede.
 * @param id The race's id
 * @returns The race and the commands its page runs on it
 */
export const useQuickRace = (id: string): QuickRaceState => {
  const [view, setView] = useState<QuickRaceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);
  const saving = useRef(0);
  const latest = useRef(0);

  const load = useCallback((): (() => void) => {
    let live = true;
    invoke('quick:get', { id }).then(
      (next) => { if (live) { setView(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [id]);

  useEffect(load, [load]);
  useEffect(() => subscribe('quick:changed', (races) => {
    if (saving.current > 0) return;
    const own = races.find((one) => one.race.id === id);
    if (own) setView(own);
  }), [id]);
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

  const edit = useCallback((race: QuickRace): void => {
    setView((now) => (now ? { ...now, race } : now));
    latest.current += 1;
    const asked = latest.current;
    saving.current += 1;
    invoke('quick:save', race).then(
      (next) => { if (asked === latest.current) { setView(next); setError(null); } },
      (thrown: unknown) => { if (asked === latest.current) setError(toDisplayableError(thrown)); },
    ).finally(() => { saving.current -= 1; });
  }, []);

  return {
    view,
    loading,
    busy,
    error,
    dismissError: () => setError(null),
    edit,
    launch: () => run(() => invoke('quick:launch', { id })),
    cancel: () => run(() => invoke('race:cancel', undefined)),
    restart: () => run(() => invoke('quick:restart', { id })),
  };
};
