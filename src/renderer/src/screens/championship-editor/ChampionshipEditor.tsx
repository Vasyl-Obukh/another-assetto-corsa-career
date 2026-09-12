import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import { useBlocker, useParams } from 'react-router';

import { CalendarCard } from './CalendarCard.tsx';
import { DetailsCard } from './DetailsCard.tsx';
import { EditorHeader } from './EditorHeader.tsx';
import { EditorLockNotice } from './EditorLockNotice.tsx';
import { EditorRegulationsCard } from './EditorRegulationsCard.tsx';
import { EntriesCard } from './EntriesCard.tsx';
import { FormatsCard } from './FormatsCard.tsx';
import { GridCard } from './GridCard.tsx';
import { PointsCard } from './PointsCard.tsx';
import { PrizesCard } from './PrizesCard.tsx';
import { TeamsCard } from './TeamsCard.tsx';
import { namedCars } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { useSettings } from '@/app';
import {
  ConfirmDialog, ErrorCard, ProblemList, ScreenBody, ScreenHeader,
} from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCarNames, useRowEdit, useSeriesEditor, useWeatherContent } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';

export const ChampionshipEditor = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams<PathParam<typeof ROUTE.championshipEdit>>();
  const editor = useSeriesEditor(id);
  // One for the whole screen, so opening any row quietens every other.
  const rows = useRowEdit();
  const { weather, controllers } = useWeatherContent();
  // Read live rather than off the draft: the weather system is a setting, and
  // it decides whether a round may ask for weather that changes mid-session.
  const { settings } = useSettings();

  const {
    draft, listing, checked, locked,
  } = editor;
  // One call for every car the draft mentions, rather than one per control.
  const nameOf = useCarNames(draft === null ? [] : namedCars(draft));
  const back = path.championship({ id });
  // Reachable by deep link even though no menu offers it: a shipped
  // championship is compiled in, so there is no file of the user's to write.
  const shipped = listing?.origin === 'shipped';

  /**
   * Replaces the whole draft, for a card that hands back the championship.
   * @param next The championship to apply
   */
  const replace = (next: Championship): void => editor.edit(() => next);

  // Any way off the screen with a draft unwritten asks first - the Back button
  // and the header's links alike.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (
    editor.dirty && currentLocation.pathname !== nextLocation.pathname
  ));

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      {/* Pinned, so Save and Back are in reach from the bottom of a long form. */}
      <ScreenHeader back={{ to: back, label: t('editor.back') }}>
        {draft && listing && !shipped ? (
          <EditorHeader
            listing={listing}
            dirty={editor.dirty}
            busy={editor.busy}
            editable={rows.editable}
            onSave={() => { void editor.save(); }}
            onDiscard={() => { rows.close(); editor.discard(); }}
          />
        ) : null}
      </ScreenHeader>

      {editor.error ? (
        <ErrorCard error={editor.error} onDismiss={editor.dismissError} />
      ) : null}

      {editor.loading ? <Skeleton className="h-24 w-full" /> : null}

      {!editor.loading && listing === null && !editor.error ? (
        <p className="text-sm text-muted-foreground">{t('editor.notFound')}</p>
      ) : null}

      {shipped ? (
        <p className="text-sm text-muted-foreground">{t('editor.shipped')}</p>
      ) : null}

      {draft && listing && !shipped ? (
        <>
          {locked ? <EditorLockNotice /> : null}

          {/* Off the checked draft rather than off the listing: the listing
              describes what is on disk, and what the user wants to see is what
              they have just typed. */}
          <ProblemList
            problems={checked?.problems ?? []}
            label={t('editor.problems.label', { count: checked?.problems.length ?? 0 })}
            hint={t('editor.problems.hint')}
          />

          <DetailsCard
            series={draft}
            locked={locked}
            onChange={replace}
          />

          <GridCard
            grid={draft.grid ?? {}}
            idPrefix="editor"
            locked={locked}
            onChange={(grid) => editor.edit((from) => ({ ...from, grid }))}
          />

          <EditorRegulationsCard
            regulations={draft.regulations ?? {}}
            locked={locked}
            onChange={(regulations) => editor.edit((from) => ({ ...from, regulations }))}
          />

          <TeamsCard
            series={draft}
            rows={rows}
            locked={locked}
            onChange={replace}
          />

          <EntriesCard
            series={draft}
            checked={checked}
            rows={rows}
            locked={locked}
            nameOf={nameOf}
            onChange={replace}
          />

          <CalendarCard
            series={draft}
            checked={checked}
            weather={weather}
            controllers={controllers}
            system={settings.weatherSystem}
            rows={rows}
            locked={locked}
            nameOf={nameOf}
            onChange={replace}
          />

          {/* After the calendar, in the read screen's own order. */}
          <FormatsCard
            series={draft}
            weather={weather}
            controllers={controllers}
            system={settings.weatherSystem}
            rows={rows}
            locked={locked}
            onChange={replace}
          />

          <PointsCard
            series={draft}
            rows={rows}
            locked={locked}
            onChange={replace}
          />

          <PrizesCard
            series={draft}
            rows={rows}
            locked={locked}
            onChange={replace}
          />
        </>
      ) : null}

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title={t('editor.leave.title')}
        description={t('editor.leave.body', { name: listing?.series.name ?? '' })}
        confirmLabel={t('editor.leave.confirm')}
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />
    </ScreenBody>
  );
};
