import { Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { FormatStripSkeleton } from '@/screens/championships';

// A historic event's card while the pool is read: its band, title and switch,
// description, track line and foot, each where the card puts them.
export const HistoricCardSkeleton = () => (
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
      <div className="flex items-center gap-2.5">
        <Shimmer deep className="aspect-[16/10] w-16 rounded-md" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
      <Shimmer className="h-3 w-14" />
      <FormatStripSkeleton />
    </div>
  </Card>
);
