import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RUNG_LANE, RUNG_LIST_HEIGHT } from './constants.ts';
import { RungCard } from './RungCard.tsx';
import type { Rung } from './types.ts';
import { opensWith } from './utils.ts';
import type { Discipline } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface LadderCellProps {
  /**
   * Every championship at this rung, in list order.
   */
  rungs: readonly Rung[];
  /**
   * Whether the career may not enter this rung yet.
   */
  locked?: boolean;
  /**
   * Whether only what is open is shown, so a locked rung says what opens it
   * in place of its championships.
   */
  folded?: boolean;
  /**
   * The discipline its row is.
   */
  discipline: Discipline;
  /**
   * The rung its column is.
   */
  tier: number;
}

export const LadderCell = ({
  rungs, locked = false, folded = false, discipline, tier,
}: LadderCellProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const hidden = locked && folded;
  const opens = locked ? opensWith(discipline, tier, t, formatNumber) : '';

  return (
    <div
      className={cn(
        'flex min-h-24 flex-col gap-2 border-t border-l p-2.5',
        RUNG_LANE[discipline],
        // A rung nobody races at is hatched rather than blank, so a gap in the
        // ladder reads as one rather than as a cell that failed to load.
        (rungs.length === 0 || hidden)
          && 'bg-[repeating-linear-gradient(135deg,transparent_0_8px,color-mix(in_oklch,var(--border)_50%,transparent)_8px_9px)]',
      )}
    >
      {hidden ? (
        <div className="flex flex-col gap-1 rounded-lg border border-dashed bg-card/70 p-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <LockIcon className="size-3.5" />
            {t('championships.ladder.locked')}
          </span>
          {opens}
        </div>
      ) : null}

      {/* The padding, given back by the margin, keeps a focused card's ring
          clear of the scroller's edge. */}
      {hidden || rungs.length === 0 ? null : (
        <div className={cn('-m-1 flex flex-col gap-2 overflow-y-auto p-1', RUNG_LIST_HEIGHT)}>
          {rungs.map((rung) => (
            <RungCard
              key={rung.listing.series.id}
              rung={rung}
              locked={locked ? opens : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
