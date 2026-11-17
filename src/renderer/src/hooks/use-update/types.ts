import type { UpdateStatus } from '../../../../shared/types';

/**
 * The installed version and its update, as the header and Settings show them.
 */
export interface UpdateHookState {
  /**
   * The version running and where updating it is up to, or null before main
   * first answers.
   */
  status: UpdateStatus | null;
  /**
   * Looks for a newer version now.
   */
  check(): void;
  /**
   * Fetches the version on offer.
   */
  download(): void;
  /**
   * Quits, installs the version fetched and starts again. Why it could not is
   * shown as a toast.
   */
  install(): void;
}
