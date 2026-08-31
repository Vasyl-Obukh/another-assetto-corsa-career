/**
 * How long to wait for a new result, and how to report progress meanwhile.
 */
export interface WaitOptions {
  /**
   * Ignore writes at or before this mtime, in milliseconds since the epoch.
   */
  since?: number;
  /**
   * Give up after this long, in milliseconds.
   */
  timeoutMs?: number;
  /**
   * Called once per poll, so a caller can show that it is still waiting.
   */
  onWait?: () => void;
  /**
   * Stops the wait early when aborted, resolving null as a timeout does.
   *
   * The CLI never needed one - Ctrl+C ends the process - but the app has to be
   * able to stop watching without ending anything else, and the poll loop is
   * otherwise a four hour commitment.
   */
  signal?: AbortSignal;
}
