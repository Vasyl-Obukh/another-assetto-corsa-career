import { useTranslation } from 'react-i18next';

import { HISTORIC_SHOWN } from './constants.ts';
import { Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

// Home's strip of historic events while the season is read: the heading for
// real, and a placeholder for each card.
export const HistoricStripSkeleton = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-2">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('home.historic.heading')}
        </span>
        <Shimmer className="h-3 w-40" />
      </header>
      <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        {slots(HISTORIC_SHOWN).map((at) => (
          <div key={at} className="flex flex-col gap-1.5 rounded-lg border bg-card py-2.5 pr-3 pl-4">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="my-0.5 h-4 w-32" />
            <Shimmer className="h-3 w-20" />
            <Shimmer className="mt-0.5 h-4 w-12" />
          </div>
        ))}
      </div>
    </section>
  );
};
