import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';

/**
 * What a results table calls the player: the name they set, or "You" without
 * one.
 * @returns The name, already translated
 */
export const usePlayerName = (): string => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return settings.driverName?.trim() || t('calendar.standings.you');
};
