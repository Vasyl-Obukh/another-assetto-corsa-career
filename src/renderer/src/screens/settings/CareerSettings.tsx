import { UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CareerDriver } from '../../../../shared/types';
import { useSlot } from '@/app';
import { ErrorCard, ScreenBody, SettingsSection } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import { invoke, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { NationPicker } from '@/screens/championship-editor';

/**
 * The open career's own settings - its driver, for now. Opponents, driving
 * aids and the calendar join it as overrides of the app's.
 */
export const CareerSettings = () => {
  const { t } = useTranslation();
  const { career } = useSlot();
  const [name, setName] = useState(career?.driver.name ?? '');
  const [error, setError] = useState<DisplayableError | null>(null);

  if (!career) return null;

  const save = (driver: CareerDriver): void => {
    invoke('career:driver', driver).then(
      () => setError(null),
      (thrown: unknown) => setError(toDisplayableError(thrown)),
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
          hint={t('settings.careerDriverHint')}
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
      </div>
    </ScreenBody>
  );
};
