import { useTranslation } from 'react-i18next';

import { WEATHER_SYSTEMS } from '../../../../shared/constants';
import type { WeatherSystem } from '../../../../shared/types';
import { supportsDynamic } from '../../../../shared/utils/weather-system';
import { useSettings } from '@/app';
import { FieldGrid, FieldRow } from '@/components';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

export const WeatherSystemField = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const system = settings.weatherSystem;

  return (
    <div className="flex flex-col gap-3">
      <FieldGrid>
        <FieldRow label={t('settings.weatherSystem')}>
          <Select
            value={system}
            onValueChange={(value) => patch({ weatherSystem: value as WeatherSystem })}
          >
            <SelectTrigger size="sm" className={CONTROL_WIDTH} aria-label={t('settings.weatherSystem')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEATHER_SYSTEMS.map((choice) => (
                <SelectItem key={choice} value={choice}>{t(`weatherSystem.${choice}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </FieldGrid>

      <p className="text-sm text-muted-foreground">{t(`weatherSystemHint.${system}`)}</p>

      {supportsDynamic(system) ? (
        <p className="text-xs text-muted-foreground">{t('settings.weatherPlanWarning')}</p>
      ) : null}
    </div>
  );
};
