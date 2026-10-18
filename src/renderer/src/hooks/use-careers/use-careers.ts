import { useCallback, useEffect, useState } from 'react';

import type { CareersState } from './types.ts';
import type { CareerKind, CareerListing } from '../../../../shared/types';
import { useSlot } from '@/app';
import { invoke, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { CareersState } from './types.ts';

/**
 * Loads every career of one kind on disk, and runs the commands the start
 * screen and the Careers and Championships lists run on them. Read on mount
 * rather than kept current by a push: the list only changes from these pages,
 * and each reads it as it opens.
 * @param kind Careers, or standalone championships
 * @returns The careers and their commands
 */
export const useCareers = (kind: CareerKind): CareersState => {
  const { openCareer } = useSlot();
  const [careers, setCareers] = useState<readonly CareerListing[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  useEffect(() => {
    let live = true;
    invoke('career:list', { kind }).then(
      (next) => { if (live) setCareers(next); },
      (thrown: unknown) => { if (live) setError(toDisplayableError(thrown)); },
    );

    return () => { live = false; };
  }, [kind]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param command What to run
   * @returns What it answered, or undefined when it failed and the failure is
   * shown
   */
  const attempt = useCallback(async <T>(command: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    try {
      const answer = await command();
      setError(null);

      return answer;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);

  /**
   * Runs one command that answers nothing.
   * @param command What to run
   * @returns Whether it worked
   */
  const run = useCallback(async (command: () => Promise<void>): Promise<boolean> => (
    await attempt(async () => { await command(); return true; }) ?? false
  ), [attempt]);

  return {
    careers,
    busy,
    error,
    dismissError: () => setError(null),
    open: (id) => run(() => openCareer(id)),
    remove: async (id) => {
      await run(async () => { setCareers(await invoke('career:delete', { id })); });
    },
    showFolder: async (id) => {
      await run(async () => { await invoke('career:folder', { id }); });
    },
    backup: async (id) => await attempt(() => invoke('career:backup', { id })) ?? null,
    openBackup: async () => await attempt(() => invoke('career:openBackup', { kind })) ?? null,
    restore: async (file, replace) => {
      const restored = await attempt(() => invoke('career:restore', { file, replace }));
      if (!restored) return null;
      setCareers(restored.careers);

      return restored.id;
    },
  };
};
