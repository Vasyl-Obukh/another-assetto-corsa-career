import { useEffect, useState } from 'react';

import type { WeatherContent } from './types.ts';
import { invoke, subscribe } from '@/lib/ipc';

export type { WeatherContent } from './types.ts';

/**
 * Every weather preset and controller the install holds.
 *
 * Its own hook rather than part of use-race-content, because a conditions
 * dialog is opened from the series editor too - where there is no race
 * definition to resolve a track and a car out of. Failures are swallowed: the
 * menus stay empty, and whatever opened them already says why.
 * @returns The presets and controllers, empty until the answer arrives
 */
export const useWeatherContent = (): WeatherContent => {
  const [content, setContent] = useState<WeatherContent>({ weather: [], controllers: [] });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    invoke('content:weather', undefined).then(
      (next) => { if (live) setContent(next); },
      () => { /* the menus stay empty, and the screen says why */ },
    );

    return () => { live = false; };
  }, [nonce]);

  // Weather installed while the screen is open should show up in the menu.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return content;
};
