import type { ChampionshipResults } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * What was loaded, and for which championship and run.
 */
export interface ChampionshipResultsState {
  /**
   * The championship and run this state answers - its id, and the season and
   * edition asked for.
   */
  key: string;
  /**
   * The season so far, or null when it could not be read.
   */
  results: ChampionshipResults | null;
  /**
   * Why it could not be read, or null.
   */
  error: DisplayableError | null;
}

/**
 * A championship's season so far, as the results screens read it.
 */
export interface ChampionshipResultsDetail {
  /**
   * The season, or null while it is loading or could not be read.
   */
  results: ChampionshipResults | null;
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
