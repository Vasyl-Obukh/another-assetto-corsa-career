import { useEffect, useState } from 'react';

import type { LatestResultsState } from './types.ts';
import type { LatestResults } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { LatestResultsState } from './types.ts';

/**
 * Loads the newest event's archived results, for a preview that would
 * otherwise read every archive the Results page lists.
 *
 * Refreshed on race:changed, as useResults is: a launch settling is the only
 * thing that ever adds an archive.
 * @returns The records, the archive count and what is stopping them loading
 */
export const useLatestResults = (): LatestResultsState => {
  const [latest, setLatest] = useState<LatestResults>({ records: [], sessions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DisplayableError | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;

    invoke('race:latest', undefined).then(
      (next) => { if (live) { setLatest(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [nonce]);

  useEffect(() => subscribe('race:changed', () => setNonce((n) => n + 1)), []);

  return {
    ...latest,
    loading,
    error,
    dismissError: () => setError(null),
  };
};
