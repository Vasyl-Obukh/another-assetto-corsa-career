import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FIGURE_LABELS, LIVERY_SKELETON } from './constants.ts';
import { DetailPanel, Loading, Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';

interface CarDetailSkeletonProps {
  /**
   * Whether the page heads its sidebar with the car's price, as it does in a
   * career.
   */
  priced?: boolean;
}

/**
 * A car's page while it is read: the stage with its name and chips where they
 * will land, a livery strip, the six figures under their real labels, and the
 * panels beside them - in a career, its price and Purchase first.
 */
export const CarDetailSkeleton = ({ priced = false }: CarDetailSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="relative aspect-[5/2] lg:aspect-[21/8]">
          <Shimmer deep className="absolute inset-0 rounded-none" />
          <Shimmer className="absolute top-3.5 right-3.5 h-6 w-16 rounded-full" />
          <div className="absolute bottom-4 left-5 flex w-[40%] flex-col gap-1.5">
            <div className="flex h-[22px] items-center gap-2">
              <Shimmer className="size-[22px] rounded-[5px]" />
              <Shimmer className="h-3.5 w-32" />
            </div>
            <Shimmer className="my-[3px] h-6 w-full lg:my-1 lg:h-7.5" />
            <div className="flex gap-1">
              <Shimmer className="h-5.5 w-20" />
              <Shimmer className="h-5.5 w-28" />
            </div>
          </div>
          <Shimmer className="absolute right-5 bottom-4 h-3.5 w-28" />
        </div>
        <div className="grid auto-cols-[7rem] grid-flow-col gap-1 justify-start p-1">
          {slots(LIVERY_SKELETON).map((at) => <Shimmer key={at} deep className="aspect-video rounded-md" />)}
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="@container gap-0 py-0">
            <dl className="grid grid-cols-3 @3xl:grid-cols-6">
              {FIGURE_LABELS.map((label, at) => (
                <div
                  key={label}
                  className={cn(
                    'flex flex-col-reverse gap-0.5 px-4 py-3',
                    at % 3 !== 0 && 'border-l',
                    at >= 3 && 'border-t @3xl:border-t-0',
                    at === 3 && '@3xl:border-l',
                  )}
                >
                  <dt className="text-xs text-muted-foreground">{t(label)}</dt>
                  <dd><Shimmer className="my-1 h-5 w-16" /></dd>
                </div>
              ))}
            </dl>
          </Card>
          <DetailPanel title={t('cars.detail.about')} className="flex flex-col">
            <Shimmer className="my-1 h-3.5 w-full" />
            <Shimmer className="my-1 h-3.5 w-11/12" />
            <Shimmer className="my-1 h-3.5 w-3/5" />
          </DetailPanel>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {/* In a career, its price and Purchase; outside one, its price and
              what renting and repainting it cost. */}
          <Card className={priced ? 'gap-3 px-4 py-4' : 'gap-2 px-4 py-4'}>
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">{t('trade.price')}</span>
              <Shimmer className="my-1 h-7 w-36" />
            </div>
            {priced ? <Shimmer className="h-10 w-full rounded-md" /> : <Shimmer className="h-3 w-52" />}
          </Card>
          <DetailPanel title={t('cars.detail.racedIn')} icon={<TrophyIcon />} className="flex flex-col pt-1">
            <div className="grid grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-x-3 py-2.5">
              <Shimmer className="self-stretch rounded-full" />
              <div className="flex flex-col gap-1">
                <Shimmer className="my-[3px] h-3.5 w-48" />
                <Shimmer className="h-5.5 w-28" />
              </div>
              <Shimmer className="size-4 rounded-sm" />
            </div>
          </DetailPanel>

          <DetailPanel title={t('cars.detail.classification')} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Shimmer className="h-3.5 w-20" />
              <Shimmer className="h-5.5 w-28" />
            </div>
            <span className="text-xs text-muted-foreground">{t('cars.detail.classesLink')}</span>
          </DetailPanel>

          <DetailPanel title={t('cars.detail.source')} className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Shimmer className="h-5.5 w-16" />
              <Shimmer className="h-3.5 w-36" />
            </div>
            <Shimmer className="my-[3px] h-3.5 w-48" />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{t('cars.detail.folder')}</span>
              <Shimmer className="my-0.5 h-3 w-24" />
            </div>
          </DetailPanel>
        </div>
      </div>
    </Loading>
  );
};
