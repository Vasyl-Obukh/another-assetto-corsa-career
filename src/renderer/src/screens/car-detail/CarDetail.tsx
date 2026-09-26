import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { CarAbout } from './CarAbout.tsx';
import { CarChampionships } from './CarChampionships.tsx';
import { CarClassification } from './CarClassification.tsx';
import { CarCurves } from './CarCurves.tsx';
import { CarDetailSkeleton } from './CarDetailSkeleton.tsx';
import { CarFigures } from './CarFigures.tsx';
import { CarSource } from './CarSource.tsx';
import { CarStage } from './CarStage.tsx';
import { carChampionships } from './utils.ts';
import { isCatalogued } from '../../../../shared/utils/library';
import { useClasses, useSettings } from '@/app';
import {
  ErrorCard, LibrarySwitch, ScreenBody, ScreenHeader,
} from '@/components';
import { useCarDetail, useChampionships, usePageName } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';
import { isListed } from '@/screens/championships';

export const CarDetail = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams<PathParam<typeof ROUTE.car>>();
  const detail = useCarDetail(id);
  const { listings, loading } = useChampionships();
  const { catalogue } = useClasses();
  const { settings } = useSettings();
  // Keyed on the car, so moving to another car starts on its first livery.
  const [shown, setShown] = useState({ id, index: 0 });
  const index = shown.id === id ? shown.index : 0;

  const { car } = detail;
  usePageName(car?.name ?? null);
  // The championships the Championships page lists, as the browser's cards count them.
  const championships = useMemo(
    () => (loading ? null : carChampionships(id, listings.filter((listing) => isListed(listing, settings)), catalogue)),
    [id, listings, loading, settings, catalogue],
  );

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader
        back={{ to: path.cars(), label: t('back.cars') }}
        // Only a mod the catalogue does not know can be left out of the library.
        aside={car === null || isCatalogued(car.provenance) ? undefined : <LibrarySwitch kind="cars" id={car.id} />}
      />

      {detail.error !== null ? (
        <ErrorCard error={detail.error} onDismiss={detail.dismissError} />
      ) : null}

      {detail.loading ? <CarDetailSkeleton /> : null}

      {detail.missing ? (
        <p className="py-12 text-center text-muted-foreground">
          {t('cars.detail.notFound', { id })}
        </p>
      ) : null}

      {car !== null ? (
        <>
          <CarStage car={car} index={index} onIndex={(next) => setShown({ id, index: next })} />

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex min-w-0 flex-col gap-4">
              <CarFigures performance={car.performance} />
              {car.description === null ? null : <CarAbout description={car.description} />}
              {car.curves === null ? null : <CarCurves curves={car.curves} />}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <CarChampionships championships={championships} />
              <CarClassification carId={car.id} />
              <CarSource car={car} />
            </div>
          </div>
        </>
      ) : null}
    </ScreenBody>
  );
};
