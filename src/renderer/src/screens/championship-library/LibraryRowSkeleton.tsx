import { Shimmer } from '@/components';
import { FormatStripSkeleton } from '@/screens/championships';

// One row of the table while the library is read, cell for cell.
export const LibraryRowSkeleton = () => (
  <tr className="border-t first:border-t-0">
    <td className="w-14 px-2.5 py-2"><Shimmer className="h-4.5 w-8 rounded-full" /></td>
    <td className="px-2.5 py-2">
      <div className="flex flex-col gap-1.5">
        <Shimmer className="h-3.5 w-40" />
        <Shimmer className="hidden h-3 w-56 @[64rem]:block" />
      </div>
    </td>
    <td className="px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Shimmer className="h-5 w-24" />
        <Shimmer className="size-6 rounded-full" />
      </div>
    </td>
    <td className="hidden px-2.5 py-2 @[88rem]:table-cell"><Shimmer className="h-5 w-16" /></td>
    <td className="px-2.5 py-2">
      <div className="flex w-28 flex-col gap-1.5">
        <Shimmer className="h-3.5 w-16" />
        <Shimmer className="h-1.5 w-full rounded-full" />
      </div>
    </td>
    <td className="hidden px-2.5 py-2 @[70rem]:table-cell"><FormatStripSkeleton /></td>
    <td className="px-2.5 py-2"><Shimmer className="ml-auto h-3.5 w-20" /></td>
    <td className="hidden px-2.5 py-2 @[64rem]:table-cell"><Shimmer className="h-5 w-20" /></td>
    <td aria-hidden className="px-2.5 py-2" />
    <td aria-hidden className="w-12 px-2.5 py-2" />
  </tr>
);
