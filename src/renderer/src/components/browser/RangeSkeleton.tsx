import { RANGE_SKELETON_BINS } from './constants.ts';
import { Shimmer } from '@/components/Shimmer.tsx';
import { slots } from '@/lib/slots.ts';

/**
 * A range filter whose spread is still being read: a flat run of histogram
 * bars, the slider's track and the two values under it.
 */
export const RangeSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="flex h-8 items-end gap-px">
      {slots(RANGE_SKELETON_BINS).map((at) => <Shimmer key={at} className="h-1.5 flex-1 rounded-t-[2px] rounded-b-none" />)}
    </div>
    <Shimmer className="my-1.5 h-1.5 w-full rounded-full" />
    <div className="flex items-center gap-2">
      <Shimmer className="h-6 flex-1" />
      <Shimmer className="h-6 flex-1" />
    </div>
  </div>
);
