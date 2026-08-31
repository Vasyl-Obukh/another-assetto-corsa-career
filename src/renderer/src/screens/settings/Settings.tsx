import { useTranslation } from 'react-i18next';

import { DriverField } from './DriverField.tsx';
import { WeatherSystemField } from './WeatherSystemField.tsx';
import { LanguageSelect, ThemeSelect } from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

export const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{t('settings.theme')}</span>
              <ThemeSelect />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{t('settings.language')}</span>
              <LanguageSelect />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.driver')}</CardTitle>
            <CardDescription>{t('settings.driverHint')}</CardDescription>
          </CardHeader>

          <CardContent>
            <DriverField />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.weather')}</CardTitle>
            <CardDescription>{t('settings.weatherHint')}</CardDescription>
          </CardHeader>

          <CardContent>
            <WeatherSystemField />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
