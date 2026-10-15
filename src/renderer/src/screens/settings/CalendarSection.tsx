import { CalendarDaysIcon, ChevronRightIcon, InfoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { HISTORIC_PER_YEAR } from './constants.ts';
import { HISTORIC_FREQUENCIES } from '../../../../shared/constants';
import { useSettings } from '@/app';
import { Segments, SettingsSection, SwitchTile } from '@/components';
import { path } from '@/lib/routes';

export const CalendarSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const frequency = settings.historicFrequency;

  return (
    <SettingsSection
      id="calendar"
      icon={CalendarDaysIcon}
      tone="calendar"
      title={t('settings.calendar')}
      hint={t('settings.calendarHint')}
    >
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="max-w-md">
          <SwitchTile
            label={t('settings.sameDayEvents')}
            hint={t('settings.sameDayEventsHint')}
            checked={settings.allowSameDayEvents}
            onChange={(next) => patch({ allowSameDayEvents: next })}
          />
        </div>

        <div className="flex flex-col gap-2.5 rounded-lg border bg-card p-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{t('settings.historic.label')}</span>
            <span className="text-sm text-muted-foreground">{t('settings.historic.hint')}</span>
          </div>

          <div className="self-start">
            <Segments
              label={t('settings.historic.label')}
              items={HISTORIC_FREQUENCIES.map((one) => ({ id: one, label: t(`settings.historic.frequency.${one}`) }))}
              value={frequency}
              onChange={(next) => patch({ historicFrequency: next })}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {t('settings.historic.perYear', { count: HISTORIC_PER_YEAR[frequency] })}
            {' '}
            <span className="font-medium text-foreground">{t('settings.historic.nextSeason')}</span>
          </p>

          {frequency === 'weekly' ? (
            <div className="flex items-start gap-2 rounded-md bg-warning/20 px-3 py-2 text-sm">
              <InfoIcon className="mt-0.5 size-4 shrink-0" />
              <span>{t('settings.historic.weekly')}</span>
            </div>
          ) : null}

          <Link to={path.settingsHistoric()} className="flex items-center gap-0.5 self-start text-sm font-medium text-primary">
            {t('settings.historic.pool')}
            <ChevronRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </SettingsSection>
  );
};
