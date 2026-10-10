import { EVENT_SKELETON, SESSION_SCROLL, SESSION_SKELETON } from './constants.ts';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';

/**
 * The Results page while the archives are read: an event card's photograph,
 * car, and session rows on the card's own grid. No round results footer: a
 * card is three sessions tall or one session and its footer, and both come to
 * the same height, while three sessions and a footer is the rare one.
 */
export const ResultsSkeleton = () => (
  <Loading className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
    {slots(EVENT_SKELETON).map((card) => (
      <div key={card} className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <Shimmer deep className="h-30 rounded-none" />
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs">
          <Shimmer deep className="size-4.5 rounded" />
          <Shimmer className="my-0.5 h-3 w-32" />
          <Shimmer className="my-0.5 ml-auto h-3 w-12" />
        </div>
        <div className={cn('mx-2 mb-2 flex flex-col', SESSION_SCROLL)}>
          {slots(SESSION_SKELETON).map((row) => (
            <div
              key={row}
              className="grid h-9 shrink-0 grid-cols-[7rem_minmax(0,1fr)_auto_2.75rem] items-center gap-3 border-t px-2 first:border-t-0"
            >
              <Shimmer className="h-5.5 w-20 justify-self-start rounded-md" />
              <Shimmer className="h-3.5 w-16" />
              <Shimmer className="h-3 w-6" />
              <Shimmer className="h-6 w-10 justify-self-end rounded-md" />
            </div>
            ))}
        </div>
      </div>
      ))}
  </Loading>
);
