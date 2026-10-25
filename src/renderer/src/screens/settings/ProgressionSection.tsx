import { GaugeIcon, MedalIcon, WalletIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerSettings } from '../../../../shared/types';
import { ProgressionSlider, SettingsSection } from '@/components';

interface ProgressionSectionProps {
  /**
   * The career's settings, whose two speeds it sets.
   */
  settings: CareerSettings;
  /**
   * Changes the career's settings.
   * @param patch What changes
   */
  onChange(patch: Partial<CareerSettings>): void;
}

/**
 * How fast a career earns and how fast it climbs, two speeds set apart. Its
 * own alone - the app has no speed to follow - and a career's alone, since a
 * standalone championship has neither money nor a ladder.
 */
export const ProgressionSection = ({ settings, onChange }: ProgressionSectionProps) => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      id="progression"
      icon={GaugeIcon}
      tone="money"
      title={t('finances.progression')}
      hint={t('settings.progressionHint')}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <WalletIcon className="size-4 text-success" />
            {t('settings.prizeSpeed')}
          </span>
          <ProgressionSlider
            value={settings.prizeSpeed}
            label={t('settings.prizeSpeed')}
            onChange={(prizeSpeed) => onChange({ prizeSpeed })}
          />
          <span className="text-sm text-muted-foreground">{t('settings.prizeSpeedHint')}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <MedalIcon className="size-4 text-podium-gold-foreground" />
            {t('settings.ratingSpeed')}
          </span>
          <ProgressionSlider
            value={settings.ratingSpeed}
            label={t('settings.ratingSpeed')}
            onChange={(ratingSpeed) => onChange({ ratingSpeed })}
          />
          <span className="text-sm text-muted-foreground">{t('settings.ratingSpeedHint')}</span>
        </div>
      </div>
    </SettingsSection>
  );
};
