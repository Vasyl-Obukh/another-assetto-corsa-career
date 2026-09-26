import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

import type { SortDirection } from '../../../../shared/types';
import { cn } from '@/lib/utils.ts';

interface SortHeaderProps<K extends string> {
  /**
   * The column's name, already translated.
   */
  label: string;
  /**
   * What clicking it sorts by, or undefined for a column the list cannot be
   * sorted on.
   */
  sortKey?: K;
  /**
   * What the list is sorted by now.
   */
  sort: K;
  /**
   * Which way it runs.
   */
  direction: SortDirection;
  /**
   * Whether the column holds figures, which line up on the right.
   */
  numeric?: boolean;
  /**
   * Classes for the cell, such as when a narrow table hides the column.
   */
  className?: string;
  /**
   * Sorts by this column - the other way round when it already is.
   * @param key The column's sort key
   * @param direction Which way to run
   */
  onSort(key: K, direction: SortDirection): void;
}

/**
 * A table heading that sorts the list by its column.
 *
 * A column of figures sorts biggest first the first time it is clicked, since
 * that is what anyone sorting by power is looking for.
 */
export const SortHeader = <K extends string>({
  label, sortKey, sort, direction, numeric = false, className, onSort,
}: SortHeaderProps<K>) => {
  const active = sortKey !== undefined && sortKey === sort;
  let ariaSort: 'ascending' | 'descending' | undefined;
  if (active) ariaSort = direction === 'asc' ? 'ascending' : 'descending';

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn(
        'px-2.5 py-2.5 text-left text-xs font-medium whitespace-nowrap text-muted-foreground',
        numeric && 'text-right',
        className,
      )}
    >
      {sortKey === undefined ? label : (
        <button
          type="button"
          className={cn('inline-flex items-center gap-1 hover:text-foreground', active && 'font-semibold text-foreground')}
          onClick={() => {
            if (active) onSort(sortKey, direction === 'asc' ? 'desc' : 'asc');
            else onSort(sortKey, numeric ? 'desc' : 'asc');
          }}
        >
          {label}
          {active && direction === 'asc' ? <ArrowUpIcon className="size-3" /> : null}
          {active && direction === 'desc' ? <ArrowDownIcon className="size-3" /> : null}
        </button>
      )}
    </th>
  );
};
