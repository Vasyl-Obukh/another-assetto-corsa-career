import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MONTH_CELL_CHROME, MONTH_LINE_HEIGHT } from './constants.ts';
import { eventKey } from './utils.ts';
import type { CalendarEntry } from '../../../../shared/types';
import { HistoricChip } from '@/components';
import { useElementHeight } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface MonthCellProps {
  /**
   * The ISO date the cell stands for.
   */
  date: string;
  /**
   * What races that day, already ranked.
   */
  events: readonly CalendarEntry[];
  /**
   * Whether the day belongs to a neighbouring month, drawn to fill the week.
   */
  outside: boolean;
  /**
   * Whether it is the career's today.
   */
  today: boolean;
  /**
   * Whether it is behind the career's clock.
   */
  past: boolean;
  /**
   * Whether it is the day whose events are listed.
   */
  selected: boolean;
  /**
   * Called to list the day's events.
   */
  onSelect: () => void;
}

export const MonthCell = ({
  date, events, outside, today, past, selected, onSelect,
}: MonthCellProps) => {
  const { t } = useTranslation();
  const [cell, setCell] = useState<HTMLButtonElement | null>(null);
  // As many lines as the day's height holds, since the grid stretches to the
  // window - and one of them given up to "+ N more" once they do not all fit.
  const lines = Math.max(0, Math.floor((useElementHeight(cell) - MONTH_CELL_CHROME) / MONTH_LINE_HEIGHT));
  const shown = events.slice(0, events.length > lines ? Math.max(0, lines - 1) : lines);
  const folded = events.length - shown.length;

  return (
    <button
      ref={setCell}
      type="button"
      aria-pressed={selected}
      className={cn(
        'flex min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden p-1.5 text-left transition-colors hover:bg-accent',
        outside ? 'bg-background' : 'bg-card',
        selected && 'ring-2 ring-primary ring-inset',
      )}
      onClick={onSelect}
    >
      <span
        className={cn(
          'mb-0.5 w-fit px-1 text-xs font-semibold tabular-nums',
          outside && 'opacity-40',
          today && 'rounded-full bg-primary px-2 text-primary-foreground',
        )}
      >
        {Number(date.slice(-2))}
      </span>

      {shown.map((event) => {
        const key = eventKey(event);

        // Yours filled in primary - amber where it clashes - since a month's
        // first question is which of its days you are racing. What you could
        // enter wears its discipline, and what is above you stays plain text.
        if (event.enrolled) {
          return (
            <span
              key={key}
              className={cn(
                'flex min-w-0 items-center gap-1 rounded px-1.5 text-[0.7rem] leading-5 font-semibold',
                event.clash ? 'bg-warning text-warning-foreground' : 'bg-primary text-primary-foreground',
                past && 'opacity-50',
              )}
            >
              {/* A historic event is named alone, its chip standing where a
                  round would give its number. */}
              {event.historic ? <HistoricChip className="shrink-0 px-1 py-0 text-[0.6rem]" /> : null}
              <span className="truncate">
                {event.historic ? event.seriesName : t('calendar.seriesRound', {
                  series: event.seriesName,
                  round: t('calendar.round', { number: event.number }),
                })}
              </span>
            </span>
          );
        }

        return (
          <span
            key={key}
            className={cn(
              'flex min-w-0 items-center gap-1 rounded px-1.5 text-[0.7rem] leading-5',
              event.eligible ? DISCIPLINE_ACCENT[event.ladder.discipline] : 'text-muted-foreground',
              past && 'opacity-50',
            )}
          >
            {event.eligible ? null : <LockIcon className="size-2.5 shrink-0" />}
            <span className="truncate">{event.seriesName}</span>
          </span>
        );
      })}

      {folded > 0 ? (
        <span className="px-1.5 text-[0.7rem] leading-5 font-medium text-muted-foreground">
          {t('calendar.more', { count: folded })}
        </span>
      ) : null}
    </button>
  );
};
