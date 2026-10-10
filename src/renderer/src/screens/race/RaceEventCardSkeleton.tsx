import { SESSION_SKELETON } from './constants.ts';
import { Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * A race event's card while the list is read: the photograph with its pill,
 * menu, title and date drawn over it, the car line with its logo, its session
 * rows and the one line of its footer, where the card puts them.
 */
export const RaceEventCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
    <div className="relative h-30">
      <Shimmer className="absolute inset-0 rounded-none" deep />
      <Shimmer className="absolute top-3 left-3 h-5 w-24 rounded-full" />
      <Shimmer className="absolute top-2 right-2 size-8 rounded-md" />
      <Shimmer className="absolute bottom-7.5 left-3 h-4 w-44" />
      <Shimmer className="absolute bottom-3 left-3 h-2.5 w-28" />
    </div>
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <Shimmer className="size-4.5 rounded" />
      <Shimmer className="h-3 w-32" />
    </div>
    <div className="flex flex-col px-4 pb-2">
      {slots(SESSION_SKELETON).map((at) => (
        <div key={at} className="flex h-9 items-center gap-2 border-t first:border-t-0">
          <Shimmer className="size-4 rounded-full" />
          <Shimmer className="h-5 w-14" />
          <Shimmer className="h-3 w-20" />
          <span className="flex-1" />
          <Shimmer className="h-3 w-12" />
        </div>
      ))}
    </div>
    <div className="mt-auto flex items-center border-t px-4 py-2.5">
      <Shimmer className="h-3 w-32" />
    </div>
  </div>
);
