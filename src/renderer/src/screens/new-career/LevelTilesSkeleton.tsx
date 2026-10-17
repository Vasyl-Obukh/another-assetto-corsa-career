import { LEVEL_GRID, LEVEL_SKELETON } from './constants.ts';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * The starting levels while the library is read.
 */
export const LevelTilesSkeleton = () => (
  <Loading className={LEVEL_GRID}>
    {slots(LEVEL_SKELETON).map((at) => (
      <div key={at} className="flex flex-col gap-2 rounded-lg border p-2.5">
        <div className="flex items-center gap-2">
          <Shimmer className="h-5 w-14 rounded-md" />
          <Shimmer className="h-2.5 w-14" />
        </div>
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-3/4" />
        <Shimmer className="mt-1 h-3 w-24" />
      </div>
    ))}
  </Loading>
);
