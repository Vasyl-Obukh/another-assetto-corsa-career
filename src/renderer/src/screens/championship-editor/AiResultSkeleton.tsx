import { Shimmer } from '@/components';
import { cn } from '@/lib/utils.ts';

interface AiResultSkeletonProps {
  /**
   * The figure's label, already translated.
   */
  label: string;
  /**
   * Whether the loaded box carries a hint under its label.
   */
  hint?: boolean;
  /**
   * What the scale's two ends are called.
   */
  ends: readonly [string, string];
  /**
   * Whether it is drawn without a box of its own, as the loaded one is.
   */
  bare?: boolean;
}

/**
 * One AI figure while it is read, in `AiResult`'s own frame: its real label and
 * the ends of its scale, and the stepper, the figure, the band and the drivers'
 * spread still to come.
 */
export const AiResultSkeleton = ({
  label, hint = false, ends, bare = false,
}: AiResultSkeletonProps) => (
  <div className={cn('flex flex-col gap-2.5', !bare && 'rounded-lg border p-3')}>
    <div className="flex items-center gap-2">
      <span className="flex min-w-0 flex-1 flex-col text-sm font-medium">
        {label}
        {hint ? <Shimmer className="my-0.5 h-3 w-28" /> : null}
      </span>
      <Shimmer className="h-9 w-28 rounded-md" />
    </div>
    <div className="flex items-end gap-x-2.5">
      <Shimmer className="h-6 w-10" />
      <Shimmer className="my-0.5 h-3 w-40" />
    </div>
    <div className="flex h-6 items-center">
      <Shimmer className="h-1.5 w-full rounded-full" />
    </div>
    <div className="flex items-center text-xs text-muted-foreground">
      <span className="flex-1">{ends[0]}</span>
      <Shimmer className="my-0.5 h-3 w-20" />
      <span className="flex-1 text-right">{ends[1]}</span>
    </div>
  </div>
);
