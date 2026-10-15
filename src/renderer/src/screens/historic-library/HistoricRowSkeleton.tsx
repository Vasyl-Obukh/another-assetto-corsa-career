import { Shimmer } from '@/components';
import { FormatStripSkeleton } from '@/screens/championships';

// One row of the table while the pool is read, cell for cell.
export const HistoricRowSkeleton = () => (
  <tr className="border-t first:border-t-0">
    <td className="w-14 px-2.5 py-2"><Shimmer className="h-4.5 w-8 rounded-full" /></td>
    <td className="px-2.5 py-2">
      <div className="flex flex-col gap-1.5">
        <Shimmer className="h-3.5 w-40" />
        <div className="flex items-center gap-2.5">
          <Shimmer deep className="aspect-[16/10] w-12 rounded-md" />
          <Shimmer className="h-3 w-16" />
        </div>
      </div>
    </td>
    <td className="px-2.5 py-2"><Shimmer className="h-5 w-28" /></td>
    <td className="hidden px-2.5 py-2 @[52rem]:table-cell"><Shimmer className="h-3 w-24" /></td>
    <td className="px-2.5 py-2"><Shimmer className="ml-auto h-3 w-5" /></td>
    <td className="hidden px-2.5 py-2 @[44rem]:table-cell"><FormatStripSkeleton /></td>
    <td aria-hidden className="px-2.5 py-2" />
    <td aria-hidden className="w-12 px-2.5 py-2" />
  </tr>
);
