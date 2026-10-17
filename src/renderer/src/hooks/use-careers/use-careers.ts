import { useCallback, useEffect, useState } from 'react';

import type { CareersState } from './types.ts';
import type { CareerSummary } from '../../../../shared/types';
import { useSlot } from '@/app';
import { invoke, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { CareersState } from './types.ts';

/**
 * Loads every career on disk, and runs the commands the start screen and the
 * Careers list run on them. Read on mount rather than kept current by a push:
 * the list only changes from these two pages, and each reads it as it opens.
 * @returns The careers and their commands
 */
export const useCareers = (): CareersState => {
  const { openCareer } = useSlot();
  const [careers, setCareers] = useState<readonly CareerSummary[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  useEffect(() => {
    let live = true;
    invoke('career:list', undefined).then(
      (next) => { if (live) setCareers(next); },
      (thrown: unknown) => { if (live) setError(toDisplayableError(thrown)); },
    );

    return () => { live = false; };
  }, []);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param command What to run
   * @returns Whether it worked
   */
  const run = useCallback(async (command: () => Promise<void>): Promise<boolean> => {
    setBusy(true);
    try {
      await command();
      setError(null);

      return true;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return false;
    } finally {
      setBusy(false);
    }
  }, []);

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
  };
};
