import { Loading, Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';

/**
 * The Deal of the week while its car is read: the banner's frame, its picture
 * and its lines still to come.
 */
export const DealBannerSkeleton = () => (
  <Loading>
    <Card className="grid grid-cols-[minmax(0,26rem)_minmax(0,1fr)] gap-0 overflow-hidden py-0 ring-2 ring-sale-solid">
      <Shimmer className="min-h-60 rounded-none" deep />
      <div className="flex min-w-0 flex-col gap-2.5 px-5 py-4">
        <Shimmer className="h-5 w-48" />
        <Shimmer className="h-7 w-72" />
        <Shimmer className="h-5 w-56" />
        <Shimmer className="h-4 w-60" />
        <Shimmer className="h-4 w-44" />
        <div className="mt-auto flex items-end gap-4 border-t pt-3">
          <Shimmer className="h-14 w-40" />
          <Shimmer className="ml-auto h-10 w-32" />
        </div>
      </div>
    </Card>
  </Loading>
);
