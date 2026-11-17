import { Loading, Shimmer } from '@/components';

/**
 * The version and update line while main answers, with the button an
 * installed build always shows beside them.
 */
export const UpdateStatusSkeleton = () => (
  <Loading className="flex flex-1 flex-wrap items-center justify-between gap-3">
    <div className="flex flex-col gap-1.5">
      <Shimmer className="h-4 w-28" />
      <Shimmer className="h-4 w-44" />
    </div>
    <Shimmer className="h-9 w-32" />
  </Loading>
);
