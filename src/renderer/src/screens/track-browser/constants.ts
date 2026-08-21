import type { ParseKeys } from 'i18next';

import type { TrackSortKey } from '../../../../shared/types';
import type { SortItem } from '@/components';

/**
 * Every key a track list can be sorted by, in the order the menu offers them.
 */
export const TRACK_SORT_ITEMS = [
  { key: 'name', label: 'tracks.sort.name' },
  { key: 'country', label: 'tracks.sort.country' },
  { key: 'pitboxes', label: 'tracks.sort.pitboxes' },
] as const satisfies readonly { key: TrackSortKey; label: ParseKeys }[];

/**
 * The sort menu's items, widened to what SortSelect takes.
 */
export const TRACK_SORTS: readonly SortItem<TrackSortKey>[] = TRACK_SORT_ITEMS;
