import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { EventCard } from './EventCard.tsx';
import { TodayMarker } from './TodayMarker.tsx';
import { agendaDays } from './utils.ts';
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
   * Called to open one round's event page.
   * @param event Which event
   */
  onOpen: (event: CalendarEntry) => void;
  /**
   * Handed the element today is drawn as, for the calendar to scroll to.
   */
  todayRef?: Ref<HTMLDivElement>;
}

export const CalendarAgenda = ({
  events, today, onOpen, todayRef,
}: CalendarAgendaProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();

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

        return [
          at === markerAt ? marker : null,
          <section
            key={day.date}
            id={`day-${day.date}`}
            className="flex scroll-mt-4 gap-4 border-t py-5 first:border-t-0 first:pt-0"
          >
            {/* A date rail down the left, so a season reads as a run of
                weekends rather than as a list that happens to be sorted. */}
            <header
              className={cn(
                'sticky top-[calc(var(--calendar-head,0px)+0.5rem)] flex h-fit w-16 shrink-0 flex-col items-end text-right',
                past ? 'opacity-50' : '',
              )}
            >
              <span className="text-2xl leading-none font-semibold tabular-nums">
                {Number(day.date.slice(-2))}
              </span>
              <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                {formatDay(day.date)}
              </span>
              <span className="mt-1 text-[0.65rem] text-muted-foreground">
                {t('calendar.onThisDay', { count: day.events.length })}
              </span>
            </header>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {day.events.map((event) => (
                <EventCard
                  key={`${event.series}-${event.entry}-${event.round}`}
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
