import { useEffect, useState } from 'react';

import type { SeasonAvailability, SeasonListingState } from './types.ts';
import type { Championship, SeasonEntry, SeriesListing } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

export type { SeasonListingState } from './types.ts';

/**
 * The championship a page shows: the library's, or - for an edition the career
 * entered - the season's own copy, with what the install can race of it. The
 * copy is what the season races, so its rounds number as its events do, and it
 * is still there once the library's has been edited or deleted.
 * @param entry The edition entered, or null for one that was not
 * @param library The library's listing of the championship, or null when it
 * holds none
 * @returns The listing to show, and whether the copy is still being read
 */
export const useSeasonListing = (entry: SeasonEntry | null, library: SeriesListing | null): SeasonListingState => {
  const [nonce, setNonce] = useState(0);
  const [load, setLoad] = useState<SeasonAvailability | null>(null);
  // Keyed on the copy itself: a career push hands over a new object holding
  // the same championship, which needs no second read.
  const copy = entry ? JSON.stringify(entry.championship) : null;

  useEffect(() => {
    if (copy === null) return undefined;

    let live = true;
    const series = JSON.parse(copy) as Championship;
    Promise.all([invoke('series:place', { series }), invoke('series:validate', { series })]).then(
      ([placed, availability]) => { if (live) setLoad({ copy, series: placed, availability }); },
      () => { if (live) setLoad({ copy, series: null, availability: null }); },
    );

    return () => { live = false; };
  }, [copy, nonce]);

  // What the install can race changes with it, as the library's own listing does.
  useEffect(() => subscribe('content:changed', () => setNonce((prev) => prev + 1)), []);
  // A track chosen for a recommended layout moves what its rounds race.
  useEffect(() => subscribe('series:changed', () => setNonce((prev) => prev + 1)), []);

  if (!entry) return { listing: library, loading: false };
  // The answer for this copy is kept while a content change reads it again.
  if (load?.copy !== copy) return { listing: null, loading: true };
  if (!load.series || !load.availability) return { listing: library, loading: false };

  const { series, availability } = load;

  return {
    // Only a championship of the player's own can leave the library, so that
    // is what one it no longer holds was.
    listing: library ? { ...library, series, availability } : {
      series, availability, origin: 'user', activeByDefault: true, filler: false, event: null,
    },
    loading: false,
  };
};
