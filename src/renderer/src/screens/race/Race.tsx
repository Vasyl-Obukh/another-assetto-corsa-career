import { useTranslation } from 'react-i18next';

import { CarField } from './CarField.tsx';
import { ConditionsFields } from './ConditionsFields.tsx';
import { GridFields } from './GridFields.tsx';
import { LaunchPanel } from './LaunchPanel.tsx';
import { RegulationsFields } from './RegulationsFields.tsx';
import { SessionList } from './SessionList.tsx';
import { TrackField } from './TrackField.tsx';
import { useSettings } from '@/app';
import { ErrorCard, ScreenBody } from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useRaceContent, useRaceSetup } from '@/hooks';

export const Race = () => {
  const { t } = useTranslation();
  const race = useRaceSetup();
  // Read live rather than off RaceSetup: the race store only re-describes
  // itself when the race changes, so a weather system picked in settings would
  // not reach this screen until something else happened to it.
  const { settings } = useSettings();
  const content = useRaceContent(race.setup?.definition ?? null);

  const { setup } = race;

  return (
    <ScreenBody className="flex flex-col gap-6 py-8" backToTop>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('race.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('race.subtitle')}</p>
      </header>

      {race.error ? (
        <ErrorCard error={race.error} onDismiss={race.dismissError} />
      ) : null}

      {race.loading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {setup ? (
        <>
          <TrackField
            track={content.track}
            locked={race.locked}
            onPick={race.setTrack}
          />

          <CarField
            car={content.car}
            skinId={setup.definition.playerCar.skin}
            locked={race.locked}
            onPick={(car, skin) => race.setCar(car.id, skin?.id)}
          />

          <GridFields
            grid={setup.definition.grid ?? {}}
            locked={race.locked}
            onChange={race.setGrid}
          />

          <ConditionsFields
            conditions={setup.definition.conditions ?? {}}
            weather={content.weather}
            controllers={content.controllers}
            system={settings.weatherSystem}
            rainFx={setup.weatherFx.rainFx}
            locked={race.locked}
            onChange={race.setConditions}
          />

          <RegulationsFields
            assists={setup.definition.assists ?? {}}
            locked={race.locked}
            onChange={race.setAssists}
          />

          <SessionList
            sessions={setup.definition.sessions ?? []}
            conditions={setup.definition.conditions ?? {}}
            weather={content.weather}
            controllers={content.controllers}
            system={settings.weatherSystem}
            rainFx={setup.weatherFx.rainFx}
            records={setup.state?.completed ?? []}
            locked={race.locked}
            onChange={race.setSessions}
          />

          <LaunchPanel
            setup={setup}
            runnable={race.runnable}
            busy={race.busy}
            onLaunch={race.launch}
            onCancel={race.cancel}
            onReset={race.reset}
          />
        </>
      ) : null}
    </ScreenBody>
  );
};
