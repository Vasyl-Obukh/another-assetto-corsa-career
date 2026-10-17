import { Shimmer } from '@/components';

/**
 * A career in the list while the careers are read.
 */
export const CareerRowSkeleton = () => (
  <div className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0">
    <Shimmer className="h-10 w-16 rounded-md" />
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Shimmer className="h-3.5 w-5 rounded-[2px]" />
        <Shimmer className="h-3.5 w-28" />
        <Shimmer className="ml-auto h-2.5 w-12" />
      </div>
      <Shimmer className="h-2.5 w-36" />
      <div className="flex items-center gap-1">
        <Shimmer className="h-5 w-20 rounded-md" />
        <Shimmer className="h-2.5 w-24" />
      </div>
    </div>
  </div>
);
