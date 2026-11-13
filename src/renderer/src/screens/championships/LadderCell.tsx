import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RUNG_LANE, RUNGS_SHOWN } from './constants.ts';
import { RungCard } from './RungCard.tsx';
import type { Rung } from './types.ts';
import { opensWith } from './utils.ts';
import type { Discipline } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
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
  const [open, setOpen] = useState(false);
  const hidden = locked && folded;
  const extra = rungs.length - RUNGS_SHOWN;
  const shown = open ? rungs : rungs.slice(0, RUNGS_SHOWN);
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

      {hidden ? null : shown.map((rung) => (
        <RungCard
          key={`${rung.listing.series.id}/${rung.entry.id}`}
          rung={rung}
          locked={locked ? opens : undefined}
        />
      ))}

      {!hidden && extra > 0 ? (
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start px-1 py-0.5"
          onClick={() => setOpen(!open)}
        >
          {open ? t('championships.ladder.fewer') : t('championships.ladder.more', { count: extra })}
        </Button>
      ) : null}
    </div>
  );
};
