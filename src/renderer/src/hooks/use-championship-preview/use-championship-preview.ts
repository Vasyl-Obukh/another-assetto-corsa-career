import { useEffect, useState } from 'react';

import type { ChampionshipPreview } from '../../../../shared/types';
import { invoke } from '@/lib/ipc';

/**
 * Dates a championship's rounds as a standalone championship would race them
 * in a year, for New championship to show before anything is made.
 * @param series The championship's id, or null while none is picked
 * @param year The year
 * @returns Each round's race day; undefined while they are read, and null when
 * there is nothing to read or they could not be - which leaves the calendar
 * undated rather than in the way
 */
export const useChampionshipPreview = (
  series: string | null,
  year: number,
): ChampionshipPreview | null | undefined => {
  const [answer, setAnswer] = useState<{
    series: string;
    year: number;
    preview: ChampionshipPreview | null;
  } | null>(null);

  useEffect(() => {
    if (series === null) return undefined;

    let live = true;
    invoke('career:preview', { series, year }).then(
      (preview) => { if (live) setAnswer({ series, year, preview }); },
      () => { if (live) setAnswer({ series, year, preview: null }); },
    );

    return () => { live = false; };
  }, [series, year]);

  if (series === null) return null;

  // Only the answer for what is asked now: a year typed over its last answer
  // waits for its own rather than showing the one before.
  return answer?.series === series && answer.year === year ? answer.preview : undefined;
};
