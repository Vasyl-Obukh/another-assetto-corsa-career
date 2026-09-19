import { useEffect, useState } from 'react';

import { CAR_LIMIT } from './constants.ts';
import type { Car } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * Looks up every installed car out of a list of folder IDs.
 *
 * A championship carries folder IDs - `ks_mazda_mx5_cup` is what the document
 * says and what race.ini wants - and the screens showing one want the car
 * behind each: its name for an eligibility list or a balance-of-performance
 * table, its liveries for a picture. One call answers all of them, because
 * CarQuery takes an `ids` filter.
 *
 * Failures are swallowed and an id that does not resolve is simply absent,
 * which is also what a car that is not installed comes back as - and the
 * availability badges already say that it is missing.
 * @param ids The cars to look up
 * @returns The installed ones, by folder ID
 */
export const useCars = (ids: readonly string[]): ReadonlyMap<string, Car> => {
  const [cars, setCars] = useState<ReadonlyMap<string, Car>>(new Map());
  const [nonce, setNonce] = useState(0);
  // Sorted and joined rather than passed as an array, so the effect re-runs
  // when the *set* changes: the editor rebuilds its draft on every keystroke,
  // so the array's identity changes constantly and its contents rarely.
  const key = [...ids].sort().join(',');

  useEffect(() => {
    const wanted = key === '' ? [] : key.split(',');
    // An empty `ids` is no filter rather than no cars, so asking for none would
    // come back with the first page of the whole library. Whatever was resolved
    // before is left in place rather than cleared: callers only ever look up a
    // car they still name.
    if (wanted.length === 0) return undefined;

    let live = true;
    invoke('content:cars', { ids: wanted, limit: CAR_LIMIT }).then(
      (page) => {
        if (live) setCars(new Map(page.items.map((car) => [car.id, car])));
      },
      () => { /* an uninstalled car resolves to nothing, which callers expect */ },
    );

    return () => { live = false; };
  }, [key, nonce]);

  // A car installed while the screen is open should start reading as itself.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return cars;
};
