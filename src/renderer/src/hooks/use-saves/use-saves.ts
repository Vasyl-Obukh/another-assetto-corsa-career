import { useCallback, useEffect, useState } from 'react';

import type { SavesState } from './types.ts';
import type { SaveSummary } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Reads a career's saves and keeps them current: main pushes them whenever one
 * is written, an autosave included, which nothing here asked for.
 * @param career The career's id, or null for none
 * @returns The saves and their commands
 */
export const useSaves = (career: string | null): SavesState => {
  // Held with the career they were read for, so switching careers shows
  // nothing rather than the last one's saves until the new ones arrive.
  const [held, setHeld] = useState<{ career: string; saves: readonly SaveSummary[] } | null>(null);
  const [busy, setBusy] = useState(false);
  // Held with its career too, so one career's failure is never shown over
  // another's saves.
  const [failure, setFailure] = useState<{ career: string; error: DisplayableError } | null>(null);

  useEffect(() => {
    if (career === null) return undefined;

    let live = true;
    invoke('career:saves', { id: career }).then(
      (saves) => { if (live) setHeld({ career, saves }); },
      (thrown: unknown) => { if (live) setFailure({ career, error: toDisplayableError(thrown) }); },
    );
    const off = subscribe('career:savesChanged', (next) => {
      if (next.career === career) setHeld({ career, saves: next.saves });
    });

    return () => {
      live = false;
      off();
    };
  }, [career]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param command What to run, answering with the career's saves
   * @returns Whether it worked
   */
  const run = useCallback(async (command: (id: string) => Promise<readonly SaveSummary[]>): Promise<boolean> => {
    if (career === null) return false;

    setBusy(true);
    try {
      setHeld({ career, saves: await command(career) });
      setFailure(null);

      return true;
    } catch (thrown: unknown) {
      setFailure({ career, error: toDisplayableError(thrown) });

      return false;
    } finally {
      setBusy(false);
    }
  }, [career]);

  return {
    saves: held?.career === career ? held.saves : null,
    busy,
    error: failure?.career === career ? failure.error : null,
    dismissError: () => setFailure(null),
    save: (name, over) => run(() => invoke('career:save', { name, over })),
    quickSave: () => run(() => invoke('career:quickSave', undefined)),
    rename: (save, name) => run((id) => invoke('career:renameSave', { id, save, name })),
    remove: (save) => run((id) => invoke('career:deleteSave', { id, save })),
    showFolder: async () => {
      if (career === null) return;
      try {
        await invoke('career:savesFolder', { id: career });
      } catch (thrown: unknown) {
        setFailure({ career, error: toDisplayableError(thrown) });
      }
    },
  };
};
