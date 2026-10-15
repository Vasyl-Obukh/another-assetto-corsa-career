import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ROW_SKELETON } from './constants.ts';
import { HistoricStripSkeleton } from './HistoricStripSkeleton.tsx';
import { HomeDoorsSkeleton } from './HomeDoorsSkeleton.tsx';
import { MarkLegend } from './MarkLegend.tsx';
import { SessionsSkeleton } from './SessionsSkeleton.tsx';
import { Loading, Shimmer } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';

/**
 * Home while the career is read: the next event and three championship rows,
 * the common case, under the real headings and legend, and the two doors below.
 */
export const HomeSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Shimmer className="h-2.5 w-14" />
          <Shimmer className="my-1 h-6 w-44" />
        </div>
        <Button asChild variant="outline">
          <Link to={path.calendar()}>
            {t('home.openCalendar')}
            <ArrowRightIcon />
          </Link>
        </Button>
      </header>

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="grid overflow-hidden rounded-xl border bg-card shadow-sm sm:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="flex min-w-0 flex-col gap-3 p-5">
            <span className="text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
              {t('home.nextEvent')}
            </span>
            <div className="flex items-end gap-2.5">
              <Shimmer className="h-9 w-10" />
              <Shimmer className="mb-1 h-4 w-56" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Shimmer className="my-1 h-5 w-64" />
              <Shimmer className="my-0.5 h-4 w-40" />
            </div>
            <div className="flex gap-1.5">
              <Shimmer className="h-5.5 w-20" />
              <Shimmer className="h-5.5 w-14" />
              <Shimmer className="h-5.5 w-16" />
              <Shimmer className="h-5.5 w-32" />
            </div>
            <SessionsSkeleton />
            <div className="mt-1 flex gap-2">
              <Shimmer className="h-9 w-32" />
              <Shimmer className="h-9 w-44" />
            </div>
          </div>
          <div className="hidden min-h-48 items-center justify-center bg-muted sm:flex">
            <Shimmer deep className="h-20 w-32" />
          </div>
        </section>

        <section className="flex flex-col gap-1 rounded-xl border bg-card p-3 shadow-sm">
          <header className="flex items-baseline justify-between gap-3 px-2 pt-1 pb-1">
            <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t('home.yourChampionships')}
            </h2>
            <Shimmer className="h-3 w-16" />
          </header>

          {ROW_SKELETON.map(({ name, rounds }) => (
            <div key={name} className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 p-2">
              <Shimmer className="w-1 self-stretch rounded-full" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Shimmer className={`my-0.5 h-4 ${name}`} />
                  <Shimmer className="h-5.5 w-14" />
                </div>
                <div className="flex gap-0.5">
                  {slots(rounds).map((at) => <Shimmer key={at} className="h-1.5 flex-1 rounded-full" />)}
                </div>
                <Shimmer className="h-3 w-32" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Shimmer className="h-4 w-9" />
                <Shimmer className="h-3 w-10" />
              </div>
            </div>
          ))}

          <MarkLegend />
        </section>
      </div>

      <HistoricStripSkeleton />

      <HomeDoorsSkeleton />
    </Loading>
  );
};
