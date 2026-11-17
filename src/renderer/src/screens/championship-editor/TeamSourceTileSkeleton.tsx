import { Shimmer } from '@/components';

/**
 * A team picker tile while the libraries load: a name, a row of chips, a row
 * of flags and a count.
 */
export const TeamSourceTileSkeleton = () => (
  <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
    <Shimmer className="h-4 w-3/4 rounded" />
    <span className="flex gap-1">
      <Shimmer className="h-5 w-20 rounded-md" />
      <Shimmer className="size-5 rounded-full" />
    </span>
    <Shimmer className="h-3.5 w-36 rounded-[2px]" />
    <Shimmer className="h-3 w-16 rounded" />
  </div>
);
