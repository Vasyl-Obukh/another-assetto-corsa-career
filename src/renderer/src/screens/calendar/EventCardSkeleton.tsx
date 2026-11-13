import { Shimmer } from '@/components';

/**
 * An event card while the calendar is read: its chips, name, round line, map
 * and prize row, at the card's own size.
 */
export const EventCardSkeleton = () => (
  <div className="flex w-full flex-col gap-2 rounded-lg border bg-card px-3 py-2.5">
    <div className="flex items-start gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Shimmer className="h-2.5 w-4" />
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-11" />
        </div>
        <Shimmer className="my-1 h-3.5 w-3/5" />
        <Shimmer className="my-0.5 h-3 w-4/5" />
      </div>
      <Shimmer deep className="aspect-[16/10] w-16 rounded-md" />
    </div>

    <div className="flex items-center gap-1.5 border-t pt-2">
      <Shimmer className="my-0.5 h-4 w-16" />
      <Shimmer className="h-3 w-16" />
      <Shimmer className="ml-auto h-3 w-10" />
    </div>
  </div>
);
