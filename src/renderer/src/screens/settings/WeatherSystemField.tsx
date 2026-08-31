import { useTranslation } from 'react-i18next';

import { WEATHER_SYSTEMS } from '../../../../shared/constants';
import type { WeatherSystem } from '../../../../shared/types';
import { supportsDynamic } from '../../../../shared/utils/weather-system';
import { useSettings } from '@/app';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';

export const WeatherSystemField = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const system = settings.weatherSystem;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{t('settings.weatherSystem')}</span>

        <Select
          value={system}
          onValueChange={(value) => patch({ weatherSystem: value as WeatherSystem })}
        >
          <SelectTrigger size="sm" className="w-56" aria-label={t('settings.weatherSystem')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEATHER_SYSTEMS.map((choice) => (
              <SelectItem key={choice} value={choice}>{t(`weatherSystem.${choice}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{t(`weatherSystemHint.${system}`)}</p>

      {supportsDynamic(system) ? (
        <p className="text-xs text-muted-foreground">{t('settings.weatherPlanWarning')}</p>
      ) : null}
    </div>
  );
};
