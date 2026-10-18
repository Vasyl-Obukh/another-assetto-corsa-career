import { BotIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FollowSwitch } from './FollowSwitch.tsx';
import { OpponentsFields } from './OpponentsFields.tsx';
import type { AiBase, CareerSettings } from '../../../../shared/types';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';

interface CareerOpponentsSectionProps {
  /**
   * The career's own opponents, or null while it follows the app's.
   */
  own: AiBase | null;
  /**
   * Changes the career's settings.
   * @param patch What changes
   */
  onChange(patch: Partial<CareerSettings>): void;
}

export const CareerOpponentsSection = ({ own, onChange }: CareerOpponentsSectionProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <SettingsSection
      id="opponents"
      icon={BotIcon}
      tone="opponents"
      title={t('settings.opponents')}
      hint={t('settings.careerOpponentsHint')}
    >
      <div className="flex flex-col gap-5">
        {/* Setting its own starts from where the app's stand. */}
        <FollowSwitch
          own={own !== null}
          onChange={(next) => onChange({ opponents: next ? settings.opponents : null })}
        />
        <OpponentsFields
          value={own ?? settings.opponents}
          app={own ? settings.opponents : undefined}
          disabled={own === null}
          onChange={(opponents) => onChange({ opponents })}
        />
      </div>
    </SettingsSection>
  );
};
