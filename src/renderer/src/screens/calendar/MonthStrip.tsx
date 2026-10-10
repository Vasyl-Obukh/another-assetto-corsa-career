import { useTranslation } from 'react-i18next';

import { MONTH_TICK } from './constants.ts';
import type { SeasonMonth } from './types.ts';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface MonthStripProps {
  /**
   * Every month of the season, in order.
   */
  months: readonly SeasonMonth[];
  /**
   * The first day of the month on screen.
   */
  current: string;
  /**
   * The first day of the month the career's clock stands in.
   */
  today: string;
  /**
   * Called to go to a month.
   * @param month Its first day
   */
  onPick: (month: string) => void;
}

/**
 * The season a month at a time, each with a tick per race day - so where your
 * events fall reads before any month is opened.
 */
export const MonthStrip = ({
  months, current, today, onPick,
}: MonthStripProps) => {
  const { t } = useTranslation();
  const { formatMonth, formatMonthShort } = useFormat();

  return (
    <nav
      aria-label={t('calendar.months')}
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
    >
      {months.map((month) => {
        const on = month.start === current;

        return (
          <button
            key={month.start}
            type="button"
            aria-current={on ? 'date' : undefined}
            title={formatMonth(month.start)}
            className={cn(
              'flex min-w-0 flex-col items-center gap-1 rounded-lg border bg-card px-1 pt-1.5 pb-1 text-xs transition-colors',
              'hover:border-primary/40',
              on && 'border-primary font-semibold text-primary ring-1 ring-primary',
              !on && month.start < today && 'text-muted-foreground',
            )}
            onClick={() => onPick(month.start)}
          >
            <span className="truncate first-letter:uppercase">{formatMonthShort(month.start)}</span>
            <span className="flex h-1 gap-0.5">
              {month.ticks.map((tick, at) => (
                // Ticks are positional - a month's race days in order - and
                // carry nothing that could identify one apart from its place.
                // eslint-disable-next-line react/no-array-index-key
                <span key={at} className={cn('w-1.5 rounded-full', MONTH_TICK[tick])} />
              ))}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
