import { useTranslation } from 'react-i18next';

import { useSettings, useSlot } from '@/app';

/**
 * What a results table calls the player: the open career's driver, or else the
 * default driver's name, or "You" with neither.
 * @returns The name, already translated
 */
export const usePlayerName = (): string => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { career } = useSlot();

  return career?.driver.name || settings.driverName?.trim() || t('calendar.standings.you');
};
