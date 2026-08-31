import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';
import { Input } from '@/components/ui/input.tsx';

export const DriverField = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="settings-driver" className="text-sm font-medium">
          {t('settings.driverName')}
        </label>

        <Input
          id="settings-driver"
          className="w-56"
          value={settings.driverName ?? ''}
          placeholder={t('settings.driverNamePlaceholder')}
          onChange={(event) => patch({ driverName: event.target.value })}
        />
      </div>

      <p className="text-sm text-muted-foreground">{t('settings.driverNameHint')}</p>
    </div>
  );
};
