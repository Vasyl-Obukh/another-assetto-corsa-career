import { PODIUM_PLACES } from './constants.ts';
import { ResultCell } from './ResultCell.tsx';
import { Shimmer } from '../Shimmer.tsx';

/**
 * A race's podium while its result is read: the three cards with their places
 * in their metals, and the picture, driver and team still to come.
 */
export const PodiumSkeleton = () => (
  <div className="grid gap-3 sm:grid-cols-3">
    {PODIUM_PLACES.map((place) => (
      <div key={place} className="relative overflow-hidden rounded-lg border bg-card">
        <div className="relative aspect-[16/7]">
          <Shimmer deep className="absolute inset-0 rounded-none" />
          <ResultCell position={place} scored prefixed className="absolute top-2 left-2" />
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="flex items-center gap-2">
            <Shimmer className="h-3 w-4.5 rounded-sm" />
            <Shimmer className="my-0.5 h-4 w-28" />
          </span>
          <span className="flex justify-between gap-2">
            <Shimmer className="my-0.5 h-3 w-20" />
            <Shimmer className="my-0.5 h-3 w-14" />
          </span>
        </div>
      </div>
    ))}
  </div>
);
