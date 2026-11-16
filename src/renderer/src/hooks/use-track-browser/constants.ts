import type { StoredTrackCriteria, TrackCriteria } from './types.ts';
import {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../shared/types';
import type { TrackSortKey } from '../../../../shared/types';
import { stringEnumValues } from '../../../../shared/utils/coerce';
import { BROWSER_VIEWS } from '@/lib/browser-memory';
import { SORT_DIRECTIONS } from '@/lib/stored-preference';
import type { FieldShape } from '@/lib/stored-preference';

/**
 * No filters, default sort - what the browser opens on and what Clear restores.
 */
export const EMPTY_CRITERIA: TrackCriteria = {};

/**
 * How long the search box has to stay still before it costs an IPC call.
 */
export const SEARCH_DEBOUNCE_MS = 250;

/**
 * Every order the track list can be sorted in, listed as a record so a new one
 * does not compile until it is named here.
 */
const TRACK_SORT_KEYS = Object.keys({
  name: true, country: true, length: true, pitboxes: true,
} satisfies Record<TrackSortKey, true>) as TrackSortKey[];

/**
 * What each filter a track browser saves has to be to be read back.
 */
export const TRACK_CRITERIA_SHAPE: FieldShape<StoredTrackCriteria> = {
  countries: 'strings',
  lengthFrom: 'number',
  lengthTo: 'number',
  pitboxesFrom: 'number',
  pitboxesTo: 'number',
  sources: { members: stringEnumValues(ContentSource) },
  packs: { members: stringEnumValues(DLCPack) },
  makers: { members: stringEnumValues(ModMaker) },
  distributors: { members: stringEnumValues(ModDistributor) },
  hasGeotags: 'boolean',
  sort: TRACK_SORT_KEYS,
  direction: SORT_DIRECTIONS,
  raced: 'boolean',
  view: BROWSER_VIEWS,
};

/**
 * Where every track picker keeps the one thing pickers share, the layout.
 */
export const TRACK_PICKER_MEMORY = 'track-picker';
