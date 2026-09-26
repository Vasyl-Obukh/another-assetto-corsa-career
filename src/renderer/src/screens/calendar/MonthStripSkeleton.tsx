import { STRIP_SKELETON } from './constants.ts';
import { Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * The season strip while the calendar is read: a cell per month, with its name
 * and race-day ticks still to come.
 */
export const MonthStripSkeleton = () => (
  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${STRIP_SKELETON}, minmax(0, 1fr))` }}>
    {slots(STRIP_SKELETON).map((at) => (
      <div key={at} className="flex flex-col items-center gap-1.5 rounded-lg border bg-card px-1 pt-2 pb-1.5">
        <Shimmer className="h-2.5 w-7" />
        <Shimmer className="h-1 w-6 rounded-full" />
      </div>
    ))}
  </div>
);
