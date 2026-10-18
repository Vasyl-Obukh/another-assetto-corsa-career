import { useState } from 'react';

import type { PendingSkip, SkipRound } from './types.ts';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, toDisplayableError } from '@/lib/ipc';

export type { PendingSkip, SkipRequest, SkipRound } from './types.ts';

/**
 * Skips a round the install cannot race, once the player has seen what it
 * costs. The career comes back through its own push, so a page reading it is
 * brought up to date without being told.
 * @param page Which page asks, as its route names it: moving to another keeps
 * the screen mounted, and a skip asked on one is never offered on the next
 * @returns The skip, and the one waiting on the player
 */
export const useSkipRound = (page: string): SkipRound => {
  const [pending, setPending] = useState<(PendingSkip & { page: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);
  const [shownOn, setShownOn] = useState(page);
  if (shownOn !== page) {
    setShownOn(page);
    setPending(null);
  }
  // An answer that lands after the page moved on is for the page it left.
  const shown = pending?.page === page ? pending : null;

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param send What to run
   */
  const run = (send: () => Promise<void>): void => {
    setBusy(true);
    send().then(
      () => { setError(null); },
      (thrown: unknown) => { setError(toDisplayableError(thrown)); },
    ).finally(() => { setBusy(false); });
  };

  return {
    ask: (request) => run(async () => {
      setPending({ ...request, rounds: await invoke('career:skipping', request), page });
    }),
    pending: shown,
    busy,
    error,
    dismissError: () => setError(null),
    confirm: () => {
      if (!shown) return;
      const { series, round, edition } = shown;
      run(async () => {
        // Closed either way, so a refusal is read on the page rather than
        // under the dialog.
        try {
          await invoke('career:skip', { series, round, edition });
        } finally {
          setPending(null);
        }
      });
    },
    cancel: () => setPending(null),
  };
};
