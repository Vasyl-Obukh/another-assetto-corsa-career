import { GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerSettings } from '../../../../shared/types';
import { ProgressionSlider, SettingsSection } from '@/components';

interface ProgressionSectionProps {
  /**
   * The career's progression speed.
   */
  value: number;
  /**
   * Changes the career's settings.
   * @param patch What changes
   */
  onChange(patch: Partial<CareerSettings>): void;
}

/**
 * How fast a career earns. Its own alone - the app has no speed to follow -
 * and a career's alone, since a standalone championship has no money.
 */
export const ProgressionSection = ({ value, onChange }: ProgressionSectionProps) => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      id="progression"
      icon={GaugeIcon}
      tone="money"
      title={t('finances.progression')}
      hint={t('settings.progressionHint')}
    >
      <div className="max-w-2xl">
        <ProgressionSlider value={value} onChange={(progression) => onChange({ progression })} />
      </div>
    </SettingsSection>
  );
};
