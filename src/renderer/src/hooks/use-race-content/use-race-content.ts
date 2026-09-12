import { useEffect, useState } from 'react';

import type { RaceContent, ResolvedContent } from './types.ts';
import type { RaceDefinition } from '../../../../shared/types';
import { useWeatherContent } from '../use-weather-content/index.ts';
import { invoke, subscribe } from '@/lib/ipc';

export type { RaceContent } from './types.ts';

/**
 * Resolves what a race definition points at into things with names.
 *
 * The definition carries folder IDs, which is what race.ini wants and nobody
 * wants to read. Failures are swallowed: content that is not installed already
 * appears in the setup's own problem list. Each answer is stamped with the key
 * it was fetched for, so the previous track never flashes under a new one.
 * @param definition The race being set up, or null before it has loaded
 * @returns The named content, empty until the answers arrive
 */
export const useRaceContent = (definition: RaceDefinition | null): RaceContent => {
  const [resolved, setResolved] = useState<ResolvedContent>({
    trackKey: '', track: null, carId: '', car: null,
  });
  const [nonce, setNonce] = useState(0);
  const { weather, controllers } = useWeatherContent();

  const { id, layout } = definition?.track ?? { id: '', layout: undefined };
  const trackKey = layout ? `${id}/${layout}` : id;
  const carId = definition?.playerCar.model ?? '';

  useEffect(() => {
    if (trackKey === '') return undefined;

    let live = true;
    invoke('content:track', { key: trackKey }).then(
      (track) => { if (live) setResolved((prev) => ({ ...prev, trackKey, track })); },
      () => { /* the setup's problem list already says the track is missing */ },
    );

    return () => { live = false; };
  }, [trackKey, nonce]);

  useEffect(() => {
    if (carId === '') return undefined;

    let live = true;
    invoke('content:car', { id: carId }).then(
      (car) => { if (live) setResolved((prev) => ({ ...prev, carId, car })); },
      () => { /* likewise for the car */ },
    );

    return () => { live = false; };
  }, [carId, nonce]);

  // Content installed while the screen is open should show up. The weather half
  // of that is useWeatherContent's own business.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return {
    track: resolved.trackKey === trackKey ? resolved.track : null,
    car: resolved.carId === carId ? resolved.car : null,
    weather,
    controllers,
  };
};
