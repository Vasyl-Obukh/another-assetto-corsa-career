import { PosterSkeleton, Shimmer } from '@/components';
import type { CarTrade } from '@/components';

interface CarCardSkeletonProps {
  /**
   * Which browser with money the card belongs to, whose foot it keeps room
   * for: the Store's and a picker's price band, or the Garage's facts and
   * buttons.
   */
  trade?: CarTrade['mode'];
}

/**
 * A car's poster while the library is read: its class chip, its figures and
 * where it races - and, in a browser with money, what closes the card.
 */
export const CarCardSkeleton = ({ trade }: CarCardSkeletonProps) => (
  <PosterSkeleton>
    <Shimmer className="h-5.5 w-24" />
    <Shimmer className="my-1 h-3.5 w-44" />
    {trade === 'garage' ? (
      <div className="mt-auto flex flex-col gap-3">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-8 w-full rounded-md" />
      </div>
    ) : (
      <div className="mt-auto flex items-center gap-2 pt-0.5">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="h-5.5 w-16" />
      </div>
    )}
    {trade !== undefined && trade !== 'garage' ? (
      <div className="-mx-3 -mb-3 flex items-center gap-3 bg-muted px-3 py-2.5">
        <div className="flex min-h-11 flex-col justify-center">
          <Shimmer deep className="h-4.5 w-20" />
        </div>
      </div>
    ) : null}
  </PosterSkeleton>
);
