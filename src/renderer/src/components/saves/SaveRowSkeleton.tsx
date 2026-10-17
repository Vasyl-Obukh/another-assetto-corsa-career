import { Shimmer } from '@/components/Shimmer.tsx';

/**
 * A save in a list while the saves are read, on SaveRow's own grid.
 */
export const SaveRowSkeleton = () => (
  <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto_auto_2rem] items-center gap-3 px-2 py-1.5">
    <Shimmer className="size-8 rounded-lg" />
    <div className="flex flex-col">
      <span className="flex h-5 items-center"><Shimmer className="h-3.5 w-44" /></span>
      <span className="flex h-4 items-center"><Shimmer className="h-2.5 w-32" /></span>
    </div>
    <Shimmer className="h-5 w-16 rounded-md" />
    <Shimmer className="h-8 w-20 rounded-md" />
    <span />
  </div>
);
