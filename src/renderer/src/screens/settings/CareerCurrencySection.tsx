import { CoinsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CurrencyPicker } from './CurrencyPicker.tsx';
import { FollowSwitch } from './FollowSwitch.tsx';
import type { CareerSettings, Currency } from '../../../../shared/types';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';

interface CareerCurrencySectionProps {
  /**
   * The career's own currency, or null while it follows the app's.
   */
  own: Currency | null;
  /**
   * Changes the career's settings.
   * @param patch What changes
   */
  onChange(patch: Partial<CareerSettings>): void;
}

export const CareerCurrencySection = ({ own, onChange }: CareerCurrencySectionProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <SettingsSection
      id="currency"
      icon={CoinsIcon}
      tone="money"
      title={t('settings.currency.title')}
      hint={t('settings.currency.careerHint')}
    >
      <div className="flex flex-col gap-5">
        {/* Setting its own starts from the app's. */}
        <FollowSwitch own={own !== null} onChange={(next) => onChange({ currency: next ? settings.currency : null })} />
        <CurrencyPicker
          value={own ?? settings.currency}
          disabled={own === null}
          onChange={(currency) => onChange({ currency })}
        />
      </div>
    </SettingsSection>
  );
};
