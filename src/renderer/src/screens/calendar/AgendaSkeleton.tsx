import { useTranslation } from 'react-i18next';

import { AGENDA_SKELETON } from './constants.ts';
import { EventCardSkeleton } from './EventCardSkeleton.tsx';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * The timeline while the calendar is read: race days down a date rail, each
 * with a row of event cards, and a month heading partway down.
 */
export const AgendaSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col">
      <div className="flex items-center gap-4 py-3">
        <span className="w-[4.5rem] shrink-0 text-right text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
          {t('calendar.today')}
        </span>
        <span className="h-0.5 flex-1 rounded-full bg-primary" />
        <Shimmer className="h-3 w-20" />
      </div>

      {AGENDA_SKELETON.map((day) => (
        <div key={day.id}>
          {day.opensMonth ? (
            <div className="flex items-baseline gap-2.5 pt-6 pb-2">
              <Shimmer className="my-1 h-5 w-36" />
              <Shimmer className="h-3 w-24" />
            </div>
          ) : null}
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-dashed py-4">
            <div className="flex flex-col items-end gap-1.5">
              <Shimmer className="h-2.5 w-7" />
              <Shimmer className="h-6 w-7" />
              <Shimmer className="h-3 w-7" />
              <Shimmer className="mt-1 h-2.5 w-12" />
            </div>
            <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-2.5">
              {slots(day.cards).map((at) => <EventCardSkeleton key={at} />)}
            </div>
          </div>
        </div>
      ))}
    </Loading>
  );
};
