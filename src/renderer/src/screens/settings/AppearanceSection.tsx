import { MonitorIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SubHeading } from './SubHeading.tsx';
import {
  LanguagePicker, SettingsSection, ThemePicker, UnitsPicker,
} from '@/components';

export const AppearanceSection = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      id="appearance"
      icon={MonitorIcon}
      tone="look"
      title={t('settings.appearance')}
      hint={t('settings.appearanceHint')}
    >
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div className="flex flex-col">
          <SubHeading>{t('settings.theme')}</SubHeading>
          <ThemePicker />
        </div>

        <div className="flex flex-col">
          <SubHeading>{t('settings.language')}</SubHeading>
          <LanguagePicker />
        </div>

        <div className="flex flex-col">
          <SubHeading>{t('settings.units')}</SubHeading>
          <UnitsPicker />
        </div>
      </div>
    </SettingsSection>
  );
};
