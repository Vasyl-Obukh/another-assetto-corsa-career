import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CHAMPIONSHIP_SKELETON } from './constants.ts';
import { DetailPanel, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * The championships panel while the library is read: rows the size of the
 * ones that replace them, under the panel's real heading.
 */
export const TrackChampionshipsSkeleton = () => {
  const { t } = useTranslation();

  return (
    <DetailPanel title={t('tracks.detail.racedHere')} icon={<TrophyIcon />} className="grid gap-2 pt-1 xl:grid-cols-2">
      {slots(CHAMPIONSHIP_SKELETON).map((at) => (
        <div key={at} className="grid grid-cols-[4px_minmax(0,1fr)] gap-x-3 rounded-lg border bg-card py-2.5 pr-2.5 pl-3 shadow-xs">
          <Shimmer className="self-stretch rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Shimmer className="my-0.5 h-3.5 w-48 max-w-full" />
            <Shimmer className="h-3 w-32" />
            <Shimmer className="h-5.5 w-28" />
          </div>
        </div>
      ))}
    </DetailPanel>
  );
};
