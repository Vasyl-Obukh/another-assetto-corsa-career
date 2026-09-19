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
  /**
   * Whether it is switched on before the user says either way.
   *
   * The library's call rather than the document's: some of the app's own
   * championships start switched off, and a user's own always starts on.
   */
  activeByDefault: boolean;
  /**
   * Whether it only stands in a rung of the ladder the app's own
   * championships leave empty, by repeating the rung below it with longer
   * races. Such championships are hidden together by one setting.
   */
  filler: boolean;
}

/**
 * One championship the app ships, and how it starts out.
 */
export interface ShippedSeries {
  /**
   * The championship itself.
   */
  series: Championship;
  /**
   * Whether it is switched on until the user says otherwise.
   */
  active: boolean;
  /**
   * Whether it only fills an empty rung of the ladder. See
   * SeriesListing.filler.
   */
  filler?: boolean;
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
