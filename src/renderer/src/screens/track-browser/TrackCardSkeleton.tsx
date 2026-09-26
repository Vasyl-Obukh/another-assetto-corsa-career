import { PosterSkeleton, Shimmer } from '@/components';

/**
 * A circuit's poster while the library is read: its map in the corner, its
 * figures, a row of layouts and where it races.
 */
export const TrackCardSkeleton = () => (
  <PosterSkeleton corner={<Shimmer className="absolute top-2 right-2 aspect-[4/3] w-[30%] rounded-lg" />}>
    <Shimmer className="my-1 h-3.5 w-48" />
    <div className="flex gap-1.5">
      <Shimmer className="h-8 w-11 rounded-md" />
      <Shimmer className="h-8 w-11 rounded-md" />
      <Shimmer className="h-8 w-11 rounded-md" />
    </div>
    <div className="mt-auto flex items-center gap-2 pt-0.5">
      <Shimmer className="h-3 w-28" />
      <Shimmer className="h-5.5 w-20" />
    </div>
  </PosterSkeleton>
);
