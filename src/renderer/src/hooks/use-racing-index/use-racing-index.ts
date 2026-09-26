import { useMemo } from 'react';

import type { SeriesListing } from '../../../../shared/types';
import { useChampionships } from '../use-championships/index.ts';
import { useClasses } from '@/app';
import { racingIndex } from '@/lib/racing-index';
import type { RacingIndex } from '@/lib/racing-index';

/**
 * Where every car and circuit races, over the championships a predicate keeps.
 * @param keep Which championships count - the caller's, so this hook need not
 *   know which page lists what
 * @returns The index, or null until the library has loaded
 */
export const useRacingIndex = (keep: (listing: SeriesListing) => boolean): RacingIndex | null => {
  const { listings, loading } = useChampionships();
  const { catalogue } = useClasses();

  // The predicate is rebuilt by its caller on every render, so the list it
  // keeps is what the index follows.
  const kept = listings.filter(keep);
  const key = kept.map((listing) => listing.series.id).join('\n');

  // eslint-disable-next-line react-hooks/exhaustive-deps -- key stands in for kept
  return useMemo(() => (loading ? null : racingIndex(kept, catalogue)), [key, loading, catalogue, listings]);
};
