import type { Discipline, SortDirection } from '../../../../shared/types';
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

/**
 * The Tracks tab's filters and sort, kept between visits.
 */
export interface TracksCriteria {
  /**
   * The states ticked, none meaning every one.
   */
  states: TrackState[];
  /**
   * The disciplines ticked, none meaning every one.
   */
  disciplines: Discipline[];
  /**
   * What the list is sorted by.
   */
  sort: TrackSortKey;
  /**
   * Which way.
   */
  direction: SortDirection;
}
