import { CAR_COLUMN } from './constants.ts';
import { Shimmer } from '@/components';
import type { CarTrade } from '@/components';
import { cn } from '@/lib/utils.ts';

interface CarRowSkeletonProps {
  /**
   * Whether the table carries a switch column, which the row keeps a cell for.
   */
  toggle: boolean;
  /**
   * Which browser with money the table belongs to, whose columns the row
   * follows: the Store's and a picker's priced ones, or the Garage's own.
   */
  trade?: CarTrade['mode'];
  /**
   * Whether the table ends in a price and Edit price, as Your content's does.
   */
  appraised?: boolean;
}

/**
 * One line of the car table while the library is read, cell for cell with a
 * loaded row so the columns do not shift when the cars arrive.
 */
export const CarRowSkeleton = ({ toggle, trade, appraised = false }: CarRowSkeletonProps) => {
  const image = (
    <td className="w-20 py-1.5 pr-1 pl-2.5 @[44rem]:w-28">
      <Shimmer deep className="h-10 w-16 rounded-md @[44rem]:h-13 @[44rem]:w-24" />
    </td>
  );
  const name = (
    <td className="px-2.5 py-1.5">
      <div className="flex flex-col gap-1.5">
        <Shimmer className="h-3.5 w-48" />
        <Shimmer className="h-3 w-20" />
      </div>
    </td>
  );

  if (trade === 'garage') {
    return (
      <tr className="border-t first:border-t-0">
        {image}
        {name}
        <td className="px-2.5 py-1.5"><Shimmer className="h-3.5 w-24" /></td>
        <td className="px-2.5 py-1.5"><Shimmer className="h-3.5 w-20" /></td>
        <td className="px-2.5 py-1.5"><Shimmer className="h-3.5 w-32" /></td>
        <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3.5 w-12" /></td>
        <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3.5 w-16" /></td>
        <td className="w-12 px-2.5 py-1.5"><Shimmer className="ml-auto size-8 rounded-md" /></td>
      </tr>
    );
  }

  const priced = trade !== undefined;

  return (
    <tr className="border-t first:border-t-0">
      {toggle ? <td className="w-14 px-2.5 py-1.5"><Shimmer className="h-4.5 w-8 rounded-full" /></td> : null}
      {image}
      {name}
      <td className={cn('px-2.5 py-1.5', CAR_COLUMN.wide)}><Shimmer className="h-5.5 w-24" /></td>
      <td className={cn('px-2.5 py-1.5', CAR_COLUMN.year)}><Shimmer className="ml-auto h-3 w-9" /></td>
      <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3 w-8" /></td>
      <td className={cn('px-2.5 py-1.5', CAR_COLUMN.weight)}><Shimmer className="ml-auto h-3 w-10" /></td>
      <td className={cn('px-2.5 py-1.5', priced && 'hidden')}><Shimmer className="ml-auto h-3 w-20" /></td>
      <td className={cn('px-2.5 py-1.5', priced ? 'hidden' : CAR_COLUMN.liveries)}><Shimmer className="ml-auto h-3 w-5" /></td>
      <td className="px-2.5 py-1.5"><Shimmer className="h-3 w-8" /></td>
      <td className={cn('px-2.5 py-1.5', priced ? 'hidden' : CAR_COLUMN.wide)}><Shimmer className="h-5.5 w-20" /></td>
      {priced ? (
        <>
          <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3.5 w-16" /></td>
          <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3.5 w-12" /></td>
        </>
      ) : null}
      {appraised ? (
        <>
          <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-3.5 w-28" /></td>
          <td className="w-1 px-2.5 py-1.5"><Shimmer className="ml-auto size-8 rounded-md" /></td>
        </>
      ) : null}
      {trade === 'store' ? <td className="px-2.5 py-1.5"><Shimmer className="ml-auto h-8 w-32 rounded-md" /></td> : null}
    </tr>
  );
};
