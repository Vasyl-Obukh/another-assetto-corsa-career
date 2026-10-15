import { CAR_COLUMN } from './constants.ts';
import { Shimmer } from '@/components';
import { cn } from '@/lib/utils.ts';

interface CarRowSkeletonProps {
  /**
   * Whether the table carries a switch column, which the row keeps a cell for.
   */
  toggle: boolean;
}

/**
 * One line of the car table while the library is read, cell for cell with a
 * loaded row so the columns do not shift when the cars arrive.
 */
export const CarRowSkeleton = ({ toggle }: CarRowSkeletonProps) => (
  <tr className="border-t first:border-t-0">
    {toggle ? <td className="w-14 px-2.5 py-1.5"><Shimmer className="h-4.5 w-8 rounded-full" /></td> : null}
    <td className="w-20 py-1.5 pr-1 pl-2.5 @[44rem]:w-28">
      <Shimmer deep className="h-10 w-16 rounded-md @[44rem]:h-13 @[44rem]:w-24" />
    </td>
    <td className="px-2.5 py-1.5">
      <div className="flex flex-col gap-1.5">
        <Shimmer className="h-3.5 w-48" />
        <Shimmer className="h-3 w-20" />
      </div>
    </td>
    <td className={cn('px-2.5 py-1.5', CAR_COLUMN.wide)}><Shimmer className="h-5.5 w-24" /></td>
    <td className={cn('px-2.5 py-1.5', CAR_COLUMN.year)}><Shimmer className="ml-auto h-3 w-9" /></td>
    <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3 w-8" /></td>
    <td className={cn('px-2.5 py-1.5', CAR_COLUMN.weight)}><Shimmer className="ml-auto h-3 w-10" /></td>
    <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3 w-20" /></td>
    <td className={cn('px-2.5 py-1.5', CAR_COLUMN.liveries)}><Shimmer className="ml-auto h-3 w-5" /></td>
    <td className="px-2.5 py-1.5"><Shimmer className="h-3 w-8" /></td>
    <td className={cn('px-2.5 py-1.5', CAR_COLUMN.wide)}><Shimmer className="h-5.5 w-20" /></td>
  </tr>
);
