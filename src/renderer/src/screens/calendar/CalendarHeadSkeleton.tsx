import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Shimmer } from '@/components';
import { Button } from '@/components/ui/button.tsx';

/**
 * The calendar's head while the career is read: the month's arrows and Today,
 * held, beside a clock widget still to fill.
 */
export const CalendarHeadSkeleton = () => {
  const { t } = useTranslation();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="flex min-w-[11ch] items-center text-2xl">
          <Shimmer className="my-1 h-6 w-48" />
        </div>
        <Button size="icon" variant="outline" className="size-8" disabled aria-label={t('calendar.previousMonth')}>
          <ChevronLeftIcon />
        </Button>
        <Button size="icon" variant="outline" className="size-8" disabled aria-label={t('calendar.nextMonth')}>
          <ChevronRightIcon />
        </Button>
        <Button size="sm" variant="outline" disabled>{t('calendar.today')}</Button>
      </div>

      <div className="flex items-stretch overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col justify-center gap-1 px-3.5 py-1.5">
          <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('calendar.today')}
          </span>
          <Shimmer className="my-0.5 h-3.5 w-20" />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1.5 border-l px-3.5 py-1.5">
          <Shimmer className="h-2.5 w-28" />
          <Shimmer className="my-0.5 h-3.5 w-64" />
        </div>
        <Shimmer className="w-36 rounded-none" />
      </div>
    </header>
  );
};
