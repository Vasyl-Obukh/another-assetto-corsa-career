import type { RaceOut } from '../../../shared/types/index.ts';

/**
 * A result file and where it was read from.
 */
export interface LoadedResult {
  /**
   * Absolute path to the file on disk.
   */
  file: string;
  /**
   * What was recorded alongside the result, when the file is an archive.
   */
  meta: {
    /**
     * When the archive was written.
     */
    recordedAt?: string;
    /**
     * The race definition it came from.
     */
    raceId?: string;
    /**
     * That race's display name.
     */
    raceName?: string;
    /**
     * How the result was captured, for example "watch".
     */
    source?: string;
  };
  /**
   * AC's own result payload, unwrapped from the archive envelope.
   */
  result: RaceOut;
}
