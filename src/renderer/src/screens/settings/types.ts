import type { ParseKeys } from 'i18next';
import type { LucideIcon } from 'lucide-react';

import type { CmFlag, DrivingAidNumber } from '../../../../shared/types';

/**
 * Something a weather system can or cannot do, as its card lists them.
 */
export type WeatherCapability = 'rain' | 'dynamic' | 'exactRain';

/**
 * One entry of the index beside the General tab's sections.
 */
export interface SectionLink {
  /**
   * The section's element id.
   */
  id: string;
  /**
   * The catalogue key for its name.
   */
  label: ParseKeys;
  /**
   * The icon beside its name, the one its section wears.
   */
  icon: LucideIcon;
}

/**
 * One tab across the top of the settings screen.
 */
export interface SettingsTab {
  /**
   * The URL the tab opens.
   */
  to: string;
  /**
   * The catalogue key for its label.
   */
  label: ParseKeys;
  /**
   * The icon beside its label.
   */
  icon: LucideIcon;
  /**
   * Whether it is active only on exactly its own URL, rather than on anything
   * under it - true for the tab sitting at the settings root.
   */
  end: boolean;
}

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
