import { CoinsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CurrencyPicker } from './CurrencyPicker.tsx';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';

/**
 * The app's currency, which every career shows unless it sets its own.
 */
export const CurrencySection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <SettingsSection id="currency" icon={CoinsIcon} tone="money" title={t('settings.currency.title')} hint={t('settings.currency.appHint')}>
      <CurrencyPicker value={settings.currency} onChange={(currency) => patch({ currency })} />
    </SettingsSection>
  );
};
