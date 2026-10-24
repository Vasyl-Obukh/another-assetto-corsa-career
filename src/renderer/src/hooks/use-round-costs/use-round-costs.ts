import { useEffect, useMemo, useState } from 'react';

import type { RoundCosts } from './types.ts';
import type { Career, SeriesListing } from '../../../../shared/types';
import { useSettings, useSlot } from '@/app';
import { invoke } from '@/lib/ipc';

export type { RoundCosts } from './types.ts';

/**
 * The key a class's cost is held under.
 * @param series The championship's id
 * @param entry The class entry's id
 * @returns The key
 */
const costKey = (series: string, entry: string): string => `${series}\u0000${entry}`;

/**
 * What a round of each class costs the open career, asked of main again
 * whenever the career, the library or a car's price changes - a car bought, the
 * clock moved or a championship edited all move the answer.
 * @param listings The library, which only says when to ask again
 * @returns The costs, or null outside a career
 */
export const useRoundCosts = (listings: readonly SeriesListing[]): RoundCosts | null => {
  const { mode, career } = useSlot();
  const { settings: { carPrices } } = useSettings();
  // Held with the career they were read for, so they are never set against
  // money they were not read beside.
  const [costs, setCosts] = useState<{ career: Career; byClass: ReadonlyMap<string, number> } | null>(null);
  const inCareer = mode === 'career' && career !== null;

  useEffect(() => {
    if (!inCareer) return undefined;
    let live = true;

    // A failure leaves every class passing, as it does while the costs are on
    // their way, rather than raising an error of its own.
    invoke('career:roundCosts', undefined).then(
      (next) => {
        if (!live) return;
        setCosts({ career, byClass: new Map(next.map((one) => [costKey(one.series, one.entry), one.cost])) });
      },
      () => { if (live) setCosts(null); },
    );

    return () => { live = false; };
  }, [inCareer, career, listings, carPrices]);

  return useMemo(() => {
    if (!inCareer) return null;
    const byClass = costs?.career === career ? costs.byClass : null;

    return {
      affordable: (series: string, entry: string) => {
        if (!byClass) return true;
        const cost = byClass.get(costKey(series, entry));

        return cost !== undefined && cost <= career.money;
      },
    };
  }, [inCareer, career, costs]);
};
