import { useEffect, useState } from 'react';

import type { RaceContent, ResolvedContent } from './types.ts';
import { useInstalledTrack } from '../use-installed-track/index.ts';
import { useWeatherContent } from '../use-weather-content/index.ts';
import { invoke, subscribe } from '@/lib/ipc';

export type { RaceContent } from './types.ts';

/**
 * Resolves the track and the car a race names into things with names.
 *
 * A race carries folder IDs, which is what race.ini wants and nobody wants to
 * read. Failures are swallowed: content that is not installed already appears
 * in the race's own problem list. Each answer is stamped with the key it was
 * fetched for, so the previous car never flashes under a new one.
 * @param track The layout the race names, or null while it names none
 * @param car The player's car's folder ID, or null while it names none
 * @returns The named content, empty until the answers arrive
 */
export const useRaceContent = (
  track: { id: string; layout?: string } | null,
  car: string | null,
): RaceContent => {
  const [resolved, setResolved] = useState<ResolvedContent>({ carId: '', car: null });
  const [nonce, setNonce] = useState(0);
  const { weather, controllers } = useWeatherContent();
  const installed = useInstalledTrack(track);
  const carId = car ?? '';

  useEffect(() => {
    if (carId === '') return undefined;

    let live = true;
    invoke('content:car', { id: carId }).then(
      (found) => { if (live) setResolved({ carId, car: found }); },
      () => { /* the setup's problem list already says the car is missing */ },
    );

    return () => { live = false; };
  }, [carId, nonce]);

  // Content installed while the screen is open should show up. The track and
  // the weather are their own hooks' business.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return {
    track: installed,
    car: resolved.carId === carId ? resolved.car : null,
    weather,
    controllers,
  };
};
