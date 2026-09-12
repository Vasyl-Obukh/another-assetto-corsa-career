import { useTranslation } from 'react-i18next';

import { ContentManagerField } from './ContentManagerField.tsx';
import { DriverField } from './DriverField.tsx';
import { DrivingAidsField } from './DrivingAidsField.tsx';
import { WeatherSystemField } from './WeatherSystemField.tsx';
import {
  FieldGrid, FieldRow, LanguageSelect, ScreenBody, ThemeSelect,
} from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

export const Settings = () => {
  const { t } = useTranslation();

  return (
    <ScreenBody className="flex flex-col gap-6 py-8" backToTop>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGrid>
            <FieldRow label={t('settings.theme')}>
              <ThemeSelect />
            </FieldRow>

            <FieldRow label={t('settings.language')}>
              <LanguageSelect />
            </FieldRow>
          </FieldGrid>
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
          <CardTitle>{t('settings.drivingAids')}</CardTitle>
          <CardDescription>{t('settings.drivingAidsHint')}</CardDescription>
        </CardHeader>

        <CardContent>
          <DrivingAidsField />
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

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.contentManager')}</CardTitle>
          <CardDescription>{t('settings.contentManagerHint')}</CardDescription>
        </CardHeader>

        <CardContent>
          <ContentManagerField />
        </CardContent>
      </Card>
    </ScreenBody>
  );
};
