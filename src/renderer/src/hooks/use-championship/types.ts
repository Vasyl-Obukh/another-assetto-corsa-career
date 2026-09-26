import type { SeriesListing } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * What was loaded, and which championship it was loaded for.
 *
 * Keyed the way use-result is, so the previous championship is never rendered
 * as this one while the new read is in flight, and a late answer for one the
 * user has navigated away from is dropped rather than merged.
 */
export interface ChampionshipLoad {
  /**
   * The championship id this state answers, with a nonce so a content change
   * re-reads rather than being mistaken for the same key.
   */
  key: string;
  /**
   * The listing, or null when the library has no such championship.
   */
  listing: SeriesListing | null;
}

/**
 * One championship, as the detail screen renders it.
 */
export interface ChampionshipState {
  /**
   * The championship and its availability, or null while loading or missing.
   */
  listing: SeriesListing | null;
  /**
   * Whether it is still loading.
   */
  loading: boolean;
  /**
   * Why something failed, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
}
