import { ChartLineIcon, ChevronRightIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT } from './constants.ts';
import { Shimmer } from '@/components';
import { cn } from '@/lib/utils.ts';

/**
 * Home's two doors while the career is read: their names, icons and headings
 * for real, and what each previews still to come.
 */
export const HomeDoorsSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {(['results', 'history'] as const).map((door) => (
        <div key={door} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', DOOR_ACCENT[door])}>
              {door === 'results' ? <ChartLineIcon className="size-5" /> : <TrophyIcon className="size-5" />}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-base font-semibold">{t(`home.doors.${door}.title`)}</span>
              {door === 'results'
                ? <Shimmer className="h-3 w-48" />
                : <span className="truncate text-xs text-muted-foreground">{t('home.doors.history.hint')}</span>}
            </div>
            <span className="ml-auto flex items-center gap-0.5 text-sm font-medium text-primary">
              {t('home.doors.open')}
              <ChevronRightIcon className="size-4" />
            </span>
          </div>
          <div className="flex min-h-28 flex-col gap-2 border-t px-4 pt-2.5 pb-4">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t(door === 'results' ? 'home.doors.results.latest' : 'home.doors.history.seasons')}
            </span>
            <Shimmer className="my-1 h-3.5 w-60" />
            {door === 'results' ? (
              <div className="flex gap-1.5">
                <Shimmer className="h-5.5 w-20" />
                <Shimmer className="h-5.5 w-7" />
                <Shimmer className="h-5.5 w-14" />
                <Shimmer className="h-5.5 w-7" />
              </div>
            ) : <Shimmer className="h-3.5 w-48" />}
          </div>
        </div>
      ))}
    </div>
  );
};
