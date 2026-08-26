import { useEffect, useMemo, useState } from 'react';

import type { CarDetail, CarState } from './types.ts';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { CarDetail } from './types.ts';

/**
 * Loads one car and narrows its liveries by a search.
 *
 * The liveries are filtered here rather than in main: a car holds at most a few
 * hundred of them and they all arrive with the car, so a query channel would be
 * paging a list that is already in hand.
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
  const [search, setSearch] = useState('');

  const loading = state.key !== key;

  useEffect(() => {
    let live = true;

    invoke('content:car', { id }).then(
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

  const terms = useMemo(() => searchTerms(search), [search]);
  const skins = useMemo(
    () => (state.car?.skins ?? []).filter(
      (skin) => matchesTerms(terms, [skin.name, skin.id, skin.driver, skin.team, skin.number]),
    ),
    [state.car, terms],
  );

  return {
    car: state.car,
    loading,
    missing: !loading && state.error === null && state.car === null,
    error: state.error,
    search,
    skins,
    setSearch,
    clear: () => setSearch(''),
    dismissError: () => setState((prev) => ({ ...prev, error: null })),
  };
};
