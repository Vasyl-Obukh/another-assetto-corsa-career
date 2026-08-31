import { useEffect, useState } from 'react';

import type { ResultDetail, ResultState } from './types.ts';
import { invoke, toDisplayableError } from '@/lib/ipc';

export type { ResultDetail } from './types.ts';

/**
 * Loads one archived result.
 *
 * An archive never changes once written, so unlike the content hooks there is
 * nothing to subscribe to: the only reason to read it again is the route
 * naming a different file.
 * @param file The archive's file name, from the route
 * @returns The record and what is stopping it loading
 */
export const useResult = (file: string): ResultDetail => {
  // Keyed by the file the state was loaded for, so the record of the previous
  // route is never rendered as this one's while the new read is in flight.
  const [state, setState] = useState<ResultState>({ key: '', record: null, error: null });

  const loading = state.key !== file;

  useEffect(() => {
    let live = true;

    invoke('race:result', { file }).then(
      (record) => { if (live) setState({ key: file, record, error: null }); },
      (thrown: unknown) => {
        if (live) setState({ key: file, record: null, error: toDisplayableError(thrown) });
      },
    );

    return () => { live = false; };
  }, [file]);

  return {
    record: state.record,
    loading,
    error: state.error,
    dismissError: () => setState((prev) => ({ ...prev, error: null })),
  };
};
