import { useEffect, useState } from 'react';

import type { TrackDetail, TrackState } from './types.ts';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

/**
 * Loads one circuit with all its layouts, and loads it again whenever the
 * library changes under it - the track page's twin of useCarDetail.
 * @param id The circuit's folder name, from the route
 * @returns The current state and the actions the screen binds to
 */
export const useTrackDetail = (id: string): TrackDetail => {
  const [nonce, setNonce] = useState(0);
  const key = `${nonce}:${id}`;

  const [state, setState] = useState<TrackState>({ key: '', circuit: null, error: null });

  const loading = state.key !== key;

  useEffect(() => {
    let live = true;

    invoke('content:circuit', { id }).then(
      (circuit) => { if (live) setState({ key, circuit, error: null }); },
      (thrown: unknown) => {
        if (live) setState({ key, circuit: null, error: toDisplayableError(thrown) });
      },
    );

    return () => { live = false; };
  }, [key, id]);

  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return {
    circuit: state.circuit,
    loading,
    missing: !loading && state.error === null && state.circuit === null,
    error: state.error,
    dismissError: () => setState((prev) => ({ ...prev, error: null })),
  };
};
