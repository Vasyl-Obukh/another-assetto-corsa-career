import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship, SeriesOrigin } from '../../shared/types/index.ts';

/**
 * A championship, and where it came from.
 */
export interface LoadedSeries {
  /**
   * The championship itself.
   */
  series: Championship;
  /**
   * Whether the app ships it, the user wrote it, or the user replaced a
   * shipped one with it.
   */
  origin: SeriesOrigin;
  /**
   * The file it was read from, named for a problem rather than for a path.
   * Null for a shipped championship, which is compiled in rather than read.
   */
  file: string | null;
}

/**
 * Everything a directory of championship files held.
 */
export interface LoadedLibrary {
  /**
   * Every championship, in ladder order.
   */
  series: LoadedSeries[];
  /**
   * Everything wrong with the user files that did not read, and with ids
   * claimed twice. Always empty of anything to do with the shipped half.
   */
  problems: AppErrorInfo[];
}
