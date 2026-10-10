import { useTranslation } from 'react-i18next';

import { EVENT_ROW_SKELETON } from './constants.ts';
import { EventResultsSkeleton } from './EventResultsSkeleton.tsx';
import { RaceSetupSkeleton } from './RaceSetupSkeleton.tsx';
import type { QuickRacePhase } from '../../../../shared/types';
import { Loading, Shimmer } from '@/components';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';
import { BriefTile } from '@/screens/event';

interface RaceEventSkeletonProps {
  /**
   * How far the event is expected to have got, which the card that opened
   * it knows and the page does not until it is read.
   */
  phase: QuickRacePhase;
}

/**
 * A race event's page under its header while it is read. The pickers down
 * the side, then either the setup - classes, sessions, rules - or, for one
 * already under way, its sessions below the pickers and beside them the one
 * open, or the event's results once it has finished - each laid out as the
 * loaded page lays it out.
 */
export const RaceEventSkeleton = ({ phase }: RaceEventSkeletonProps) => {
  const { t } = useTranslation();
  const started = phase !== 'setup';

  return (
    <Loading className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4">
        <Card className="gap-2.5 p-3">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('race.track.label')}</span>
            {started ? null : <Shimmer className="h-8 w-28 rounded-md" />}
          </div>
          <Shimmer className="aspect-[16/9] w-full rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Shimmer className="my-1 h-4 w-40" />
            <div className="flex items-center gap-1.5">
              <Shimmer className="h-5 w-16" />
              <Shimmer className="h-3 w-14" />
              <Shimmer className="h-3 w-20" />
            </div>
          </div>
        </Card>

        <Card className="gap-2.5 p-3">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('race.car.label')}</span>
            {started ? null : <Shimmer className="h-8 w-24 rounded-md" />}
          </div>
          {/* Most events race one class, which asks no class of the player, so
              the class chips are left out until the event says otherwise. */}
          <Shimmer deep className="aspect-[16/9] w-full rounded-md" />
          <div className="flex flex-col gap-0.5">
            <Shimmer className="my-1 h-4 w-36" />
            <Shimmer className="my-0.5 h-3 w-44" />
          </div>
        </Card>

        {started ? (
          <Card className="gap-0 py-0">
            <CardHeader className="px-3 pt-3 pb-2">
              <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t('event.listTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {slots(EVENT_ROW_SKELETON).map((at) => (
                <div key={at} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t px-3 py-2.5">
                  <Shimmer className="size-4 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Shimmer className="my-0.5 h-3.5 w-20" />
                    <Shimmer className="h-3 w-28" />
                  </div>
                  <Shimmer className="h-5 w-9" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        {phase === 'finished' ? <EventResultsSkeleton /> : null}
        {phase === 'running' ? (
          <Card className="py-4">
            <CardContent className="flex flex-col gap-4 px-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shimmer className="h-5.5 w-14" />
                  <Shimmer className="my-1 h-5 w-24" />
                </div>
                <Shimmer className="h-3.5 w-10" />
              </div>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                {(['length', 'weather', 'wind', 'start'] as const).map((tile) => (
                  <BriefTile key={tile} label={t(`event.brief.${tile}`)}>
                    <Shimmer className="my-1.5 h-4.5 w-24" />
                  </BriefTile>
                ))}
              </div>
              <Shimmer className="h-3.5 w-80" />
            </CardContent>
          </Card>
        ) : null}
        {started ? null : <RaceSetupSkeleton />}
      </div>
    </Loading>
  );
};
