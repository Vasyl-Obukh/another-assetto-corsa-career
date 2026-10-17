import { Shimmer } from '@/components';

/**
 * A tile's continue line while the careers or the races are read: outlined
 * rather than filled, since the shimmer barely shows on the muted strip, and
 * one border's width less padding so it stands exactly as tall.
 */
export const ContinueLineSkeleton = () => (
  <div className="flex items-center gap-2.5 rounded-lg border px-[11px] py-[9px]">
    <Shimmer className="h-[18px] w-[27px] rounded-[3px]" />
    <div className="flex flex-1 flex-col">
      <span className="flex h-5 items-center"><Shimmer className="h-3.5 w-2/3" /></span>
      <span className="flex h-4 items-center"><Shimmer className="h-2.5 w-1/2" /></span>
    </div>
  </div>
);
