import { useEffect, useState } from 'react';

import type { CarDetail, CarState } from './types.ts';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { CarDetail } from './types.ts';

/**
 * Loads one car, and loads it again whenever the library changes under it.
 *
 * The loaded state carries the key it was built from, so `loading` is derived
 * during render rather than written by an effect - the same arrangement
 * usePagedContent uses, and for the same reason.
 * @param id The car's folder name, from the route
 * @returns The current state and the actions the screen binds to
 */
export const useCarDetail = (id: string): CarDetail => {
  const [nonce, setNonce] = useState(0);
  const key = `${nonce}:${id}`;

  const [state, setState] = useState<CarState>({ key: '', car: null, error: null });

  const loading = state.key !== key;

  useEffect(() => {
    let live = true;

    // Over everything installed, since Your content opens mods the library
    // does not hold yet.
    invoke('content:car', { id, installed: true }).then(
      (car) => { if (live) setState({ key, car, error: null }); },
      (thrown: unknown) => {
        if (live) setState({ key, car: null, error: toDisplayableError(thrown) });
      },
    );

    return () => { live = false; };
  }, [key, id]);

  // The car can change under the page - a livery added, or the folder removed -
  // and one car is cheap enough to simply read again.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return {
    car: state.car,
    loading,
    missing: !loading && state.error === null && state.car === null,
    error: state.error,
    dismissError: () => setState((prev) => ({ ...prev, error: null })),
  };
};
