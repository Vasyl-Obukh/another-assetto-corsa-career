import type { TrackRowKind } from '@/lib/track-rows';

/**
 * What the Tracks tab narrows its circuits to: all of them, or those with a
 * layout reading one way.
 */
export type TrackFilter = 'all' | TrackState;

/**
 * A layout's state as the filters name it: Installed takes in the player's own
 * picks.
 */
export type TrackState = Exclude<TrackRowKind, 'choice'>;

/**
 * What the Tracks tab sorts its circuits by.
 */
export type TrackSortKey = 'championships' | 'name' | 'country';
