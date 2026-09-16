import { useCallback, useEffect, useState } from 'react';

import type { RoundForecast } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * Loads the forecast of the championship round a race was set up from.
 *
 * Main matches the race's id to its round, so a hand-authored race simply comes
 * back with none. Asked again when the settings, the installed weather or the
 * library move, for the same reasons useForecast is.
 * @param raceId The race definition's id, or undefined while there is none
 * @returns The round's forecast, or null when the race is no generated round
 */
export const useRaceForecast = (raceId: string | undefined): RoundForecast | null => {
  // Held beside the id it answered, so a race set up from another round never
  // shows the last one's forecast while its own is on the way.
  const [loaded, setLoaded] = useState<{ id: string; forecast: RoundForecast | null } | null>(null);

  const load = useCallback((): (() => void) => {
    let live = true;
    if (raceId === undefined) return () => { live = false; };

    invoke('series:raceForecast', { race: raceId }).then(
      (forecast) => { if (live) setLoaded({ id: raceId, forecast }); },
      () => { if (live) setLoaded({ id: raceId, forecast: null }); },
    );

    return () => { live = false; };
  }, [raceId]);

  useEffect(load, [load]);
  useEffect(() => subscribe('settings:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('content:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('series:changed', () => { load(); }), [load]);

  return loaded !== null && loaded.id === raceId ? loaded.forecast : null;
};
