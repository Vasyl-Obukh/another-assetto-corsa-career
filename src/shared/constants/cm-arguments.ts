// Which Content Manager flags we will write, and which of them the app offers.

import type { CmFlag } from '../types/cm-arguments.ts';

/**
 * Every flag we will write, in the order the settings screen lists them.
 *
 * A closed list on purpose: main checks against it before writing, so a bug in
 * the renderer cannot append an arbitrary line to Content Manager's own startup
 * arguments.
 */
export const CM_FLAGS: readonly CmFlag[] = [
  '--skip-all-results',
  '--hide-race-cancel-button',
  '--enable-race-ini-test-mode',
];

/**
 * The flag that makes Content Manager write `race.ini` instead of racing.
 *
 * Named because it is the one flag with a command of its own: it stops CM
 * launching anything, so it is set through `npm run testmode -- on|off` and is
 * deliberately absent from the app's own UI.
 */
export const RACE_INI_TEST_MODE = '--enable-race-ini-test-mode';
