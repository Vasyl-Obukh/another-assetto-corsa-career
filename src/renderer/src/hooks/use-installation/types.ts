import type { ContentIssue, ContentSummary, PathsReport } from '../../../../shared/types';
import type { PathKind } from '@/components';
import type { DisplayableError } from '@/lib/ipc';

/**
 * Everything the setup and diagnostics screens need to show and correct the
 * Assetto Corsa installation.
 */
export interface Installation {
  /**
   * What the last probe found.
   */
  report: PathsReport;
  /**
   * Counts from the last scan, or null when nothing has been scanned yet.
   */
  summary: ContentSummary | null;
  /**
   * Everything the last scan found broken, or null until it has been asked for.
   */
  issues: ContentIssue[] | null;
  /**
   * Whether all three paths resolved, so content can be scanned and races run.
   */
  ready: boolean;
  /**
   * Whether a probe, override or pick is in flight.
   */
  busy: boolean;
  /**
   * Whether a scan is in flight.
   */
  scanning: boolean;
  /**
   * The last failure, or null when there is nothing to report.
   */
  error: DisplayableError | null;
  /**
   * Probes every path again.
   */
  refresh(): void;
  /**
   * Opens a picker for one path and applies whatever is chosen.
   * @param kind Which path to pick
   */
  pick(kind: PathKind): void;
  /**
   * Drops the override for one path.
   * @param kind Which path to clear
   */
  clear(kind: PathKind): void;
  /**
   * Runs a fresh content scan.
   */
  scan(): void;
  /**
   * Fetches the list of broken content behind the count on the content card.
   */
  loadIssues(): void;
  /**
   * Clears the last failure.
   */
  dismissError(): void;
}
