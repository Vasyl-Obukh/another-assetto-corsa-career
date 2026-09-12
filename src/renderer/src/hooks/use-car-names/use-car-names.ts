import { useCallback, useEffect, useState } from 'react';

import { NAME_LIMIT } from './constants.ts';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * Names every installed car out of a list of folder IDs.
 *
 * A championship carries folder IDs - `ks_mazda_mx5_cup` is what the document
 * says and what race.ini wants - and an eligibility list, a balance-of-
 * performance table and a pinned seat all show them. One call answers all of
 * them, because CarQuery takes an `ids` filter; the track side has no such
 * filter, which is why the calendar still shows track keys.
 *
 * Failures are swallowed and an unresolved id falls back to itself, which is
 * also what a car that is not installed comes back as - and the availability
 * badges already say that it is missing.
 * @param ids The cars to name
 * @returns A function naming one car, giving back the id when it cannot
 */
export const useCarNames = (ids: readonly string[]): ((car: string) => string) => {
  const [names, setNames] = useState<ReadonlyMap<string, string>>(new Map());
  const [nonce, setNonce] = useState(0);
  // Sorted and joined rather than passed as an array, so the effect re-runs
  // when the *set* changes: the editor rebuilds its draft on every keystroke,
  // so the array's identity changes constantly and its contents rarely.
  const key = [...ids].sort().join(',');

  useEffect(() => {
    const wanted = key === '' ? [] : key.split(',');
    // An empty `ids` is no filter rather than no cars, so asking for none would
    // come back with the first page of the whole library. Whatever was resolved
    // before is left in place rather than cleared: nameOf is only ever asked
    // about a car the document still names.
    if (wanted.length === 0) return undefined;

    let live = true;
    invoke('content:cars', { ids: wanted, limit: NAME_LIMIT }).then(
      (page) => {
        if (live) setNames(new Map(page.items.map((car) => [car.id, car.name])));
      },
      () => { /* an uninstalled car has no name, which is what the fallback says */ },
    );

    return () => { live = false; };
  }, [key, nonce]);

  // A car installed while the editor is open should start reading as itself.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return useCallback((car: string) => names.get(car) ?? car, [names]);
};
