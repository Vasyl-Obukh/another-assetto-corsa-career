import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link, useNavigate, useParams, useSearchParams,
} from 'react-router';
import type { PathParam } from 'react-router';

import { ABOUT, SUMMARY } from './constants.ts';
import { EnterPanel } from './EnterPanel.tsx';
import { EntryPanel } from './EntryPanel.tsx';
import { EventHeadSkeleton } from './EventHeadSkeleton.tsx';
import { EventSessionList } from './EventSessionList.tsx';
import { EventSkeleton } from './EventSkeleton.tsx';
import { HistoricSeatPanel } from './HistoricSeatPanel.tsx';
import { RoundStrength } from './RoundStrength.tsx';
import { RoundSummary } from './RoundSummary.tsx';
import { RoundSummarySkeleton } from './RoundSummarySkeleton.tsx';
import { SessionDetail } from './SessionDetail.tsx';
import { SkipPanel } from './SkipPanel.tsx';
import { defaultSession, scaleName, shortLaps } from './utils.ts';
import { prizeSpeed } from '../../../../shared/utils/prizes';
import { scalesFor } from '../../../../shared/utils/race-scale';
import { useSlot } from '@/app';
import {
  ClimateBadge, ErrorCard, HistoricChip, ScreenBody, ScreenHeader, SkipDialog, SkipRoundDialog,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  useCareerEvent, useChampionshipResults, usePageName, usePlayerName, useRaceStatus, useSkipRound,
} from '@/hooks';
import { useFormat, WordingKind } from '@/i18n';
import { DISCIPLINE_ACCENT, DISCIPLINE_DOT } from '@/lib/accents';
import {
  linkRun, path, ROUTE, runOf,
} from '@/lib/routes';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, HistoricAbout, tierAccent } from '@/screens/championships';
import { LayoutMap } from '@/screens/track-browser';

