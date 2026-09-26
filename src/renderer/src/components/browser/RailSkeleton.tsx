import { RAIL_SKELETON_WIDTHS, RAIL_TOP } from './constants.ts';
import { Shimmer } from '@/components/Shimmer.tsx';
import { slots } from '@/lib/slots.ts';

interface RailSkeletonProps {
  /**
   * How many options to hold places for - by default as many as a long list
   * shows before it folds.
   */
  rows?: number;
}

/**
 * A rail list whose values are still being read: a checkbox, a name and a count
 * a row, at an option's own height.
 */
export const RailSkeleton = ({ rows = RAIL_TOP }: RailSkeletonProps) => (
  <>
    {slots(rows).map((at) => (
      <div key={at} className="flex items-center gap-2 px-1 py-1.5">
        <span aria-hidden className="size-3.5 shrink-0 rounded-[4px] border border-foreground/15" />
        <Shimmer className={`h-2.5 ${RAIL_SKELETON_WIDTHS[at % RAIL_SKELETON_WIDTHS.length]}`} />
        <Shimmer className="ml-auto h-2.5 w-4" />
      </div>
    ))}
  </>
);
