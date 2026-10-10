import { useTranslation } from 'react-i18next';

import { YEAR_SKELETON } from './constants.ts';
import { Loading, ResultStrip, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * A season's review while the career is read, below the header's own
 * `YearHeadSkeleton` - the year waits with everything else, since the route
 * names the season by its index rather than by its year.
 */
export const YearReviewSkeleton = () => {
  const { t } = useTranslation();
  const figure = { value: <Shimmer className="h-6 w-10" />, detail: <Shimmer className="h-3 w-20" /> };

  return (
    <Loading className="flex flex-col gap-4">
      <ResultStrip
        figures={[
          { label: t('yearReview.figures.championships'), ...figure },
          { label: t('yearReview.figures.titles'), ...figure },
          { label: t('yearReview.figures.starts'), ...figure },
          { label: t('yearReview.figures.wins'), ...figure },
          { label: t('yearReview.figures.poles'), ...figure },
        ]}
      />
      <header className="flex items-baseline justify-between gap-3 px-1 pt-2">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('yearReview.yourChampionships')}
        </h2>
        <span className="text-xs text-muted-foreground">{t('yearReview.eachOpens')}</span>
      </header>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {slots(YEAR_SKELETON.editions).map((at) => (
          <div key={at} className="grid min-h-26 grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
            <Shimmer className="w-1 self-stretch rounded-full" />
            <div className="flex min-w-0 flex-col gap-2">
              <Shimmer className="h-4 w-44" />
              <div className="flex gap-1.5">
                <Shimmer className="h-5.5 w-12" />
                <Shimmer className="h-5.5 w-20" />
                <Shimmer className="h-5.5 w-12" />
              </div>
              <Shimmer className="h-1.5 w-full rounded-full" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Shimmer className="h-7 w-10" />
              <Shimmer className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
};
