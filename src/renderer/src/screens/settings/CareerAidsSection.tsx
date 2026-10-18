import { GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DrivingAidsFields } from './DrivingAidsFields.tsx';
import { FollowSwitch } from './FollowSwitch.tsx';
import type { CareerSettings, DrivingAids } from '../../../../shared/types';
import { useSettings, useSlot } from '@/app';
import { SettingsSection } from '@/components';

interface CareerAidsSectionProps {
  /**
   * The career's own driving aids, or null while it follows the app's.
   */
  own: DrivingAids | null;
  /**
   * Changes the career's settings.
   * @param patch What changes
   */
  onChange(patch: Partial<CareerSettings>): void;
}

export const CareerAidsSection = ({ own, onChange }: CareerAidsSectionProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const championship = useSlot().mode === 'championship';

  return (
    <SettingsSection
      id="aids"
      icon={GaugeIcon}
      tone="you"
      title={t('settings.drivingAids')}
      hint={championship ? t('settings.championshipAidsHint') : t('settings.careerAidsHint')}
    >
      <div className="flex flex-col gap-5">
        {/* Setting its own starts from where the app's stand. */}
        <FollowSwitch
          own={own !== null}
          onChange={(next) => onChange({ drivingAids: next ? settings.drivingAids : null })}
        />
        <DrivingAidsFields
          value={own ?? settings.drivingAids}
          app={own ? settings.drivingAids : undefined}
          disabled={own === null}
          onChange={(drivingAids) => onChange({ drivingAids })}
        />
      </div>
    </SettingsSection>
  );
};
