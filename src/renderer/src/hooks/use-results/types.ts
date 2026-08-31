import type { ResultRecord } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Every result the app has archived.
 */
export interface ResultsState {
  /**
   * The records, newest first, or an empty list before the first response.
   */
  records: ResultRecord[];
  /**
   * Whether the list is still loading.
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
