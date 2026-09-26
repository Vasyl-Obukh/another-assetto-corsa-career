import type { Car } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * One completed lookup, tagged with the request it answered.
 *
 * The key is what makes `loading` derivable during render: a state built for
 * another car is by definition not the answer to the one being asked for now.
 */
export interface CarState {
  /**
   * The lookup this state answers, or an empty string before the first one.
   */
  key: string;
  /**
   * What the lookup found, null when nothing is installed under that ID.
   */
  car: Car | null;
  /**
   * Why the lookup failed, or null when it did not.
   */
  error: DisplayableError | null;
}

/**
 * Everything the car detail screen needs: the car and how loading it went.
 */
export interface CarDetail {
  /**
   * The car, null while it is loading and once it turns out not to be installed.
   */
  car: Car | null;
  /**
   * Whether the first load is still in flight.
   */
  loading: boolean;
  /**
   * True once the lookup came back with nothing, which is what an uninstalled
   * car looks like. Distinct from loading, since both leave car null.
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
