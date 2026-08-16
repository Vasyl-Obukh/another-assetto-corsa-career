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
}
