import { useEffect, useState } from 'react';

import type { ResultsState } from './types.ts';
import type { ResultRecord } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { ResultsState } from './types.ts';

/**
 * Loads every archived result, newest first.
 *
 * Refreshed on race:changed rather than on a timer: a launch settling is the
 * only thing that ever adds one, and that is exactly what main pushes.
 * @returns The records and what is stopping them loading
 */
export const useResults = (): ResultsState => {
  const [records, setRecords] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DisplayableError | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;

    invoke('race:results', undefined).then(
      (next) => { if (live) { setRecords(next); setLoading(false); } },
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
    records,
    loading,
    error,
    dismissError: () => setError(null),
  };
};
