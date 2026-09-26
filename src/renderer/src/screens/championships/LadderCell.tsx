import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RUNGS_SHOWN } from './constants.ts';
import { RungCard } from './RungCard.tsx';
import type { Rung } from './types.ts';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface LadderCellProps {
  /**
   * Every championship at this rung, in list order.
   */
  rungs: readonly Rung[];
}

export const LadderCell = ({ rungs }: LadderCellProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const folded = rungs.length - RUNGS_SHOWN;
  const shown = open ? rungs : rungs.slice(0, RUNGS_SHOWN);

  return (
    <div
      className={cn(
        'flex min-h-24 flex-col gap-2 border-t border-l p-2.5',
        // A rung nobody races at is hatched rather than blank, so a gap in the
        // ladder reads as one rather than as a cell that failed to load.
        rungs.length === 0
          && 'bg-[repeating-linear-gradient(135deg,transparent_0_8px,color-mix(in_oklch,var(--border)_50%,transparent)_8px_9px)]',
      )}
    >
      {shown.map((rung) => (
        <RungCard key={`${rung.listing.series.id}/${rung.entry.id}`} rung={rung} />
      ))}

      {folded > 0 ? (
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start px-1 py-0.5"
          onClick={() => setOpen(!open)}
        >
          {open ? t('championships.ladder.fewer') : t('championships.ladder.more', { count: folded })}
        </Button>
      ) : null}
    </div>
  );
};
