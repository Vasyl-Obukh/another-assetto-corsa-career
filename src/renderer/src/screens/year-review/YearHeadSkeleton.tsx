import { Shimmer } from '@/components';

/**
 * The year's title row while the career is read, where the pinned header holds
 * it once loaded.
 */
export const YearHeadSkeleton = () => (
  <div className="flex items-end gap-3">
    <Shimmer className="h-7 w-16" />
    <Shimmer className="h-5.5 w-16" />
    <Shimmer className="mb-0.5 h-3.5 w-56" />
  </div>
);
