import type { ResultRecord } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * What was loaded, and what the state it was loaded under was.
 *
 * The key it was built from is kept so `loading` can be derived during render
 * rather than written by an effect, and so a late response for a file the user
 * has already navigated away from is dropped rather than merged.
 */
export interface ResultState {
  /**
   * The key this state answers, as `<nonce>:<file>`.
   */
  key: string;
  /**
   * The record, or null when it could not be read.
   */
  record: ResultRecord | null;
  /**
   * Why it could not be read, or null.
   */
  error: DisplayableError | null;
}

/**
 * One archived result, as the detail screen renders it.
 */
export interface ResultDetail {
  /**
   * The record, or null while it is loading or missing.
   */
  record: ResultRecord | null;
  /**
   * Whether it is still loading.
   */
  loading: boolean;
  /**
   * Why it could not be read, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
}
