import { ClockArrowUpIcon } from 'lucide-react';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { EventCard } from './EventCard.tsx';
import { TodayMarker } from './TodayMarker.tsx';
import { agendaDays, eventKey, monthOf } from './utils.ts';
import type { CalendarEntry } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface CalendarAgendaProps {
  /**
   * The events to list, earliest first.
   */
  events: readonly CalendarEntry[];
  /**
   * The ISO date the career's clock stands at.
   */
  today: string;
  /**
   * Whether a command is in flight, which holds the clock's buttons.
   */
  busy: boolean;
  /**
   * Called to open one round's event page.
   * @param event Which event
   */
  onOpen: (event: CalendarEntry) => void;
  /**
   * Called to move the clock to a day.
   * @param date Its ISO date
   */
  onAdvance: (date: string) => void;
  /**
   * Handed the element today is drawn as, for the calendar to scroll to.
   */
  todayRef?: Ref<HTMLDivElement>;
}

export const CalendarAgenda = ({
  events, today, busy, onOpen, onAdvance, todayRef,
}: CalendarAgendaProps) => {
  const { t } = useTranslation();
  const { formatMonth, formatMonthShort, formatWeekday } = useFormat();

  const days = agendaDays(events);
  // Today goes before the first race day still to come, or after the last one
  // once the whole season is behind the clock.
  const upcoming = days.findIndex((day) => day.date >= today);
  const markerAt = upcoming < 0 ? days.length : upcoming;
  const marker = <TodayMarker key="today" today={today} ref={todayRef} />;

  if (days.length === 0) {
    return (
      <div className="flex flex-col gap-1 rounded-md border border-dashed p-8 text-center">
        <p className="text-sm font-medium">{t('calendar.nothing')}</p>
        <p className="text-sm text-muted-foreground">{t('calendar.nothingHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {days.map((day, at) => {
        const past = day.date < today;
        const month = monthOf(day.date);
        const opensMonth = at === 0 || monthOf(days[at - 1].date) !== month;
        const yours = opensMonth
          ? events.filter((event) => event.enrolled && monthOf(event.raceDay) === month).length
          : 0;

        return [
          opensMonth ? (
            // What the header's title and month buttons read and scroll to.
            <header
              key={`month-${month}`}
              data-month={month}
              className="flex items-baseline gap-2.5 pt-6 pb-2 first:pt-2"
            >
              <h2 className="text-lg font-semibold first-letter:uppercase">{formatMonth(month)}</h2>
              {yours > 0 ? (
                <span className="text-xs text-muted-foreground">{t('calendar.yoursInMonth', { count: yours })}</span>
              ) : null}
            </header>
          ) : null,
          at === markerAt ? marker : null,
          <section
            key={day.date}
            id={`day-${day.date}`}
            className="group/day grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-dashed py-4"
          >
            <header
              className={cn(
                'sticky top-[calc(var(--calendar-head,0px)+0.75rem)] flex h-fit flex-col items-end text-right',
                past ? 'opacity-50' : '',
              )}
            >
              <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {formatWeekday(day.date)}
              </span>
              <span className="text-2xl leading-none font-semibold tabular-nums">
                {Number(day.date.slice(-2))}
              </span>
              <span className="text-xs text-muted-foreground">{formatMonthShort(day.date)}</span>
              <span className="mt-1.5 text-[0.65rem] text-muted-foreground">
                {t('calendar.onThisDay', { count: day.events.length })}
              </span>
              {/* Only on a day still to come, and only on hover or focus, so a
                  wall of race days does not read as a wall of buttons. */}
              {day.date > today ? (
                <button
                  type="button"
                  disabled={busy}
                  title={t('calendar.advanceHere')}
                  aria-label={t('calendar.advanceHere')}
                  className="mt-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.65rem] font-medium text-primary opacity-0 transition-opacity group-hover/day:opacity-100 hover:bg-primary/10 focus-visible:opacity-100 disabled:opacity-0"
                  onClick={() => onAdvance(day.date)}
                >
                  <ClockArrowUpIcon className="size-3" />
                  {t('calendar.advanceShort')}
                </button>
              ) : null}
            </header>

            <div
              className={cn(
                'grid min-w-0 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-2.5',
                past ? 'opacity-60' : '',
              )}
            >
              {day.events.map((event) => (
                <EventCard
                  key={eventKey(event)}
                  event={event}
                  onOpen={() => onOpen(event)}
                />
              ))}
            </div>
          </section>,
        ];
      })}
      {markerAt === days.length ? marker : null}
    </div>
  );
};
