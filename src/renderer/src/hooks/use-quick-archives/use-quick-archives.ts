import { useEffect, useState } from 'react';

import type { QuickArchivesState } from './types.ts';
import type { QuickRaceArchives } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

export type { QuickArchivesState } from './types.ts';

/**
 * Loads which archives each race event of the player's own wrote, so a result
 * can be linked back to its race without planning every race to find out.
 *
 * Refreshed on quick:changed, which every launch of a race that lands pushes.
 * @returns The races' archives, and whether they are still loading
 */
export const useQuickArchives = (): QuickArchivesState => {
  const [archives, setArchives] = useState<readonly QuickRaceArchives[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;

    invoke('quick:archives', undefined).then(
      (next) => { if (live) { setArchives(next); setLoading(false); } },
      // Nothing to show for it: a result simply stays unlinked.
      () => { if (live) setLoading(false); },
    );

    return () => { live = false; };
  }, [nonce]);

  useEffect(() => subscribe('quick:changed', () => setNonce((n) => n + 1)), []);

  return { archives, loading };
};
