import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CalendarEntry } from '../../../../shared/types';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { HistoricChip } from '@/components';
import { useFormat } from '@/i18n';

interface ClockWidgetProps {
  /**
   * The ISO date the career's clock stands at.
   */
  today: string;
  /**
   * The event the clock would move to, or null once nothing is left.
   */
  next: CalendarEntry | null;
  /**
   * Whether a command is in flight, which holds the button.
   */
  busy: boolean;
  /**
   * Called to move the clock to the next event's day.
   */
  onAdvance: () => void;
}

/**
 * The career's clock and where it moves next, as one control - so the button
 * says where it goes before it is pressed.
 */
export const ClockWidget = ({
  today, next, busy, onAdvance,
}: ClockWidgetProps) => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort } = useFormat();

  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col justify-center px-3.5 py-1.5">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('calendar.today')}
        </span>
        <span className="text-sm font-semibold">{formatDay(today)}</span>
      </div>

      {next ? (
        <>
          <div className="flex min-w-0 flex-col justify-center border-l px-3.5 py-1.5">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t(next.enrolled ? 'calendar.nextYours' : 'calendar.nextAny', {
                count: daysBetween(today, next.date),
              })}
            </span>
            {next.historic ? (
              // A historic event is named alone, its chip where a round gives
              // its number and name.
              <span className="flex min-w-0 items-center gap-1.5 text-sm">
                <HistoricChip className="shrink-0 px-1.5 py-0 text-[0.65rem]" />
                <span className="truncate font-semibold">{next.seriesName}</span>
              </span>
            ) : (
              <span className="truncate text-sm">
                <span className="font-semibold">{next.seriesName}</span>
                {' '}
                {t('calendar.roundAt', { round: t('calendar.round', { number: next.number }), name: next.roundName })}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={busy}
            title={t('calendar.advanceHint')}
            className="flex items-center gap-1.5 border-l bg-primary px-4 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            onClick={onAdvance}
          >
            {t('calendar.goTo', { day: formatDayShort(next.date) })}
            <ArrowRightIcon className="size-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
};
