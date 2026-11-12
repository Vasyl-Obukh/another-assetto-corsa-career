import { useTranslation } from 'react-i18next';

import {
  CLASS_SKELETON, DETAIL_TABS, ROUND_SKELETON, STANDINGS_SKELETON, UNDERLINE_TAB,
} from './constants.ts';
import { FormatStripSkeleton } from './FormatStripSkeleton.tsx';
import { RoundTableHead } from './RoundTableHead.tsx';
import { SummaryFact } from './SummaryFact.tsx';
import type { DetailTab } from './types.ts';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';
import { EnterPanelSkeleton, RainCardSkeleton, StrengthCardSkeleton } from '@/screens/event';

interface DetailSkeletonProps {
  /**
   * Whether the career is entered in the championship, which adds the Date
   * and You columns, the player's class, the next round and the standings.
   */
  entered: boolean;
  /**
   * Whether the page will offer to enter, which holds the Enter panel's place.
   */
  enterable: boolean;
  /**
   * Whether the page manages the championship, which has no Standings tab.
   */
  manage: boolean;
  /**
   * Whether the page will offer the season's step on the AI's strength.
   */
  strength: boolean;
  /**
   * The tab the page opens on.
   */
  tab: DetailTab;
}

/**
 * A championship's page while it is read: the summary with its real labels,
 * the round table under its real headings, and a class row.
 */
export const DetailSkeleton = ({
  entered, enterable, manage, strength, tab,
}: DetailSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Loading className="grid items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4">
        <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <Shimmer className="h-1.5 w-full rounded-full" />
          <Shimmer className="my-2 h-5 w-4/5" />
          <div className="flex gap-1">
            <Shimmer className="h-5.5 w-24" />
            <Shimmer className="h-5.5 w-14" />
          </div>
          <div className="flex flex-col gap-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-11/12" />
            <Shimmer className="h-3 w-3/5" />
          </div>
          <div className="flex flex-col gap-2">
            <SummaryFact label={t('championships.detail.event')}><FormatStripSkeleton /></SummaryFact>
            <SummaryFact label={t('championships.detail.grid')}><Shimmer className="my-1 h-3 w-24" /></SummaryFact>
            <SummaryFact label={t('championships.money.entryFee')}><Shimmer className="my-1 h-3 w-14" /></SummaryFact>
            {entered ? (
              <SummaryFact label={t('championships.detail.youRace')}><Shimmer className="h-5.5 w-32" /></SummaryFact>
            ) : null}
          </div>
          {entered ? <Shimmer className="h-32 w-full rounded-lg" /> : null}
        </section>
        {enterable ? <EnterPanelSkeleton showFirstRound /> : null}
        {strength ? <StrengthCardSkeleton label={t('strength.season')} note={false} /> : null}
        {strength ? <RainCardSkeleton note={false} /> : null}
        {manage ? null : (
          <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">{t(entered ? 'standings.season.title' : 'standings.title')}</h2>
            {entered ? <Shimmer className="h-10 w-full" /> : null}
            {slots(STANDINGS_SKELETON).map((at) => (
              <div key={at} className="flex items-center gap-3">
                <Shimmer className="h-6 w-7.5" />
                <Shimmer className="h-3.5 flex-1" />
                <Shimmer className="h-3.5 w-6" />
              </div>
            ))}
          </section>
        )}
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex border-b">
          {DETAIL_TABS.filter((one) => !manage || one !== 'standings').map((one) => (
            <span
              key={one}
              data-state={one === tab ? 'active' : 'inactive'}
              className={cn(UNDERLINE_TAB, 'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium')}
            >
              {t(`championships.tabs.${one}`)}
            </span>
          ))}
        </div>

        {tab === 'rounds' ? (
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full border-collapse text-sm">
              <RoundTableHead career={entered} />
              <tbody>
                {slots(ROUND_SKELETON).map((at) => (
                  <tr key={at} className="border-t first:border-t-0">
                    <td className="py-2.5 pr-2 pl-4"><Shimmer className="h-3 w-2.5" /></td>
                    <td className="py-2.5 pr-3"><Shimmer deep className="aspect-[16/10] w-16 rounded-md" /></td>
                    <td className="py-2.5 pr-3">
                      <div className="flex flex-col gap-1.5">
                        <Shimmer className="h-3.5 w-24" />
                        <Shimmer className="h-3 w-36" />
                      </div>
                    </td>
                    {entered ? <td className="py-2.5 pr-3"><Shimmer className="h-3 w-20" /></td> : null}
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <FormatStripSkeleton />
                        <Shimmer className="h-3 w-20" />
                      </div>
                    </td>
                    <td className="py-2.5 pr-3"><Shimmer className="h-3.5 w-28" /></td>
                    {entered ? <td className="py-2.5 pr-3" aria-hidden /> : null}
                    <td className="py-2.5 pr-4"><Shimmer className="ml-auto h-8 w-20" /></td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

        ) : null}

        {tab === 'standings' ? <Shimmer className="h-96 w-full rounded-xl" /> : null}
        {tab === 'rules' ? <Shimmer className="h-64 w-full rounded-xl" /> : null}

        {tab === 'classes' ? (
          <div className="grid overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[13rem_minmax(0,1.1fr)_minmax(0,1.4fr)]">
            <div className="flex flex-col gap-2 bg-muted/40 p-4">
              <Shimmer className="size-8 rounded-full" />
              <Shimmer className="my-1 h-4 w-28" />
              <Shimmer className="h-3 w-24" />
              <div className="flex gap-1">
                <Shimmer className="h-5.5 w-20" />
                <Shimmer className="h-5.5 w-24" />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t p-4 lg:border-t-0 lg:border-l">
              <span className="text-xs font-medium text-muted-foreground">{t('championships.detail.cars')}</span>
              <div className="grid grid-cols-3 gap-2">
                {slots(CLASS_SKELETON.cars).map((at) => (
                  <div key={at} className="overflow-hidden rounded-lg border">
                    <Shimmer deep className="aspect-[16/9] w-full rounded-none" />
                    <div className="p-2"><Shimmer className="h-3 w-4/5" /></div>
                  </div>
              ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 border-t p-4 lg:border-t-0 lg:border-l">
              <span className="text-xs font-medium text-muted-foreground">{t('championships.entries.seats')}</span>
              {slots(CLASS_SKELETON.seats).map((at) => (
                <div key={at} className="flex items-center gap-3 border-t py-2.5">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Shimmer className="h-3.5 w-36" />
                    <Shimmer className="h-3 w-60 max-w-full" />
                  </div>
                  <Shimmer className="h-5.5 w-20" />
                </div>
            ))}
            </div>
          </div>
        ) : null}
      </div>
    </Loading>
  );
};
