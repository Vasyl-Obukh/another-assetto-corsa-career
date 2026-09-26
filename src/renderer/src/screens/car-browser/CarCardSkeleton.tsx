import { PosterSkeleton, Shimmer } from '@/components';

/**
 * A car's poster while the library is read: its class chip, its figures and
 * where it races.
 */
export const CarCardSkeleton = () => (
  <PosterSkeleton>
    <Shimmer className="h-5.5 w-24" />
    <Shimmer className="my-1 h-3.5 w-44" />
    <div className="mt-auto flex items-center gap-2 pt-0.5">
      <Shimmer className="h-3 w-28" />
      <Shimmer className="h-5.5 w-16" />
    </div>
  </PosterSkeleton>
);
