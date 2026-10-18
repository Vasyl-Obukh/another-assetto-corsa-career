import { GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DrivingAidsFields } from './DrivingAidsFields.tsx';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';

export const DrivingAidsSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <SettingsSection
      id="aids"
      icon={GaugeIcon}
      tone="you"
      title={t('settings.drivingAids')}
      hint={t('settings.drivingAidsHint')}
    >
      <DrivingAidsFields value={settings.drivingAids} onChange={(drivingAids) => patch({ drivingAids })} />
    </SettingsSection>
  );
};
