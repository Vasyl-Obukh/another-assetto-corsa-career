import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

import { nextSort } from './utils.ts';
import type { ChampionshipCriteria, ChampionshipSortKey } from '@/hooks';
import { cn } from '@/lib/utils.ts';
import { TABLE_HEADING } from '@/screens/championships';

interface SortHeadingProps {
  /**
   * The column's name.
   */
  label: string;
  /**
   * The sort the column stands for - one the sort menu offers too.
   */
  sort: ChampionshipSortKey;
  /**
   * The list's filters and sort now.
   */
  criteria: ChampionshipCriteria;
  /**
   * Applies the sort a click asks for.
   * @param next The criteria with it
   */
  onChange(next: ChampionshipCriteria): void;
}

// A column heading that sorts the table by its column, and turns it the other
// way on a second click. The same sort the toolbar's menu sets, so the two can
// never disagree about the order showing.
export const SortHeading = ({
  label, sort, criteria, onChange,
}: SortHeadingProps) => {
  const on = criteria.sort === sort;
  const ascending = criteria.direction === 'asc';
  const Arrow = ascending ? ArrowUpIcon : ArrowDownIcon;
  let order: 'ascending' | 'descending' | 'none' = 'none';
  if (on) order = ascending ? 'ascending' : 'descending';

  return (
    <th scope="col" aria-sort={order} className={TABLE_HEADING}>
      <button
        type="button"
        className={cn('inline-flex items-center gap-1 uppercase hover:text-foreground', on && 'text-foreground')}
        onClick={() => onChange(nextSort(criteria, sort))}
      >
        {label}
        {on ? <Arrow className="size-3" /> : null}
      </button>
    </th>
  );
};
