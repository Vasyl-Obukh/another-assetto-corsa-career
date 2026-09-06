import type { AppErrorInfo } from '../../../../shared/errors';
import type { SeriesListing } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Every championship, as the list screen renders them.
 */
export interface ChampionshipsState {
  /**
   * The championships and their availability, in ladder order.
   */
  listings: readonly SeriesListing[];
  /**
   * Everything wrong with the championship files the user wrote, which is a
   * different thing from the read itself failing: the library still loaded.
   */
  problems: readonly AppErrorInfo[];
  /**
   * Whether the first read is still in flight.
   */
  loading: boolean;
  /**
   * Why they could not be read, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
}
