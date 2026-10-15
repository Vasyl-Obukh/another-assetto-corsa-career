import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RESULT_ROWS } from './constants.ts';
import {
  ClassificationTableSkeleton, CompactStandingsSkeleton, HistoricChip, Loading, PodiumSkeleton, Shimmer,
} from '@/components';
import { cn } from '@/lib/utils.ts';

interface ResultDetailSkeletonProps {
  /**
   * Whether the result is a race, which adds the start to the strip and the
   * podium over the table. Guessed true until the career says otherwise.
   */
  race: boolean;
  /**
   * Whether it is a career round's race, which stands the championship after it
   * beside the table and pays points.
   */
  standings: boolean;
  /**
   * Whether it is a historic event's race, which pays a prize rather than
   * points and stands what it paid beside the table instead of a championship.
   */
  historic?: boolean;
}

/**
 * A result while its archive is read: the hero, the strip of figures under
 * their real labels, the podium over the classification for a race, and the
 * championship after it beside them for a career round's race.
 */
export const ResultDetailSkeleton = ({ race, standings, historic = false }: ResultDetailSkeletonProps) => {
  const { t } = useTranslation();
  const figures = [
    'event.result.you',
    ...(race ? ['results.strip.started'] as const : []),
    'event.result.best',
    ...(standings ? ['event.result.points'] as const : []),
    ...(historic && race ? ['event.summary.prize'] as const : []),
  ] as const;

  return (
    <Loading className="flex flex-col gap-4">
      <Shimmer deep className="h-48 rounded-xl" />

      <section className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-xl border bg-card shadow-sm">
        {figures.map((label, at) => (
          <div key={label} className="flex min-w-0 flex-col gap-1 border-l px-4 py-3 first:border-l-0">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t(label)}
            </span>
            <span className="flex min-w-0 items-center gap-2 text-xl font-semibold">
              {at === 0
                ? <Shimmer className="h-7.5 w-10 rounded-md" />
                : <Shimmer className="my-1 h-5 w-16" />}
              <Shimmer className="h-3 w-12" />
            </span>
          </div>
        ))}
      </section>

      <div className={cn('grid items-start gap-4', (standings || historic) && 'lg:grid-cols-[minmax(0,1fr)_20rem]')}>
        <div className="flex min-w-0 flex-col gap-4">
          {race ? <PodiumSkeleton /> : null}
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <ClassificationTableSkeleton rows={RESULT_ROWS} race={race} points={standings} footnote />
          </div>
        </div>

        {historic ? (
          <aside className="flex flex-col rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-2 px-4 pt-4">
              <span className="text-sm font-semibold">{t('results.historic.title')}</span>
              <HistoricChip />
            </div>
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {t('event.summary.prize')}
              </span>
              <Shimmer className="my-1 h-5 w-20" />
              <Shimmer className="h-3 w-14" />
            </div>
            <span className="flex items-center justify-center gap-1 border-t py-2 text-xs font-medium text-primary">
              {t('results.historic.open')}
              <ChevronRightIcon className="size-3.5" />
            </span>
          </aside>
        ) : null}

        {standings ? (
          <aside className="flex flex-col rounded-xl border bg-card shadow-sm">
            <div className="px-4 pt-4">
              <Shimmer className="my-0.75 h-3.5 w-36" />
            </div>
            <div className="px-1 pt-2 pb-1">
              <CompactStandingsSkeleton />
            </div>
            <span className="flex items-center justify-center gap-1 border-t py-2 text-xs font-medium text-primary">
              {t('standings.fullStandings')}
              <ChevronRightIcon className="size-3.5" />
            </span>
          </aside>
        ) : null}
      </div>
    </Loading>
  );
};
