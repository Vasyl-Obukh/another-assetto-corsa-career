import { UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';
import { SettingsSection } from '@/components';
import { Input } from '@/components/ui/input.tsx';

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
      <div className="flex max-w-sm flex-col gap-1.5">
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
    </SettingsSection>
  );
};
