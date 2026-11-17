/**
 * Where checking for, fetching and installing a new version is up to.
 *
 * Nothing is fetched until the player asks: `available` waits on them, and
 * only `download` moves it on to `downloading`.
 */
export type UpdateState =
  | {
    /**
     * Not an installed build - `npm run dev` or `npm run start` - which has
     * nothing to update.
     */
    phase: 'unsupported';
  }
  | {
    /**
     * Not looked yet: checks are switched off, or the first has not run.
     */
    phase: 'idle';
  }
  | {
    /**
     * Asking the release feed what the newest version is.
     */
    phase: 'checking';
  }
  | {
    /**
     * Nothing newer than what is installed.
     */
    phase: 'latest';
    /**
     * ISO timestamp of the check that said so.
     */
    checkedAt: string;
  }
  | {
    /**
     * A newer version is out, and nothing of it is fetched yet.
     */
    phase: 'available';
    /**
     * The version on offer.
     */
    version: string;
  }
  | {
    /**
     * Fetching the installer.
     */
    phase: 'downloading';
    /**
     * The version being fetched.
     */
    version: string;
    /**
     * How much of it has arrived, 0 to 100.
     */
    percent: number;
  }
  | {
    /**
     * Fetched and checked, installed on restart or on the next quit.
     */
    phase: 'ready';
    /**
     * The version waiting to be installed.
     */
    version: string;
  }
  | {
    /**
     * The last check or download went wrong.
     */
    phase: 'failed';
    /**
     * The version whose download failed, or null when it was the check. What
     * went wrong is logged by main: the updater's own message is a dump of
     * HTTP headers, nothing to show a player.
     */
    version: string | null;
  };

/**
 * The version running and where updating it is up to.
 */
export interface UpdateStatus {
  /**
   * The version running now.
   */
  current: string;
  /**
   * Where updating it is up to.
   */
  state: UpdateState;
}
