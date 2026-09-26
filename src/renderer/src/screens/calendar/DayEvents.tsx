import { useTranslation } from 'react-i18next';

import { EventCard } from './EventCard.tsx';
import { eventKey } from './utils.ts';
import type { CalendarEntry } from '../../../../shared/types';

interface DayEventsProps {
  /**
   * What races that day, already ranked.
   */
  events: readonly CalendarEntry[];
  /**
   * Called to open one round's event page.
   * @param event Which event
   */
  onOpen: (event: CalendarEntry) => void;
}

/**
 * One day's events as a column of cards - beside the month grid, or in the sheet
 * that stands in for it in a narrower window.
 */
export const DayEvents = ({ events, onOpen }: DayEventsProps) => {
  const { t } = useTranslation();

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('calendar.nothingThatDay')}</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {events.map((event) => (
        <EventCard
          key={eventKey(event)}
          event={event}
          onOpen={() => onOpen(event)}
        />
      ))}
    </div>
  );
};
