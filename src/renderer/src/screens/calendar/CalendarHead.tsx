import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ClockWidget } from './ClockWidget.tsx';
import type { CalendarEntry } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';

interface CalendarHeadProps {
  /**
   * The first day of the month on screen.
   */
  month: string;
  /**
   * Whether there is a month of the season before it.
   */
  canBack: boolean;
  /**
   * Whether there is a month of the season after it.
   */
  canForward: boolean;
  /**
   * The ISO date the career's clock stands at.
   */
  today: string;
  /**
   * The weekend the clock would move to, or null once nothing is left.
   */
  next: CalendarEntry | null;
  /**
   * Whether a command is in flight, which holds the clock's button.
   */
  busy: boolean;
  /**
   * Called to step a month back or forward.
   * @param by -1 for the one before, 1 for the one after
   */
  onStep: (by: number) => void;
  /**
   * Called to go back to where the clock stands.
   */
  onToday: () => void;
  /**
   * Called to move the clock to the next weekend.
   */
  onAdvance: () => void;
}

export const CalendarHead = ({
  month, canBack, canForward, today, next, busy, onStep, onToday, onAdvance,
}: CalendarHeadProps) => {
  const { t } = useTranslation();
  const { formatMonth } = useFormat();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {/* Wide enough for the longest month, so the arrows beside it do not
            move as the months go by. */}
        <h1 className="min-w-[11ch] text-2xl font-semibold first-letter:uppercase">{formatMonth(month)}</h1>
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          disabled={!canBack}
          aria-label={t('calendar.previousMonth')}
          onClick={() => onStep(-1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          disabled={!canForward}
          aria-label={t('calendar.nextMonth')}
          onClick={() => onStep(1)}
        >
          <ChevronRightIcon />
        </Button>
        <Button size="sm" variant="outline" onClick={onToday}>{t('calendar.today')}</Button>
      </div>

      <ClockWidget today={today} next={next} busy={busy} onAdvance={onAdvance} />
    </header>
  );
};
