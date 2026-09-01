import { useTranslation } from 'react-i18next';

import { useSettings } from '@/app';
import { FieldGrid, FieldRow } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

export const DriverField = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <div className="flex flex-col gap-3">
      <FieldGrid>
        <FieldRow label={t('settings.driverName')} htmlFor="settings-driver">
          <Input
            id="settings-driver"
            className={CONTROL_WIDTH}
            value={settings.driverName ?? ''}
            placeholder={t('settings.driverNamePlaceholder')}
            onChange={(event) => patch({ driverName: event.target.value })}
          />
        </FieldRow>
      </FieldGrid>

      <p className="text-sm text-muted-foreground">{t('settings.driverNameHint')}</p>
    </div>
  );
};
