import { ChevronRightIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { WINNER_PLACES } from './constants.ts';
import {
  CompactStandingsSkeleton, Loading, ResultCell, Shimmer,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { slots } from '@/lib/slots.ts';

interface RoundSummarySkeletonProps {
  /**
   * Whether the player is in the championship, which is what puts the strip,
   * their place on each winners card and their own row in the table.
   */
  entered: boolean;
  /**
   * How many races the round runs, a winners card each.
   */
  races: number;
  /**
   * The round's number, for the table's heading.
   */
  round: number;
  /**
   * Whether it is a historic event, which pays a prize rather than points and
   * stands in no table.
   */
  historic?: boolean;
}

/**
 * A round's own results while the season is read: the strip under its real
 * labels, a winners card per race with its places, and the championship after
 * it - each at the size RoundSummary draws it, in the shape the event view
 * already says it will take.
 */
export const RoundSummarySkeleton = ({
  entered, races, round, historic = false,
}: RoundSummarySkeletonProps) => {
  const { t } = useTranslation();
  const figures = historic
    ? ['event.summary.races', 'event.summary.prize'] as const
    : ['event.summary.races', 'event.summary.points', 'event.summary.championship'] as const;

  return (
    <Loading className="flex flex-col gap-4">
      {entered ? (
        <section className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-xl border bg-card shadow-sm">
          {figures.map((label) => (
            <div key={label} className="flex min-w-0 flex-col gap-1 border-l px-4 py-3 first:border-l-0">
              <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {t(label)}
              </span>
              <span className="flex min-w-0 items-center gap-2 text-xl font-semibold">
                {label === 'event.summary.points' || label === 'event.summary.prize'
                  ? <Shimmer className="my-1 h-5 w-12" />
                  : <Shimmer className="h-7.5 w-10 rounded-md" />}
                {label === 'event.summary.championship' ? <Shimmer className="h-3 w-16" /> : null}
              </span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-3 rounded-xl border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <TrophyIcon className="size-4 text-podium-gold-foreground" />
          {t('event.summary.winners')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {slots(races).map((race) => (
            <div key={race} className="flex flex-col gap-2 rounded-lg border p-3">
              <span className="flex items-center gap-2">
                <Shimmer className="h-5.5 w-16 rounded-md" />
                {entered ? (
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    {t('standings.you')}
                    <Shimmer className="h-5 w-6 rounded-md" />
                  </span>
                ) : null}
              </span>
              {WINNER_PLACES.map((place) => (
                <span key={place} className="flex items-center gap-2 text-sm leading-tight">
                  <ResultCell size="sm" position={place} scored />
                  <Shimmer className="h-3 w-4.5 rounded-sm" />
                  <Shimmer className="h-3.5 w-28" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {historic ? null : (
        <section className="flex flex-col rounded-xl border">
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <h3 className="text-sm font-semibold">{t('standings.afterRound', { number: round })}</h3>
            <Button size="sm" variant="outline" disabled>
              {t('standings.fullStandings')}
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="px-1 pt-2 pb-1">
            <CompactStandingsSkeleton withPlayer={entered} />
          </div>
        </section>
      )}
    </Loading>
  );
};
