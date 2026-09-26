import { CloudIcon, TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AllowedWeather } from './AllowedWeather.tsx';
import { SubHeading } from './SubHeading.tsx';
import { WeatherSystemCard } from './WeatherSystemCard.tsx';
import { WEATHER_SYSTEMS } from '../../../../shared/constants';
import { supportsDynamic } from '../../../../shared/utils/weather-system';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';

export const WeatherSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const system = settings.weatherSystem;

  return (
    <SettingsSection
      id="weather"
      icon={CloudIcon}
      tone="weather"
      title={t('settings.weather')}
      hint={t('settings.weatherHint')}
    >
      <SubHeading>{t('settings.weatherSystem')}</SubHeading>
      <div role="radiogroup" aria-label={t('settings.weatherSystem')} className="grid gap-2.5 md:grid-cols-3">
        {WEATHER_SYSTEMS.map((choice) => (
          <WeatherSystemCard
            key={choice}
            system={choice}
            selected={system === choice}
            onSelect={() => patch({ weatherSystem: choice })}
          />
        ))}
      </div>

      {supportsDynamic(system) ? (
        <p className="mt-2.5 flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/12 px-3 py-2 text-xs">
          <TriangleAlertIcon className="mt-px size-3.5 shrink-0" />
          {t('settings.weatherPlanWarning')}
        </p>
      ) : null}

      <AllowedWeather />
    </SettingsSection>
  );
};
