import { useEffect, useState } from 'react';
import type { PathParam } from 'react-router';
import {
  useBlocker, useNavigate, useParams,
} from 'react-router';

import { CalendarCard } from './CalendarCard.tsx';
import { EDITOR_TABS, HISTORIC_EDITOR_TABS } from './constants.ts';
import { DetailsCard } from './DetailsCard.tsx';
import { EditorHeader } from './EditorHeader.tsx';
import { EditorHeadSkeleton } from './EditorHeadSkeleton.tsx';
import { EditorLockNotice } from './EditorLockNotice.tsx';
import { EditorProblems } from './EditorProblems.tsx';
import { EditorTabTrigger } from './EditorTabTrigger.tsx';
import { EntriesCard } from './EntriesCard.tsx';
import { FormatsCard } from './FormatsCard.tsx';
import { HistoricEventTab } from './HistoricEventTab.tsx';
import { OverviewSkeleton } from './OverviewSkeleton.tsx';
import { RulesCard } from './RulesCard.tsx';
import { ScoringTab } from './ScoringTab.tsx';
import { TeamsCard } from './TeamsCard.tsx';
import type { ClassSection, EditorTab } from './types.ts';
import {
  changedTabs, emptyHistoric, emptySeries, historicTab, namedCars, problemTabs, withHistoricNames,
} from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { useClasses, useSettings, useUnsavedChanges } from '@/app';
import {
  ConfirmDialog, ErrorCard, ScreenBody, ScreenHeader,
} from '@/components';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs.tsx';
import {
  useCarNames, usePageName, useRowEdit, useSeriesEditor, useWeatherContent,
} from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { WordingKind } from '@/i18n';
import { path, ROUTE } from '@/lib/routes';
import { editorPath } from '@/lib/series-kind';
import type { SeriesKind } from '@/lib/series-kind';

interface ChampionshipEditorProps {
  /**
   * Which library the document is in. A historic event is a championship
   * narrowed to one event: one round with no date, one format, and prize money
   * without points - so the same editor edits it, over a tab set of its own.
   */
  kind?: SeriesKind;
}

