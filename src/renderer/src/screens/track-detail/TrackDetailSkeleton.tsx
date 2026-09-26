import { useTranslation } from 'react-i18next';

import {
  FIGURE_LABELS, LAYOUT_SKELETON, PHOTO_SKELETON,
} from './constants.ts';
import { TrackChampionshipsSkeleton } from './TrackChampionshipsSkeleton.tsx';
import { DetailPanel, Loading, Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';

/**
 * A track's page while it is read: the stage with its name and map plate where
 * they will land, the layout cards, the figures under their real labels, and
 * the panels beside them.
 */
export const TrackDetailSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="relative aspect-[5/2] lg:aspect-[21/8]">
          <Shimmer deep className="absolute inset-0 rounded-none" />
          <div className="absolute bottom-4 left-5 flex w-[40%] flex-col gap-2.5">
            <Shimmer className="h-3.5 w-36" />
            <Shimmer className="h-8 w-full" />
            <Shimmer className="h-5.5 w-28" />
          </div>
          <Shimmer className="absolute top-4 right-4 bottom-4 w-[30%] rounded-xl" />
        </div>
        <div className="grid auto-cols-[7rem] grid-flow-col justify-start gap-1 p-1">
          {slots(PHOTO_SKELETON).map((at) => <Shimmer key={at} deep className="aspect-video rounded-md" />)}
        </div>
      </Card>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-8 items-center gap-2.5">
          <h2 className="text-base font-semibold">{t('tracks.detail.layouts')}</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3">
          {slots(LAYOUT_SKELETON).map((at) => (
            <Card key={at} className="gap-0 overflow-hidden py-0">
              <div className="relative aspect-[16/10] bg-muted">
                <Shimmer deep className="absolute inset-x-8 inset-y-5 rounded-[40%]" />
              </div>
              <div className="flex flex-col gap-2 p-3">
                <Shimmer className="h-4 w-3/5" />
                <Shimmer className="h-3 w-4/5" />
                <Shimmer className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="@container gap-0 py-0">
            <dl className="grid grid-cols-3 @2xl:grid-cols-5">
              {FIGURE_LABELS.map((label, at) => (
                <div
                  key={label}
                  className={cn(
                    'flex flex-col-reverse justify-end gap-1.5 px-4 py-3',
                    at % 3 !== 0 && 'border-l',
                    at >= 3 && 'border-t @2xl:border-t-0',
                    at === 3 && '@2xl:border-l',
                  )}
                >
                  <dt className="text-xs text-muted-foreground">{t(label)}</dt>
                  <dd><Shimmer className="my-1 h-5 w-16" /></dd>
                </div>
              ))}
            </dl>
          </Card>
          <TrackChampionshipsSkeleton />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <DetailPanel title={t('tracks.detail.where')} className="flex flex-col gap-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-8 w-full" />
          </DetailPanel>
          <DetailPanel title={t('cars.detail.source')} className="flex flex-col gap-2">
            <Shimmer className="h-5.5 w-32" />
            <Shimmer className="h-4 w-full" />
          </DetailPanel>
        </div>
      </div>
    </Loading>
  );
};
