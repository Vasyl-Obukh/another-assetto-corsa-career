import { Shimmer } from '@/components';

/**
 * The career picked while the careers are read.
 */
export const CareerHeroSkeleton = () => (
  <div className="flex min-h-52 flex-col gap-2.5 rounded-xl border bg-card px-6 py-5">
    <div className="flex gap-1.5">
      <Shimmer className="h-5 w-16 rounded-md" />
      <Shimmer className="h-5 w-24 rounded-md" />
    </div>
    <div className="flex items-center gap-2.5">
      <Shimmer className="h-[18px] w-[27px] rounded-[3px]" />
      <Shimmer className="h-7 w-48" />
    </div>
    <Shimmer className="h-3.5 w-72" />
    <Shimmer className="h-3.5 w-80" />
    <Shimmer className="mt-1.5 h-10 w-32 rounded-md" />
  </div>
);
