import type { TrackGroup } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * One completed lookup, tagged with the request it answered, the way the car
 * page's is.
 */
export interface TrackState {
  /**
   * The lookup this state answers, or an empty string before the first one.
   */
  key: string;
  /**
   * What the lookup found, null when nothing is installed under that ID.
   */
  circuit: TrackGroup | null;
  /**
   * Why the lookup failed, or null when it did not.
   */
  error: DisplayableError | null;
}

/**
 * Everything the track page needs: the circuit and how loading it went.
 */
export interface TrackDetail {
  /**
   * The circuit with every layout of it, null while it loads and once it turns
   * out not to be installed.
   */
  circuit: TrackGroup | null;
  /**
   * Whether the first load is still in flight.
   */
  loading: boolean;
  /**
   * True once the lookup came back with nothing.
   */
  missing: boolean;
  /**
   * Why the lookup failed, or null when it did not.
   */
  error: DisplayableError | null;
  /**
   * Dismisses the error card.
   */
  dismissError(): void;
}
