import { Shimmer } from '@/components';

/**
 * A round's title row while it is read: its round number and chips, its name,
 * the championship pill with the dates beside it, and the layout's map.
 */
export const EventHeadSkeleton = () => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-5.5 w-24" />
        <Shimmer className="h-5.5 w-14" />
      </div>
      <Shimmer className="my-1 h-6 w-40" />
      <div className="flex items-center gap-4">
        <Shimmer className="h-6.5 w-56 rounded-full" />
        <Shimmer className="h-3.5 w-36" />
        <Shimmer className="h-3.5 w-14" />
      </div>
    </div>
    <Shimmer deep className="aspect-[16/9] w-36 rounded-md" />
  </div>
);
