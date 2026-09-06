import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship } from '../../shared/types/index.ts';

/**
 * What reading one championship file produced.
 */
export interface ParsedSeries {
  /**
   * The championship, or null when the file could not be read as one at all.
   */
  series: Championship | null;
  /**
   * Everything wrong with the file. Empty when it read cleanly.
   */
  problems: AppErrorInfo[];
}

/**
 * Where a check records what it found wrong.
 *
 * Passed rather than returned, so a check reads as the question it is asking:
 * every method answers false, which is what makes `?? report.bad(...)` and
 * `|| report.bad(...)` say "and that is a problem" in one line.
 */
export interface Reporter {
  /**
   * Records a field that could not be read.
   * @param field Dotted path to the field
   * @param value What was found there
   * @returns False, always
   */
  bad: (field: string, value: unknown) => false;
  /**
   * Records a field whose value is not one the catalogue behind it allows.
   * @param value What was found there
   * @param allowed Every value that catalogue holds
   * @param field Dotted path to the field
   * @returns True when the value is allowed
   */
  closedSet: <T extends string | number>(
    value: unknown,
    allowed: readonly T[],
    field: string,
  ) => boolean;
}
