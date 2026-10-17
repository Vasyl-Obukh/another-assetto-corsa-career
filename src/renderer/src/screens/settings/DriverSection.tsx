import { UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';
import { SettingsSection } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import { NationPicker } from '@/screens/championship-editor';

export const DriverSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const [draft, setDraft] = useState(settings.driverName ?? '');

  return (
    <SettingsSection
      id="driver"
      icon={UserIcon}
      tone="you"
      title={t('settings.driver')}
      hint={t('settings.driverHint')}
    >
      <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-driver" className="text-sm font-medium">{t('settings.driverName')}</label>
          <Input
            id="settings-driver"
            value={draft}
            placeholder={t('settings.driverNamePlaceholder')}
            onChange={(event) => {
              setDraft(event.target.value);
              patch({ driverName: event.target.value });
            }}
          />
          <p className="text-xs text-muted-foreground">{t('settings.driverNameHint')}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-nation" className="text-sm font-medium">{t('settings.driverNation')}</label>
          <NationPicker
            id="settings-nation"
            value={settings.driverNation}
            used={[]}
            disabled={false}
            // Absent rather than empty, as the name is.
            onChange={(next) => patch({ driverNation: next })}
          />
        </div>
      </div>
    </SettingsSection>
  );
};
