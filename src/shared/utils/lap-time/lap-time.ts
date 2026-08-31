// Rendering a lap time the way a timing screen does.
//
// Deliberately not an Intl formatting: m:ss.mmm is a motorsport convention
// rather than a locale decision, so it stays out of the renderer's i18n module
// and the CLI and the app share it.

import { MILLIS_DIGITS, NO_LAP_TIME, SECONDS_DIGITS } from './constants.ts';
import { MS_PER_MINUTE, MS_PER_SECOND } from '../../constants/index.ts';

/**
 * Renders a lap time the way a timing screen would.
 * @param ms The lap time in milliseconds, or null when none was set
 * @returns The time as m:ss.mmm, or a placeholder when there is none
 */
export const formatLapTime = (ms: number | null): string => {
  if (ms == null || ms <= 0) return NO_LAP_TIME;

  const minutes = Math.floor(ms / MS_PER_MINUTE);
  const seconds = Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND);
  const millis = ms % MS_PER_SECOND;

  return `${minutes}:${String(seconds).padStart(SECONDS_DIGITS, '0')}`
    + `.${String(millis).padStart(MILLIS_DIGITS, '0')}`;
};
