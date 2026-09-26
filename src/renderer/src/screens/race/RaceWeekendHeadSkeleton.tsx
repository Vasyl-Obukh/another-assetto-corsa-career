import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { QuickRacePhase } from '../../../../shared/types';
import { Shimmer } from '@/components';

interface RaceWeekendHeadSkeletonProps {
  /**
   * How far the weekend is expected to have got: started puts Start over
   * beside Launch, and finished leaves Start over alone.
   */
  phase: QuickRacePhase;
}

/**
 * A race weekend's header while it is read: its class chips, its title and the
 * line under it, and Launch with the line it writes beneath - all where the
 * header puts them, so nothing below moves when it lands.
 */
export const RaceWeekendHeadSkeleton = ({ phase }: RaceWeekendHeadSkeletonProps) => {
  const { t } = useTranslation();
  const started = phase !== 'setup';
  const finished = phase === 'finished';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Shimmer className="h-5.5 w-14" />
          <Shimmer className="h-5.5 w-16" />
        </div>
        <Shimmer className="my-1 h-6 w-72" />
        <div className="flex items-center gap-4">
          <Shimmer className="my-0.5 h-4 w-24" />
          <Shimmer className="my-0.5 h-4 w-14" />
          <Shimmer className="my-0.5 h-4 w-18" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          {started ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LockIcon className="size-3.5" />
                {t('race.launch.locked')}
              </span>
              <Shimmer className="h-9 w-28 rounded-md" />
            </>
          ) : null}
          {finished ? null : <Shimmer className="h-10 w-40 rounded-md" />}
        </div>
        {finished ? null : <Shimmer className="h-3 w-20" />}
      </div>
    </div>
  );
};
