import { useEffect, useState } from 'react';

import type { SpecId } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * How many cars of each spec the library holds - the car browser's own facet
 * counts, over no filter at all.
 * @param active Whether to ask at all, so a closed picker asks nothing
 * @returns The counts by spec, or null before the first answer
 */
export const useSpecCounts = (active: boolean): ReadonlyMap<SpecId, number> | null => {
  const [counts, setCounts] = useState<ReadonlyMap<SpecId, number> | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    let live = true;
    invoke('content:carFacets', { query: {} }).then(
      (facets) => { if (live) setCounts(new Map(facets.specs.map((one) => [one.value, one.count]))); },
      () => { /* no counts reads as nothing installed, which the tiles say */ },
    );

    return () => { live = false; };
  }, [active, nonce]);

  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return counts;
};
