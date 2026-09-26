import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { TierMedal } from './TierMedal.tsx';
import { tierMetalKey } from './utils.ts';

interface LadderGridProps {
  /**
   * The tiers to head a column each, left to right.
   */
  tiers: readonly number[];
  /**
   * The rows: a discipline's heading cell, then a cell per tier.
   */
  children: ReactNode;
}

// The ladder's grid under its tier headings: a column for the disciplines' own
// headings, then a column per tier.
export const LadderGrid = ({ tiers, children }: LadderGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid" style={{ gridTemplateColumns: `9rem repeat(${tiers.length}, minmax(15rem, 1fr))` }}>
      <div />
      {tiers.map((tier) => (
        <div key={tier} className="flex items-center gap-2.5 border-l px-3.5 py-3">
          <TierMedal tier={tier} />
          <span className="text-sm font-medium">{t(tierMetalKey(tier))}</span>
        </div>
      ))}
      {children}
    </div>
  );
};