export const Event = () => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort, formatMoney } = useFormat();
  // A standalone championship has no calendar, so a round with nowhere earlier
  // to go back to returns to the championship's own page.
  const slot = useSlot();
  const back = slot.mode === 'championship'
    ? { to: path.standalone(), label: t('back.standalone') }
    : { to: path.calendar(), label: t('back.calendar') };
  const { series = '', round = '' } = useParams<PathParam<typeof ROUTE.event>>();
  // A round of an earlier season, or of one edition of several, names its run
  // in the URL; otherwise main picks the edition the career is racing.
  const [search] = useSearchParams();
  const asked = runOf(search);
  const event = useCareerEvent(series, round, asked);
  // Main picks the same default for both reads, so the results ask what the
  // URL asked rather than waiting on the view to say which run it chose.
  const results = useChampionshipResults(series, asked);
  // A closed season is the one view that says it is not the current one.
  const run = event.view
    ? linkRun(
      { season: event.view.season, edition: event.view.edition },
      event.view.blocked?.code === 'career.season.closed' ? undefined : event.view.season,
      event.view.editions,
    )
    : asked;
  const navigate = useNavigate();
  // Null until the player picks one, so the page follows the event on its own
  // - opening on the next session, and moving on to the one after once it has
  // run - until they choose to look at something else.
  const [picked, setPicked] = useState<number | null>(null);
  // Whether the next launch is waiting on the player to confirm what it costs.
  const [confirming, setConfirming] = useState(false);
  // The step the next race is shortened by, kept against the session it was
  // picked for: once that session has run, the next race starts at full length.
  const [length, setLength] = useState<{ key: string; scale: number } | null>(null);
  const race = useRaceStatus();
  const skip = useSkipRound(path.event({ series, round }, asked));

  const { view } = event;
  // One card for the page and its skip alike.
  const error = event.error ?? skip.error;
  // Exactly where main would refuse the launch for want of the content.
  const skippable = !!view?.entered && view.blocked?.code === 'series.round.unavailable';
  const historic = view?.historic ?? null;
  // A historic event is named by itself alone, having no championship around it.
  usePageName(view ? (historic ? view.seriesName : t('back.round', { round: view.roundName, series: view.seriesName }))
    : null);
  // The round's own results head the event once anything of it has run, and
  // an event over and done opens on them.
  const raced = view?.sessions.some((one) => one.record !== null) ?? false;
  const summary = view && raced ? {
    // A historic event pays no points, so it has none to sum.
    points: view.entered && !view.substituted && !historic
      ? view.sessions.reduce((sum, one) => sum + (one.place?.points ?? 0), 0)
      : null,
    complete: view.status !== 'scheduled',
  } : null;
  // A historic event opens on what it is about until anything of it has run.
  let opening = view ? defaultSession(view.sessions) : 0;
  if (summary?.complete) opening = SUMMARY;
  else if (historic && !raced) opening = ABOUT;
  const selected = picked ?? opening;
  const session = view?.sessions.find((one) => one.index === selected) ?? view?.sessions[0];
  const playerName = usePlayerName();
  const openStandings = (): void => {
    void navigate(path.championship({ id: series }, run, 'standings'));
  };
  const ladder = view?.entered?.ladder ?? view?.classes[0]?.ladder;

  const next = view?.sessions.find((one) => one.status === 'next');
  // The round as well as the run: moving to another round keeps this page
  // mounted, and a step picked for one race must never reach another.
  const lengthKey = view && next ? `${series}/${round}@${view.season}.${view.edition}/${next.index}` : null;
  const picks = length && length.key === lengthKey && next?.laps !== undefined
    && scalesFor(next.laps).includes(length.scale) ? length.scale : 1;
  // A launch in flight runs at the step it went out with, which the race store
  // remembers when this page, opened afresh, does not.
  const status = view?.live ? race.setup?.status : undefined;
  const running = status !== undefined && status.phase !== 'idle';
  const scale = running ? status.scale ?? 1 : picks;
  const skipPanel = view && skippable ? (
    <SkipPanel
      view={view}
      busy={event.busy || skip.busy}
      onSkip={() => skip.ask({ series, round, edition: view.edition })}
    />
  ) : null;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={back}>
        {view ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* A historic event is one event: its chip stands where a round
                    says which of how many it is. */}
                {historic ? <HistoricChip /> : (
                  <span className="font-mono text-xs text-muted-foreground">
                    {t('event.roundOf', { number: view.number, rounds: view.rounds })}
                  </span>
                )}
                {ladder ? (
                  <>
                    <Badge className={DISCIPLINE_ACCENT[ladder.discipline]}>
                      {t(disciplineKey(ladder.discipline))}
                    </Badge>
                    <Badge className={tierAccent(ladder.tier)}>
                      {t('championships.tier', { tier: ladder.tier })}
                    </Badge>
                  </>
                ) : null}
                {view.climate ? <ClimateBadge climate={view.climate} /> : null}
              </div>
              <h1 className="text-2xl font-semibold" data-selectable>{historic ? view.seriesName : view.roundName}</h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {/* The championship this round belongs to, in its discipline's
                    colour - none for a historic event, which belongs to none. */}
                {historic ? null : (
                  <Link
                    to={path.championship({ id: view.series }, run)}
                    className="flex items-center gap-1.5 rounded-full border bg-card py-0.5 pr-2 pl-2.5 font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {ladder ? <span className={cn('size-2 rounded-full', DISCIPLINE_DOT[ladder.discipline])} /> : null}
                    {view.seriesName}
                    <ChevronRightIcon className="size-3.5" />
                  </Link>
                )}
                <span>
                  {formatDay(view.date)}
                </span>
                <span>{t('calendar.grid', { count: view.gridSize })}</span>
                {view.prize === null ? null : (
                  <span>{t('calendar.prize', { amount: formatMoney(view.prize) })}</span>
                )}
                {view.money?.fee ? (
                  <span>{t('event.money.fee', { amount: formatMoney(view.money.fee) })}</span>
                ) : null}
              </p>
            </div>

            <Link
              to={path.track({ id: view.track.id }, view.track.layout)}
              title={t('championships.calendar.openTrack')}
              className="relative block aspect-[16/9] w-36 shrink-0 overflow-hidden rounded-md bg-muted hover-outline"
            >
              <LayoutMap track={view.track} alt={view.roundName} className="p-1.5" iconClassName="size-6" />
            </Link>
          </div>
        ) : null}
        {!view && event.loading ? <EventHeadSkeleton /> : null}
      </ScreenHeader>

      {error ? (
        <WordingKind.Provider value={historic ? 'historic' : 'series'}>
          <ErrorCard error={error} onDismiss={() => { event.dismissError(); skip.dismissError(); }} />
        </WordingKind.Provider>
      ) : null}
      {event.loading ? <EventSkeleton /> : null}

      {view ? (
        <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="flex flex-col gap-4">
            {/* A historic event the player was invited to has a seat rather
                than an entry. A round of a closed season, or of an edition
                already over, can only be read back - entering would be
                refused. */}
            {historic && view.entered ? (
              <HistoricSeatPanel
                view={view}
                entered={view.entered}
                historic={historic}
                busy={event.busy || running}
                onDecline={() => { void event.decline(); }}
              />
            ) : null}
            {!historic && view.entered ? <EntryPanel entry={view.entered} /> : null}
            {historic || view.entered || view.blocked?.code === 'career.season.closed'
              || view.behind.length === view.rounds ? null : (
                <EnterPanel
                  view={view}
                  busy={event.busy}
                  onEnter={(entry, car) => { void event.enter(entry, car); }}
                />
              )}
            <EventSessionList
              sessions={view.sessions}
              selected={selected}
              summary={summary}
              substituted={view.substituted}
              about={historic !== null}
              onSelect={setPicked}
            />
            {/* Under the sessions rather than above them, since the list is how
                the page is moved around. */}
            {view.entered && view.strength ? (
              <RoundStrength
                view={view}
                entered={view.entered}
                strength={view.strength}
                championship={historic ? null : path.championship({ id: view.series }, run)}
                onChange={(step) => { void event.setStrength(step); }}
              />
            ) : null}
          </aside>

          {selected === ABOUT && historic ? (
            <div className="flex flex-col gap-4">
              {/* A historic event opens here and has no sessions to open
                  instead, so its skip heads what it is about. */}
              {skipPanel}
              <Card className="py-4">
                <CardContent className="flex flex-col gap-4 px-4">
                  {/* Untitled: the event's own description heads it, under the
                      same words the list beside it uses. */}
                  <HistoricAbout
                    event={historic.event}
                    availability={historic.availability}
                    playerSeat={historic.seat}
                    speed={prizeSpeed(slot.career)}
                  />
                </CardContent>
              </Card>
            </div>
          ) : null}
          {selected === SUMMARY && summary ? (
            <Card className="py-4">
              <CardContent className="flex flex-col gap-4 px-4">
                <h2 className="text-lg font-semibold">{t('event.summary.title')}</h2>
                {results.results ? (
                  <RoundSummary
                    view={view}
                    results={results.results}
                    playerName={playerName}
                    onFull={openStandings}
                  />
                ) : null}
                {results.loading ? (
                  <RoundSummarySkeleton
                    entered={view.entered !== null}
                    races={view.sessions.filter((one) => one.type === 'race').length}
                    round={view.number}
                    historic={historic !== null}
                    paid={view.money !== null}
                  />
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          {selected !== SUMMARY && selected !== ABOUT && session ? (
            <SessionDetail
              view={view}
              session={session}
              series={results.results?.championship ?? null}
              busy={event.busy}
              length={next?.type === 'race' && lengthKey ? {
                scale,
                disabled: event.busy || running || view.blocked !== null,
                onChange: (step) => setLength({ key: lengthKey, scale: step }),
              } : undefined}
              onLaunch={() => {
                if (view.skips.length > 0) {
                  setConfirming(true);

                  return;
                }

                setPicked(null);
                void event.launch(false, scale);
              }}
            />
          ) : null}
          {/* A round the install cannot race plans no sessions, so skipping
              it stands where they would. */}
          {selected !== SUMMARY && selected !== ABOUT && !session ? skipPanel : null}
          {selected !== SUMMARY && selected !== ABOUT && !session && !skippable ? (
            <p className="text-sm text-muted-foreground">{t('event.noSessions')}</p>
          ) : null}
        </div>
      ) : null}

      {view && session ? (
        <SkipDialog
          open={confirming}
          title={t('skip.launchTitle', { count: view.skips.length })}
          description={t(
            view.skips.some((one) => one.reason === 'partway') ? 'skip.launchHintPartway' : 'skip.launchHint',
            { round: view.roundName, day: formatDayShort(view.date) },
          )}
          rounds={view.skips}
          note={scale > 1 && next?.laps !== undefined ? t('event.length.skip', {
            share: scaleName(scale, t),
            laps: shortLaps(next.laps, scale, t),
          }) : undefined}
          confirmLabel={t('skip.launchConfirm', {
            count: view.skips.length,
            name: sessionName(session, t),
          })}
          busy={event.busy}
          onConfirm={() => {
            setConfirming(false);
            setPicked(null);
            void event.launch(true, scale);
          }}
          onClose={() => setConfirming(false)}
        />
      ) : null}
      <SkipRoundDialog skip={skip} />
    </ScreenBody>
  );
};
