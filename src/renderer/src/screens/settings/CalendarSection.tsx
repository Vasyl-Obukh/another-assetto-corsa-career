import { CalendarDaysIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';
import { SettingsSection, SwitchTile } from '@/components';

export const CalendarSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <SettingsSection
      id="calendar"
      icon={CalendarDaysIcon}
      tone="calendar"
      title={t('settings.calendar')}
      hint={t('settings.calendarHint')}
    >
      <div className="max-w-md">
        <SwitchTile
          label={t('settings.sameDayEvents')}
          hint={t('settings.sameDayEventsHint')}
          checked={settings.allowSameDayEvents}
          onChange={(next) => patch({ allowSameDayEvents: next })}
        />
      </div>
    </SettingsSection>
  );
};
