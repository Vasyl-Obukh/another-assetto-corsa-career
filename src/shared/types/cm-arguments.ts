// Content Manager's own startup flags, and what its Arguments.txt currently
// holds. Shared because core writes the file and the renderer renders a row per
// flag out of the same list.

/**
 * A Content Manager command line flag the app offers to set.
 */
export type CmFlag =
  | '--skip-all-results'
  | '--hide-race-cancel-button'
  | '--enable-race-ini-test-mode';

/**
 * What Content Manager's Arguments.txt holds right now.
 *
 * Read back off disk every time rather than mirrored into settings: the user
 * may edit that file by hand or through Content Manager itself, and a copy of
 * ours would start lying the moment they did.
 */
export interface CmArguments {
  /**
   * Where the file is, so the screen can name it.
   */
  file: string;
  /**
   * Whether it exists yet. It usually does not.
   */
  exists: boolean;
  /**
   * Which of our flags are in it.
   */
  enabled: CmFlag[];
}
