import { useCallback, useEffect, useState } from 'react';

import type { RoundForecast } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * Loads every round's forecast for one championship.
 *
 * Asked again whenever what it is drawn over can have moved - the user's
 * settings, the installed weather, or the championship itself. A forecast that
 * fails to load shows nothing rather than an error: it decorates a calendar
 * that is perfectly usable without it.
 * @param id The championship's id, or undefined while there is none
 * @returns One forecast per round, empty while loading or when not generated
 */
export const useForecast = (id: string | undefined): readonly RoundForecast[] => {
  // Held beside the id it answered, so a forecast for the championship just
  // left is never shown against the one just opened.
  const [loaded, setLoaded] = useState<{ id: string; forecasts: readonly RoundForecast[] } | null>(null);

  const load = useCallback((): (() => void) => {
    let live = true;
    if (id === undefined) return () => { live = false; };

    invoke('series:forecast', { series: id }).then(
      (forecasts) => { if (live) setLoaded({ id, forecasts }); },
      () => { if (live) setLoaded({ id, forecasts: [] }); },
    );

    return () => { live = false; };
  }, [id]);

  useEffect(load, [load]);
  useEffect(() => subscribe('settings:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('content:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('series:changed', () => { load(); }), [load]);

  return loaded !== null && loaded.id === id ? loaded.forecasts : [];
};
