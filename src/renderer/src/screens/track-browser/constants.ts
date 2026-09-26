import type { ParseKeys } from 'i18next';

import type { TrackSortKey } from '../../../../shared/types';
import type { SortItem } from '@/components';

/**
 * Every key a track list can be sorted by, in the order the menu offers them.
 */
export const TRACK_SORT_ITEMS = [
  { key: 'name', label: 'tracks.sort.name' },
  { key: 'country', label: 'tracks.sort.country' },
  { key: 'length', label: 'tracks.sort.length' },
  { key: 'pitboxes', label: 'tracks.sort.pitboxes' },
] as const satisfies readonly { key: TrackSortKey; label: ParseKeys }[];

/**
 * The sort menu's items, widened to what SortMenu takes.
 */
export const TRACK_SORTS: readonly SortItem<TrackSortKey>[] = TRACK_SORT_ITEMS;

/**
 * How many layouts a card draws an outline for; a circuit with more shows the
 * first few and how many are left.
 */
export const LAYOUT_OUTLINES = 5;

/**
 * Where the track table shows each column it can do without, by the table's
 * own width: what matters least goes first. Country and source move under the
 * circuit's name rather than going, so only the layout count and whether it is
 * located are ever lost.
 */
export const TRACK_COLUMN = {
  layouts: 'hidden @[40rem]:table-cell',
  located: 'hidden @[46rem]:table-cell',
  wide: 'hidden @[54rem]:table-cell',
  inline: '@[54rem]:hidden',
} as const;
