import type { ParseKeys } from 'i18next';

import type {
  TrackFilter, TracksCriteria, TrackSortKey, TrackState,
} from './types.ts';
import type { SortItem } from '@/components';

/**
 * The filters setup's step offers, in the order it lists them: what wants
 * doing first.
 */
export const TRACK_FILTERS: readonly { id: TrackFilter; label: ParseKeys }[] = [
  { id: 'all', label: 'recommendedTracks.filter.all' },
  { id: 'missing', label: 'recommendedTracks.filter.missing' },
  { id: 'guess', label: 'recommendedTracks.filter.guess' },
  { id: 'kunos', label: 'recommendedTracks.filter.kunos' },
  { id: 'found', label: 'recommendedTracks.filter.found' },
];

/**
 * The states the Tracks tab's rail filters on, in the same order.
 */
export const TRACK_STATES: readonly TrackState[] = ['missing', 'guess', 'kunos', 'found'];

/**
 * What the Tracks tab sorts by.
 */
export const TRACK_SORT_ITEMS: readonly SortItem<TrackSortKey>[] = [
  { key: 'championships', label: 'recommendedTracks.sort.championships' },
  { key: 'name', label: 'recommendedTracks.sort.name' },
  { key: 'country', label: 'recommendedTracks.sort.country' },
];

/**
 * What the Tracks tab opens on the first time: nothing ticked, the most raced
 * circuits first.
 */
export const DEFAULT_TRACKS_CRITERIA: TracksCriteria = {
  states: [],
  disciplines: [],
  sort: 'championships',
  direction: 'desc',
};

/**
 * Where the Tracks tab keeps its filters and sort, and its search for the
 * window.
 */
export const TRACKS_MEMORY = 'recommended-tracks';
