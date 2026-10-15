import { useTranslation } from 'react-i18next';

import { HISTORIC_TABS } from './constants.ts';
import type { HistoricTab } from './types.ts';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';
import { UNDERLINE_TAB } from '@/screens/championships';

interface HistoricDetailSkeletonProps {
  /**
   * The tab the page opens on.
   */
  tab: HistoricTab;
}

/**
 * How many tiles the Event tab's overview holds.
 */
const TILES = 4;

/**
 * How many teams a class row's skeleton lists.
 */
const TEAMS = 4;

// A historic event's page while it is read: the real tabs, and placeholders
// for the tab it opens on.
export const HistoricDetailSkeleton = ({ tab }: HistoricDetailSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <Shimmer className="h-5.5 w-16" />
          <Shimmer className="h-5.5 w-24" />
        </div>
        <Shimmer className="my-1 h-6 w-72" />
        <Shimmer className="h-3 w-40" />
      </div>

      <div className="flex border-b">
        {HISTORIC_TABS.map((one) => (
          <span
            key={one}
            data-state={one === tab ? 'active' : 'inactive'}
            className={cn(UNDERLINE_TAB, 'px-4 py-2.5 text-sm font-medium')}
          >
            {t(`historicLibrary.tabs.${one}`)}
          </span>
        ))}
      </div>

      {tab === 'event' ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-3/4" />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {slots(TILES).map((at) => <Shimmer key={at} className="h-20 w-full rounded-lg" />)}
            </div>
          </div>
          {/* The format and the rules, side by side. */}
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <Shimmer className="h-40 w-full rounded-xl" />
            <Shimmer className="h-96 w-full rounded-xl" />
          </div>
        </div>
      ) : null}

      {tab === 'classes' ? (
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
          <Shimmer className="h-5 w-40" />
          {slots(TEAMS).map((at) => <Shimmer key={at} className="h-8 w-full" />)}
        </div>
      ) : null}

      {tab === 'prizes' ? (
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
          {slots(TEAMS).map((at) => <Shimmer key={at} className="h-5 w-full" />)}
        </div>
      ) : null}
    </Loading>
  );
};
