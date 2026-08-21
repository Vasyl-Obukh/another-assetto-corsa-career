import type { ParseKeys } from 'i18next';

import type { CarSortKey } from '../../../../shared/types';
import type { SortItem } from '@/components';

/**
 * Every key a car list can be sorted by, in the order the menu offers them.
 */
export const CAR_SORT_ITEMS = [
  { key: 'name', label: 'cars.sort.name' },
  { key: 'brand', label: 'cars.sort.brand' },
  { key: 'year', label: 'cars.sort.year' },
  { key: 'bhp', label: 'cars.sort.bhp' },
  { key: 'weight', label: 'cars.sort.weight' },
  { key: 'powerToWeight', label: 'cars.sort.powerToWeight' },
] as const satisfies readonly { key: CarSortKey; label: ParseKeys }[];

/**
 * The sort menu's items, widened to what SortSelect takes.
 */
export const CAR_SORTS: readonly SortItem<CarSortKey>[] = CAR_SORT_ITEMS;
