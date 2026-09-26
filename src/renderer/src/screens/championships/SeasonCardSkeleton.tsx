import { ROUND_SKELETON } from './constants.ts';
import { FormatStripSkeleton } from './FormatStripSkeleton.tsx';
import { Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';

/**
 * A settings season card while the library is read: its band, name and switch,
 * description, what it needs, and the season's shape at its foot.
 */
export const SeasonCardSkeleton = () => (
  <Card className="gap-0 overflow-hidden py-0">
    <div className="flex items-center gap-2 bg-muted py-2 pr-2 pl-4">
      <Shimmer className="h-2.5 w-16" />
      <Shimmer className="ml-auto size-6 rounded-full" />
      <Shimmer className="h-4 w-1.5" />
    </div>

    <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-3">
      <div className="flex items-start gap-3">
        <Shimmer className="my-1 h-4 w-3/5" />
        <Shimmer className="ml-auto h-[1.15rem] w-8 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-4/5" />
      </div>
      <div className="flex items-center gap-2">
        <Shimmer className="h-2.5 w-9" />
        <Shimmer className="h-5.5 w-12" />
        <Shimmer className="h-5.5 w-10" />
      </div>
    </div>

    <div className="flex flex-col gap-2 border-t px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <Shimmer className="h-3 w-14" />
        <FormatStripSkeleton />
      </div>
      <div className="flex gap-0.5">
        {slots(ROUND_SKELETON).map((at) => <Shimmer key={at} className="h-1.5 flex-1 rounded-full" />)}
      </div>
    </div>
  </Card>
);
