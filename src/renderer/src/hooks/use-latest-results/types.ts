import type { ResultRecord } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * The newest event's archived results, and how many there are in all.
 */
export interface LatestResultsState {
  /**
   * The newest event's records, newest first, or an empty list before the
   * first response and when nothing has been archived.
   */
  records: readonly ResultRecord[];
  /**
   * How many archives there are, every event's sessions together.
   */
  sessions: number;
  /**
   * Whether they are still loading.
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
