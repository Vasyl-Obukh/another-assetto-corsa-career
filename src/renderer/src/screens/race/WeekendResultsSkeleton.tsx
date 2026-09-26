import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ResultCell, Shimmer } from '@/components';
import { Card, CardContent } from '@/components/ui/card.tsx';

/**
 * A finished weekend's results while it is read, in WeekendResults' own card:
 * the real heading, the strip with a figure still to come, and a winners card
 * for its race.
 */
export const WeekendResultsSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <h2 className="text-lg font-semibold">{t('race.results.title')}</h2>
        <section className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex min-w-0 flex-col gap-1 border-l px-4 py-3 first:border-l-0">
            <Shimmer className="my-0.5 h-3 w-12" />
            <span className="flex min-w-0 items-center gap-2 text-xl font-semibold">
              <Shimmer className="h-7.5 w-10 rounded-md" />
              <Shimmer className="h-3 w-10" />
            </span>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <TrophyIcon className="size-4 text-podium-gold-foreground" />
            {t('event.summary.winners')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <Shimmer className="h-5.5 w-14 rounded-md" />
              <span className="flex items-center gap-2 text-sm">
                <ResultCell size="sm" position={1} scored />
                <Shimmer className="h-3 w-4.5 rounded-sm" />
                <Shimmer className="h-3.5 w-28" />
              </span>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
