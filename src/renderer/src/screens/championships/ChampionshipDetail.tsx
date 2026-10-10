import { ArrowRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import {
  Link, useLocation, useNavigate, useParams, useSearchParams,
} from 'react-router';

import { ClassRow } from './ClassRow.tsx';
import { DETAIL_TABS, UNDERLINE_TAB } from './constants.ts';
import { DetailSkeleton } from './DetailSkeleton.tsx';
import { DetailSummary } from './DetailSummary.tsx';
import { EditionSwitcher } from './EditionSwitcher.tsx';
import { EnterChampionship } from './EnterChampionship.tsx';
import { RoundTable } from './RoundTable.tsx';
import { SeasonRules } from './SeasonRules.tsx';
import { SeasonSummary } from './SeasonSummary.tsx';
import { StandingsSection } from './StandingsSection.tsx';
import type { DetailTab, NextRound } from './types.ts';
import { enterHintOf, entryAvailability, shownRun } from './utils.ts';
import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import {
  ErrorCard, ResultCell, ScreenBody, ScreenHeader,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs.tsx';
import {
  useCareer, useChampionship, useChampionshipResults, usePageName, useSeriesCommands,
} from '@/hooks';
import { usePlayerName } from '@/hooks';
import { editionName } from '@/lib/edition-names';
import {
  DETAIL_TAB_PARAM, linkRun, path, ROUTE, RUN_PARAM, runOf,
} from '@/lib/routes';
import { seasonResults } from '@/lib/season-results';
import { editionOver } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';

interface ChampionshipDetailProps {
  /**
   * Whether the page manages the championship, as the settings tab opens it:
   * the whole menu and the switch, and nothing that races a round.
   */
  manage?: boolean;
}

// Read-only either way: every change is made in the editor the menu opens.
export const ChampionshipDetail = ({ manage = false }: ChampionshipDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<PathParam<typeof ROUTE.championship>>();
  const championship = useChampionship(id);
  // The open tab lives in the URL, so Back from a round returns to it - and so
  // does the run, for an earlier season or one edition of several.
  const [search, setSearch] = useSearchParams();
  const asked = manage ? {} : runOf(search);
  const results = useChampionshipResults(id, asked);
  const commands = useSeriesCommands();
  // The season this championship is being raced in, when the career has entered
  // it: what dates its rounds and what its standings are. The settings tab
  // manages the library rather than running a season in it, so it never shows.
  const career = useCareer();
  // A class and car a link asked the Enter panel to start from.
  const hint = enterHintOf(useLocation().state);

  const { listing } = championship;
  const {
    season, closed, edition, entered,
  } = shownRun(career.career, id, asked, results.results?.edition, manage);
  const editions = listing ? editionsOf(listing.series) : 1;
  const run = season && edition !== undefined
    ? linkRun({ season: season.index, edition }, career.career?.seasons.at(-1)?.index, editions)
    : {};
  // In a career, its own next round; otherwise the next one still to come on
  // the calendar, since that round's page is where the championship is entered.
  const next = ((): NextRound | undefined => {
    const rounds = listing?.series.rounds ?? [];
    const clock = career.calendar?.date;
    const event = entered
      ? entered.events.find((one) => one.status === 'scheduled')
      : career.calendar?.events.find((one) => (
        one.series === id
        && (edition === undefined || one.edition === edition)
        && clock !== undefined
        && one.date >= clock
      ));
    const at = rounds.findIndex((round) => round.id === event?.round);
    if (manage || closed || !event || at < 0) return undefined;

    return {
      round: rounds[at],
      number: at + 1,
      date: event.date,
      underway: 'sessions' in event && event.sessions.length > 0,
    };
  })();
  // Back with nowhere earlier to return to leads to the list each is opened
  // from: a championship on the settings tab may be switched off, and then the
  // Championships page does not list it.
  const back = manage
    ? { to: path.settingsChampionships(), label: t('back.settingsChampionships') }
    : { to: path.championships(), label: t('back.championships') };
  usePageName(listing?.series.name ?? null);
  // One card rather than two, as on the settings tab.
  const error = championship.error ?? commands.error;
  // The table carries the name the championship's document gave the seat, so
  // the player's own is laid over it wherever they are listed.
  const playerName = usePlayerName();
  const openRound = manage
    ? undefined
    : (round: string) => { void navigate(path.event({ series: id, round }, run)); };

  // The settings tab manages the library and races nothing, so it has no
  // standings to show.
  const tabs = manage ? DETAIL_TABS.filter((one) => one !== 'standings') : DETAIL_TABS;
  const wanted = search.get(DETAIL_TAB_PARAM);
  const tab: DetailTab = tabs.find((one) => one === wanted) ?? 'rounds';
  const openTab = (picked: DetailTab): void => {
    const query = new URLSearchParams(search);
    if (picked === 'rounds') query.delete(DETAIL_TAB_PARAM);
    else query.set(DETAIL_TAB_PARAM, picked);
    setSearch(query, { replace: true });
  };
  const openEdition = (picked: number): void => {
    const query = new URLSearchParams(search);
    query.set(RUN_PARAM.edition, String(picked));
    setSearch(query, { replace: true });
  };
  const named = season && edition !== undefined
    ? editionName({ year: seasonYear(season), edition, editions }, t)
    : null;
  const reviewable = entered && season && career.career && editionOver(entered, career.career.date);
  const table = useMemo(
    () => (results.results && !manage ? seasonResults(results.results) : null),
    [results.results, manage],
  );
  const mine = table?.classes.find((one) => one.entry === results.results?.playerEntry) ?? table?.classes[0];
  const player = mine?.drivers.find((row) => row.player);
  const mixed = new Set(listing?.series.entries.map((one) => one.ladder.discipline)).size > 1;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={back} />

      {error ? (
        <ErrorCard
          error={error}
          onDismiss={() => { championship.dismissError(); commands.dismissError(); }}
        />
      ) : null}

      {/* The career is usually read already, from Home, and then the page
          takes its own shape before the championship arrives; until then it
          takes a not-entered one. */}
      {championship.loading ? (
        <DetailSkeleton entered={entered !== null} enterable={!manage && entered === null} manage={manage} tab={tab} />
      ) : null}

      {!championship.loading && listing === null && !championship.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.notFound')}</p>
      ) : null}

      {listing ? (
        <div className="grid items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
          {/* Stays put while the page scrolls, below the pinned Back, and
              scrolls itself once a long standings table outgrows the window. */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-16 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto">
            <DetailSummary
              listing={listing}
              manage={manage}
              commands={commands}
              onDeleted={() => navigate(back.to, { replace: true })}
              entered={entered}
              next={entered ? next : undefined}
              onOpen={openRound}
            />
            {reviewable && season && entered ? (
              <Button asChild>
                <Link to={path.championshipReview({ series: id, season: season.index, edition: entered.edition })}>
                  {t('championships.detail.review')}
                  <ArrowRightIcon />
                </Link>
              </Button>
            ) : null}
            {/* Entering comes before anything else this page offers: the
                round page's own panel, set at the round entering starts from. */}
            {!manage && !entered && next ? (
              <EnterChampionship series={id} round={next.round.id} edition={edition} hint={hint} />
            ) : null}
            {table && mine && results.results ? (
              <SeasonSummary
                season={mine}
                series={results.results.championship}
                counted={table.counted}
                playerName={playerName}
                onFull={() => openTab('standings')}
              />
            ) : null}
          </aside>

          <Tabs value={tab} onValueChange={(value) => openTab(value as DetailTab)} className="min-w-0 gap-4">
            {/* One edition of several, or of a season gone by, says which. */}
            {!manage && closed && named ? (
              <p className="text-sm text-muted-foreground">{t('championships.detail.pastSeason', { edition: named })}</p>
            ) : null}
            {!manage && !closed && editions > 1 && season && career.calendar && edition !== undefined ? (
              <EditionSwitcher
                series={id}
                editions={editions}
                season={season}
                events={career.calendar.events}
                clock={career.calendar.date}
                selected={edition}
                onSelect={openEdition}
              />
            ) : null}
            <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
              {tabs.map((one) => (
                <TabsTrigger key={one} value={one} className={cn(UNDERLINE_TAB, 'gap-2 px-4 py-2.5')}>
                  {t(`championships.tabs.${one}`)}
                  {one === 'rounds' && table ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      {t('championships.tabs.raced', { count: table.counted, rounds: table.rounds.length })}
                    </span>
                  ) : null}
                  {one === 'standings' && player && table?.counted ? (
                    <ResultCell position={player.position} scored={player.points > 0} prefixed size="sm" />
                  ) : null}
                  {one === 'classes' && listing.series.entries.length > 1 ? (
                    // Neutral on purpose: a count, not one of a closed set.
                    <span className="rounded-full bg-muted px-1.5 text-xs font-normal tabular-nums">
                      {listing.series.entries.length}
                    </span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="rounds">
              <RoundTable
                listing={listing}
                entered={entered}
                season={table}
                playerName={playerName}
                next={next?.round.id}
                onOpen={openRound}
              />
            </TabsContent>

            {table && results.results ? (
              <TabsContent value="standings">
                <StandingsSection
                  season={table}
                  series={results.results.championship}
                  playerEntry={results.results.playerEntry}
                  playerName={playerName}
                  onOpenRound={openRound}
                />
              </TabsContent>
            ) : null}

            <TabsContent value="classes" className="flex flex-col gap-3">
              {listing.series.entries.length > 1 ? (
                <p className="text-xs text-muted-foreground">{t('championships.detail.classesHint')}</p>
              ) : null}
              {listing.series.entries.map((entry) => (
                <ClassRow
                  key={entry.id}
                  entry={entry}
                  availability={entryAvailability(listing, entry.id)}
                  teams={listing.series.teams ?? []}
                  showDiscipline={mixed}
                  playerSeat={entered?.entry === entry.id ? entered.playerSeat : undefined}
                  playerName={playerName}
                />
              ))}
            </TabsContent>

            <TabsContent value="rules">
              <SeasonRules series={listing.series} />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </ScreenBody>
  );
};
