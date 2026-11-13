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
 * The sort menu's items, widened to what SortMenu takes.
 */
export const CAR_SORTS: readonly SortItem<CarSortKey>[] = CAR_SORT_ITEMS;

/**
 * Sorting by price, which only a browser inside a career offers.
 */
export const PRICE_SORT: SortItem<CarSortKey> = { key: 'price', label: 'cars.sort.price' };

/**
 * Sorting by what the week's sale takes off, which only a browser selling cars
 * in a career offers.
 */
export const DISCOUNT_SORT: SortItem<CarSortKey> = { key: 'discount', label: 'cars.sort.discount' };

/**
 * The power to weight a table's bar is drawn against, in bhp per tonne. Fixed
 * rather than the page's own best, so a bar means the same on every page; past
 * it, which only a few modern single-seaters reach, the bar is simply full.
 */
export const POWER_TO_WEIGHT_SCALE = 1000;

/**
 * How many classes the rail lists before the rest wait behind Show all.
 */
export const CLASS_TOP = 6;

/**
 * Where the car table shows each column it can do without, by the table's own
 * width: what matters least goes first. Below the last, class and source move
 * under the car's name rather than going, so only year, weight and liveries are
 * ever lost.
 */
export const CAR_COLUMN = {
  weight: 'hidden @[44rem]:table-cell',
  year: 'hidden @[50rem]:table-cell',
  liveries: 'hidden @[56rem]:table-cell',
  wide: 'hidden @[64rem]:table-cell',
  inline: '@[64rem]:hidden',
} as const;
