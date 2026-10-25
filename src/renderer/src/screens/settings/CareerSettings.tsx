import { UserIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CalendarSection } from './CalendarSection.tsx';
import { CareerAidsSection } from './CareerAidsSection.tsx';
import { CareerCurrencySection } from './CareerCurrencySection.tsx';
import { CareerOpponentsSection } from './CareerOpponentsSection.tsx';
import { ProgressionSection } from './ProgressionSection.tsx';
import type { CareerDriver, CareerSettings as OwnSettings } from '../../../../shared/types';
import { useSlot } from '@/app';
import { ErrorCard, ScreenBody, SettingsSection } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import { invoke, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { NationPicker } from '@/screens/championship-editor';

/**
 * The open career's own settings: its driver, its opponents, driving aids and
 * currency where it sets them apart from the app's, and its calendar and
 * progression speed - which a standalone championship, racing one
 * championship alone and for no money, has none of.
 */
export const CareerSettings = () => {
  const { t } = useTranslation();
  const { career } = useSlot();
  const [name, setName] = useState(career?.driver.name ?? '');
  const [error, setError] = useState<DisplayableError | null>(null);
  // What the settings come to with every change still on its way to main, so a
  // second change is made over the first rather than over what main last said.
  const [pending, setPending] = useState<OwnSettings | null>(null);
  const sent = useRef(0);

  if (!career) return null;
  const settings = pending ?? career.settings;

  const save = (driver: CareerDriver): void => {
    invoke('career:driver', driver).then(
      () => setError(null),
      (thrown: unknown) => setError(toDisplayableError(thrown)),
    );
  };

  const change = (patch: Partial<OwnSettings>): void => {
    setPending({ ...settings, ...patch });
    sent.current += 1;
    const mine = sent.current;
    // Main runs them in order, so the last to answer has all of them.
    const settle = (): void => { if (mine === sent.current) setPending(null); };
    invoke('career:settings', patch).then(
      () => { setError(null); settle(); },
      (thrown: unknown) => { setError(toDisplayableError(thrown)); settle(); },
    );
  };

  return (
    <ScreenBody className="py-6" backToTop>
      <div className="flex max-w-6xl flex-col gap-5">
        {error ? <ErrorCard error={error} onDismiss={() => setError(null)} /> : null}

        <SettingsSection
          id="driver"
          icon={UserIcon}
          tone="you"
          title={t('settings.careerDriver')}
          hint={career.kind === 'championship' ? t('settings.championshipDriverHint') : t('settings.careerDriverHint')}
        >
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="career-driver-name" className="text-sm font-medium">{t('newCareer.name')}</label>
              <Input
                id="career-driver-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                // Kept when the field is left, so a name is never half-typed
                // onto the career; an empty one goes back to what it was.
                onBlur={() => {
                  if (name.trim() === '') setName(career.driver.name);
                  else if (name.trim() !== career.driver.name) save({ ...career.driver, name: name.trim() });
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="career-driver-nation" className="text-sm font-medium">{t('newCareer.nation')}</label>
              <NationPicker
                id="career-driver-nation"
                value={career.driver.nation ?? undefined}
                used={[]}
                disabled={false}
                onChange={(next) => save({ ...career.driver, nation: next ?? null })}
              />
            </div>
          </div>
        </SettingsSection>

        <CareerOpponentsSection own={settings.opponents} onChange={change} />
        <CareerAidsSection own={settings.drivingAids} onChange={change} />
        {career.kind === 'career' ? <CalendarSection settings={settings} onChange={change} /> : null}
        {career.kind === 'career' ? <ProgressionSection settings={settings} onChange={change} /> : null}
        <CareerCurrencySection own={settings.currency} onChange={change} />
      </div>
    </ScreenBody>
  );
};
