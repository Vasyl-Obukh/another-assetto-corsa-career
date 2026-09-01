// Which Content Manager flags the screen is allowed to offer, and which aids
// get a select rather than a switch.

import type { CmFlag, DrivingAidNumber } from '../../../../shared/types';

/**
 * An aid Assetto Corsa gives three settings rather than two.
 *
 * The rest of the split lives in `src/shared/types/settings.ts`, because
 * reading the aids back off disk needs the same grouping. This one does not:
 * it is only about which control the screen draws, since stability control is
 * a number here and a choice of three there.
 */
export type AidMode = Exclude<DrivingAidNumber, 'stabilityControl'>;

/**
 * A Content Manager flag the settings screen may offer.
 *
 * Race INI test mode is excluded rather than merely left out of the list: it
 * stops Content Manager launching anything, so it is a debugging tool and lives
 * in `npm run testmode` alone. Excluding it here is what lets the screen's
 * translations drop its wording too.
 */
export type SettingsCmFlag = Exclude<CmFlag, '--enable-race-ini-test-mode'>;