export const ChampionshipEditor = ({ kind = 'series' }: ChampionshipEditorProps) => {
  const { t } = useKindTranslation(kind);
  const navigate = useNavigate();
  const historic = kind === 'historic';
  // Absent on the New route, which is the whole difference between the two: a
  // championship that has never been written has no id until it is saved.
  const { id } = useParams<PathParam<typeof ROUTE.championshipEdit>>();
  const [blank] = useState(() => (historic
    ? emptyHistoric(t('historicEditor.create.name'), t('historicEditor.noPoints'))
    : emptySeries(t('championshipLibrary.create.name'))));
  const [created, setCreated] = useState<string | null>(null);
  const editor = useSeriesEditor(id, blank, kind);
  const tabs = historic ? HISTORIC_EDITOR_TABS : EDITOR_TABS;
  // One for the whole screen, so opening any row quietens every other.
  const rows = useRowEdit();
  const { weather, controllers } = useWeatherContent();
  // Read live rather than off the draft: the weather system is a setting, and
  // it decides whether a round may ask for weather that changes mid-session.
  const { settings } = useSettings();
  const { catalogue } = useClasses();
  const [tab, setTab] = useState<EditorTab>('overview');
  // Held here rather than on the Classes tab, so another tab can open one
  // class's part - the prize money a class pays of its own.
  const [picked, setPicked] = useState<string | null>(null);
  const [section, setSection] = useState<ClassSection>('cars');

  const {
    draft, listing, checked, locked,
  } = editor;
  // One call for every car the draft mentions, rather than one per control.
  const nameOf = useCarNames(draft === null ? [] : namedCars(draft, catalogue));
  const creating = id === undefined;
  usePageName(listing?.series.name ?? (creating ? t(historic ? 'back.historicNew' : 'back.championshipNew') : null));
  // Reachable by deep link even though no menu offers it: a shipped
  // championship is compiled in, so there is no file of the user's to write.
  const shipped = listing?.origin === 'shipped';
  const changed = draft === null ? new Set<EditorTab>() : changedTabs(draft, listing?.series, tabs);
  const wrong = problemTabs(checked, historic ? historicTab : undefined);
  // What each tab lists, for the count beside its name.
  const counts: Partial<Record<EditorTab, number>> = draft === null ? {} : {
    teams: draft.teams?.length ?? 0,
    classes: draft.entries.length,
    calendar: draft.rounds.length,
    formats: draft.eventFormats.length,
  };

  /**
   * Replaces the whole draft, for a card that hands back the championship.
   * @param next The championship to apply
   */
  // A historic event's round and format carry its name, whatever it is renamed to.
  const replace = (next: Championship): void => editor.edit(() => (historic ? withHistoricNames(next) : next));

  // Any way off the screen with a draft unwritten asks first - the Back button
  // and the header's links alike, and loading a save, which asks before it loads.
  const discarding = useUnsavedChanges(editor.dirty);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (
    editor.dirty && !discarding() && currentLocation.pathname !== nextLocation.pathname
  ));

  // A new championship now has an id of its own, so the screen moves to that
  // id's URL - replacing, since a New route that has already been written is
  // not somewhere to go Back to. In an effect rather than in the save's own
  // callback, which would navigate while the draft still read as unsaved and
  // be stopped by the guard above.
  useEffect(() => {
    if (created === null || editor.dirty) return;

    navigate(editorPath(kind, created), { replace: true });
  }, [created, editor.dirty, navigate, kind]);
  const back = historic
    ? { to: path.settingsHistoric(), label: t('back.settingsHistoric') }
    : { to: path.settingsChampionships(), label: t('back.settingsChampionships') };

  return (
    <WordingKind.Provider value={kind}>
      <ScreenBody className="pb-8">
        <Tabs value={tab} onValueChange={(value) => setTab(value as EditorTab)} className="gap-4">
          {/* Pinned, so Save, Back and the tabs are in reach from the bottom of a
              long tab. */}
          <ScreenHeader back={back}>
            {draft && !shipped ? (
              <>
                <EditorHeader
                  name={listing?.series.name ?? blank.name}
                  origin={listing?.origin ?? null}
                  dirty={editor.dirty}
                  busy={editor.busy}
                  editable={rows.editable}
                  onSave={() => {
                    editor.save().then((saved) => {
                      if (saved !== null && creating) setCreated(saved);
                    }, () => undefined);
                  }}
                  onDiscard={() => { rows.close(); editor.discard(); }}
                />

                <TabsList className="-mb-4 h-auto w-full flex-wrap justify-start rounded-none bg-transparent p-0">
                  {tabs.map((one) => (
                    <EditorTabTrigger
                      key={one}
                      value={one}
                      label={t(`editor.tabs.${one}`)}
                      count={counts[one]}
                      changed={changed.has(one)}
                      problem={wrong.has(one)}
                      // An open row form would be thrown away by leaving its tab.
                      disabled={!rows.editable && one !== tab}
                    />
                  ))}
                </TabsList>
              </>
            ) : null}
            {editor.loading ? <EditorHeadSkeleton tabs={tabs} /> : null}
          </ScreenHeader>

          {editor.error ? (
            <ErrorCard error={editor.error} onDismiss={editor.dismissError} />
          ) : null}

          {editor.loading ? <OverviewSkeleton /> : null}

          {!editor.loading && !creating && listing === null && !editor.error ? (
            <p className="text-sm text-muted-foreground">{t(historic ? 'historicEditor.notFound' : 'editor.notFound')}</p>
          ) : null}

          {shipped ? (
            <p className="text-sm text-muted-foreground">{t(historic ? 'historicEditor.shipped' : 'editor.shipped')}</p>
          ) : null}

          {draft && !shipped ? (
            <>
              {locked ? <EditorLockNotice /> : null}

              {/* Off the checked draft rather than off the listing: the listing
                  describes what is on disk, and what the user wants to see is what
                  they have just typed. */}
              <EditorProblems
                problems={checked?.problems ?? []}
                tabOf={historic ? historicTab : undefined}
                onGo={setTab}
              />

              <TabsContent value="overview" className="flex flex-col gap-4">
                <DetailsCard series={draft} locked={locked} historic={historic} onChange={replace} />

                <RulesCard
                  grid={draft.grid ?? {}}
                  own={t(historic ? 'historicEditor.aiOwn' : 'race.ai.championship')}
                  regulations={draft.regulations ?? {}}
                  locked={locked}
                  onGrid={(grid) => editor.edit((from) => ({ ...from, grid }))}
                  onRegulations={(regulations) => editor.edit((from) => ({ ...from, regulations }))}
                />
              </TabsContent>

              <TabsContent value="teams">
                <TeamsCard series={draft} rows={rows} locked={locked} onChange={replace} />
              </TabsContent>

              <TabsContent value="classes">
                <EntriesCard
                  series={draft}
                  checked={checked}
                  picked={picked}
                  section={section}
                  onPick={setPicked}
                  onSection={setSection}
                  rows={rows}
                  locked={locked}
                  nameOf={nameOf}
                  onChange={replace}
                />
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarCard
                  series={draft}
                  checked={checked}
                  weather={weather}
                  controllers={controllers}
                  system={settings.weatherSystem}
                  locked={locked}
                  nameOf={nameOf}
                  onChange={replace}
                />
              </TabsContent>

              <TabsContent value="formats">
                <FormatsCard
                  series={draft}
                  weather={weather}
                  controllers={controllers}
                  system={settings.weatherSystem}
                  locked={locked}
                  onChange={replace}
                />
              </TabsContent>

              <TabsContent value="scoring">
                <ScoringTab
                  series={draft}
                  locked={locked}
                  onChange={replace}
                  onClassPrizes={(entry) => { setPicked(entry); setSection('prizes'); setTab('classes'); }}
                />
              </TabsContent>

              <TabsContent value="event">
                <HistoricEventTab
                  series={draft}
                  checked={checked}
                  weather={weather}
                  controllers={controllers}
                  system={settings.weatherSystem}
                  locked={locked}
                  onChange={replace}
                />
              </TabsContent>

              <TabsContent value="prizes">
                <ScoringTab
                  series={draft}
                  locked={locked}
                  prizesOnly
                  onChange={replace}
                  onClassPrizes={(entry) => { setPicked(entry); setSection('prizes'); setTab('classes'); }}
                />
              </TabsContent>
            </>
          ) : null}
        </Tabs>

        <ConfirmDialog
          open={blocker.state === 'blocked'}
          title={t('editor.leave.title')}
          description={t('editor.leave.body', { name: listing?.series.name ?? blank.name })}
          confirmLabel={t('editor.leave.confirm')}
          onClose={() => blocker.reset?.()}
          onConfirm={() => blocker.proceed?.()}
        />
      </ScreenBody>
    </WordingKind.Provider>
  );
};
