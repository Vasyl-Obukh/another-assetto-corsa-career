import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';
import type { PathParam } from 'react-router';

import { TrackAbout } from './TrackAbout.tsx';
import { TrackChampionships } from './TrackChampionships.tsx';
import { TrackChampionshipsSkeleton } from './TrackChampionshipsSkeleton.tsx';
import { TrackDetailSkeleton } from './TrackDetailSkeleton.tsx';
import { TrackFigures } from './TrackFigures.tsx';
import { TrackLayouts } from './TrackLayouts.tsx';
import { TrackLocation } from './TrackLocation.tsx';
import { TrackSource } from './TrackSource.tsx';
import { TrackStage } from './TrackStage.tsx';
import { circuitChampionships, stagePhotos, worthReading } from './utils.ts';
import type { Track } from '../../../../shared/types';
import { championshipEntries } from '../../../../shared/utils/historic';
import { isCatalogued } from '../../../../shared/utils/library';
import { useSettings, useSlot } from '@/app';
import {
  ErrorCard, LibrarySwitch, ScreenBody, ScreenHeader,
} from '@/components';
import {
  useCareer, useChampionships, usePageName, useTrackDetail,
} from '@/hooks';
import { path, ROUTE, TRACK_LAYOUT_PARAM } from '@/lib/routes';
import { isListed } from '@/screens/championships';

export const TrackDetail = () => {
  const { t } = useTranslation();
  // The library browsers are a career's; elsewhere these pages are opened from
  // Your content.
  const { mode } = useSlot();
  const { id = '' } = useParams<PathParam<typeof ROUTE.track>>();
  const [params, setParams] = useSearchParams();
  const detail = useTrackDetail(id);
  const { listings, loading } = useChampionships();
  const { settings } = useSettings();
  const career = useCareer();

  const { circuit } = detail;
  usePageName(circuit?.name ?? null);

  // The layout lives in the URL, so a round's link can open on it and Back
  // returns to it; a key no layout answers to is the whole circuit.
  const chosen = params.get(TRACK_LAYOUT_PARAM);
  const layout = circuit?.layouts.find((one) => one.layout === chosen) ?? null;
  const choose = (next: Track | null): void => {
    setParams(next === null ? {} : { [TRACK_LAYOUT_PARAM]: next.layout }, { replace: true });
  };
  const layouts = useMemo(() => (layout === null ? circuit?.layouts ?? [] : [layout]), [circuit, layout]);

  // Keyed on what is in view, so turning to a layout starts on its first picture.
  const view = `${id}/${layout?.key ?? ''}`;
  const [shown, setShown] = useState({ view, index: 0 });
  const index = shown.view === view ? shown.index : 0;
  const photos = useMemo(() => stagePhotos(layouts), [layouts]);

  // The championships the Championships page lists, as the browser's cards count them.
  const championships = useMemo(
    () => (loading ? null : circuitChampionships(id, listings.filter((listing) => isListed(listing, settings)))),
    [id, listings, loading, settings],
  );
  const season = career.career?.seasons.at(-1);
  const entered = useMemo(
    () => new Set((season ? championshipEntries(season) : [])
      .filter((entry) => !entry.withdrawn)
      .map((entry) => entry.series)),
    [season],
  );
  // A circuit is the user's to add once any layout of it is a mod the catalogue
  // does not know, which is what puts it in Your content.
  const anonymous = circuit?.layouts.some((one) => !isCatalogued(one.provenance)) ?? false;
  const description = layout?.description ?? circuit?.layouts.find((one) => one.description !== null)?.description;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader
        back={mode === 'career' ? { to: path.tracks(), label: t('back.tracks') } : { to: path.settingsContent(), label: t('back.settingsContent') }}
        aside={anonymous ? <LibrarySwitch kind="tracks" id={id} /> : undefined}
      />

      {detail.error !== null ? (
        <ErrorCard error={detail.error} onDismiss={detail.dismissError} />
      ) : null}

      {detail.loading ? <TrackDetailSkeleton /> : null}

      {detail.missing ? (
        <p className="py-12 text-center text-muted-foreground">
          {t('tracks.detail.notFound', { id })}
        </p>
      ) : null}

      {circuit !== null ? (
        <>
          <TrackStage
            circuit={circuit}
            layout={layout}
            photos={photos}
            index={Math.min(index, Math.max(photos.length - 1, 0))}
            onIndex={(next) => setShown({ view, index: next })}
          />

          {circuit.layouts.length > 1 ? (
            <TrackLayouts circuit={circuit} layout={layout} championships={championships} onChoose={choose} />
          ) : null}

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex min-w-0 flex-col gap-4">
              <TrackFigures layouts={layouts} total={circuit.layouts.length} />
              {championships === null ? <TrackChampionshipsSkeleton /> : (
                <TrackChampionships
                  circuit={circuit}
                  layout={layout}
                  championships={championships}
                  entered={entered}
                  onChoose={choose}
                />
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <TrackLocation circuit={circuit} layouts={layouts} />
              <TrackSource circuit={circuit} />
              {description && worthReading(description, circuit.name) ? (
                <TrackAbout key={description} description={description} />
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </ScreenBody>
  );
};
