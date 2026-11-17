import type { UpdateStatus } from '../../shared/types/index.ts';

/**
 * What the updater needs from the rest of main.
 */
export interface UpdaterOptions {
  /**
   * Whether a race is running, which quitting to install would lose.
   * @returns True while a launch is in flight
   */
  racing(): boolean;
  /**
   * Writes every store out, before the app quits to install.
   * @returns Resolves once everything is on disk
   */
  flush(): Promise<void>;
}

/**
 * Checks for, fetches and installs new versions of the installed app.
 */
export interface Updater {
  /**
   * The version running and where updating it is up to.
   * @returns The status now
   */
  get(): UpdateStatus;
  /**
   * Looks for a newer version, unless one is being fetched or is waiting to
   * install. Where the look got to is pushed.
   * @returns The status once the look has started
   */
  check(): UpdateStatus;
  /**
   * Fetches the version on offer, when there is one. Progress is pushed.
   * @returns The status once the download has started
   */
  download(): UpdateStatus;
  /**
   * Writes every store out, then quits, installs the version fetched and
   * starts again.
   * @throws AppError when nothing is fetched, or while a race is running
   */
  install(): Promise<void>;
  /**
   * Follows the Check for updates setting: looks now and every few hours
   * while it is on, and stops looking while it is off.
   * @param enabled Whether checks are on
   */
  schedule(enabled: boolean): void;
  /**
   * Subscribes to every move.
   * @param listener Called with the status after each one
   * @returns A function that unsubscribes
   */
  onChange(listener: (status: UpdateStatus) => void): () => void;
}
