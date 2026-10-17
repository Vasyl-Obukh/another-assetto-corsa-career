import { CheckIcon, ChevronRightIcon, InfoIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { HistoricResultCard } from './HistoricResultCard.tsx';
import { ResultDetailSkeleton } from './ResultDetailSkeleton.tsx';
import { ResultHero } from './ResultHero.tsx';
import { editionsOf } from '../../../../shared/utils/editions';
import { formatGap, formatLapTime } from '../../../../shared/utils/lap-time';
import { entryResults } from '../../../../shared/utils/standings';
import { useSlot } from '@/app';
import {
  BonusPoints, ClassificationTable, ErrorCard, Podium, ResultCell, ResultStrip,
  ScreenBody, ScreenHeader, StandingsTable,
} from '@/components';
import type { StripFigure } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import {
  useCareerEvent, usePageName, useQuickArchives, useResult,
} from '@/hooks';
import { usePlayerName } from '@/hooks';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { classifiedRows, racedClasses } from '@/lib/classification';
import {
  archiveOrigins, quickOrigins, raceTitle, sessionTypeOf,
} from '@/lib/result-events';
import { linkRun, path, ROUTE } from '@/lib/routes';
import { seasonResults } from '@/lib/season-results';
import { prizeFor } from '@/lib/season-review';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';

export const ResultDetail = () => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber } = useFormat();
  const { file = '' } = useParams<PathParam<typeof ROUTE.result>>();
  const detail = useResult(file);
  const { career } = useSlot();

  const { record } = detail;
  const origin = useMemo(() => archiveOrigins(career).get(file) ?? null, [career, file]);
  // A race event of the player's own that still lists the archive, which the
  // breadcrumb leads back to. Waited for, so the title is said once.
  const archives = useQuickArchives();
  const quick = useMemo(
    () => (origin ? null : quickOrigins(archives.archives).get(file) ?? null),
    [origin, archives.archives, file],
  );
  const loading = detail.loading || archives.loading;
  // The run the archive was raced in, so a result from an earlier season or
  // another edition reads its own round rather than this year's.
  const run = origin ? linkRun(
    { season: origin.season, edition: origin.entry.edition },
    career?.seasons.at(-1)?.index,
    editionsOf(origin.entry.championship),
  ) : undefined;
  const event = useCareerEvent(origin?.entry.series ?? '', origin?.round ?? '', run);
  const view = origin ? event.view : null;
  const session = record?.summary.sessions.at(-1) ?? null;
  const type = sessionTypeOf(session?.type ?? 1);
  const race = type === 'race';
  const eventSession = view?.sessions.find((one) => one.index === origin?.launch) ?? null;
  const championship = origin?.entry.championship ?? null;
  const round = championship?.rounds.find((one) => one.id === origin?.round) ?? null;
  const number = round && championship ? championship.rounds.indexOf(round) + 1 : 0;
  // A historic event is one event: no championship around it, no table it
  // stands in, and money rather than points.
  const historic = origin?.entry.historic === true;
  const playerName = usePlayerName();

  // A race event of the player's own has no grid to hand, and its launch says
  // what class each car raced in.
  const source = {
    type,
    standings: session?.standings ?? null,
    record: eventSession?.record ?? quick?.launch ?? null,
    grid: view?.grid ?? [],
    score: eventSession?.score ?? null,
    startOrder: eventSession?.startOrder ?? null,
    series: championship,
    substituted: false,
  };
  const rows = classifiedRows(source);
  const mine = rows.find((row) => row.player);
  const classes = racedClasses(rows, championship?.entries ?? quick?.race.classes ?? []);
  const multi = classes.length > 1;
  // The player measures against their own class, as on the round's page.
  const own = multi && mine?.entry ? classifiedRows({ ...source, entry: mine.entry }) : rows;
  const ownRow = own.find((row) => row.player);
  const ownClass = classes.find((one) => one.id === mine?.entry);
  const fastest = Math.min(...own.map((row) => row.bestLap ?? Infinity));

  // Where the championship stood once this race was in it.
  const after = useMemo(() => {
    if (!origin || !race || historic) return null;
    const season = seasonResults(entryResults(origin.entry, origin.season), origin.round);

    return season.classes.find((one) => one.entry === origin.entry.entry) ?? null;
  }, [origin, race, historic]);

  const title = round
    ? t('results.sessionOf', {
      round: historic && championship ? championship.name : round.name,
      session: eventSession?.name ?? t(SESSION_TYPE_LABEL[type]),
    })
    : t('results.sessionOf', {
      round: quick?.race.title ?? ((record && raceTitle(record)) || record?.summary.track || ''),
      session: quick?.launch.name ?? t(SESSION_TYPE_LABEL[type]),
    });
  usePageName(record && !loading ? title : null);

  const figures: StripFigure[] = mine ? [
    {
      label: t('event.result.you'),
      value: (
        <ResultCell
          position={ownRow?.position ?? mine.position}
          scored={(mine.place?.finishPoints ?? 0) > 0}
          prefixed
          size="lg"
        />
      ),
      detail: multi && ownClass
        ? t('results.strip.inClass', { name: ownClass.name, position: mine.position, count: rows.length })
        : t('results.strip.of', { count: rows.length }),
    },
    ...(race && mine.started !== null ? [{
      label: t('results.strip.started'),
      value: t('championships.detail.position', { number: mine.started }),
      detail: mine.started === mine.position
        ? t('results.strip.held')
        : t(mine.started > mine.position ? 'results.strip.gained' : 'results.strip.lost', {
          count: Math.abs(mine.started - mine.position),
        }),
    }] : []),
    ...(mine.bestLap !== null ? [{
      label: t('event.result.best'),
      value: formatLapTime(mine.bestLap),
      detail: mine.bestLap === fastest
        ? t('results.strip.fastest')
        : t('results.strip.toFastest', { gap: formatGap(mine.bestLap - fastest) }),
    }] : []),
    // A place the player's stand-in drove pays nothing, as the table beside it says.
    ...(mine.place && !mine.place.bonusOnly && historic && championship && race ? [{
      label: t('event.summary.prize'),
      value: formatMoney(prizeFor(championship, mine.place.entry, mine.place.classPosition) ?? 0),
    }] : []),
    ...(mine.place && !historic ? [{
      label: t('event.result.points'),
      value: (
        <span className="text-result-points-foreground">
          {t('standings.bonus.plus', { points: formatNumber(mine.place.points) })}
        </span>
      ),
      detail: mine.place.points !== mine.place.finishPoints ? (
        <>
          {formatNumber(mine.place.finishPoints)}
          <BonusPoints qualifying={mine.place.qualifyingPoints} fastestLap={mine.place.fastestLapPoints} />
        </>
      ) : null,
    }] : []),
  ] : [];

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={{ to: path.results(), label: t('back.results') }} />

      {detail.error ? <ErrorCard error={detail.error} onDismiss={detail.dismissError} /> : null}
      {/* The career knows the session's kind wherever it filed the archive; a
          race is the guess everywhere else. */}
      {loading ? (
        <ResultDetailSkeleton
          race={eventSession ? eventSession.type === 'race' : true}
          standings={origin !== null && !historic && (eventSession ? eventSession.type === 'race' : true)}
          historic={historic}
        />
      ) : null}

      {!loading && record === null && detail.error === null ? (
        <p className="text-sm text-muted-foreground">{t('results.notFound')}</p>
      ) : null}

      {!loading && record && session ? (
        <>
          <ResultHero
            layout={round
              ? { id: round.track.id, layout: round.track.layout ?? '' }
              : record.layout ?? null}
            chip={(
              <Badge className={SESSION_ACCENT[type]}>{t(SESSION_TYPE_LABEL[type])}</Badge>
            )}
            links={origin && round && championship && historic ? (
              // A historic event leads back to Results, then the event itself.
              <>
                <Link to={path.results()} className="underline-offset-4 hover:underline">
                  {t('results.title')}
                </Link>
                <ChevronRightIcon className="size-3.5 opacity-60" />
                <Link
                  to={path.event({ series: origin.entry.series, round: origin.round }, run)}
                  className="underline-offset-4 hover:underline"
                >
                  {championship.name}
                </Link>
              </>
            ) : origin && round && championship ? (
              <>
                <Link to={path.championship({ id: origin.entry.series }, run)} className="underline-offset-4 hover:underline">
                  {championship.name}
                </Link>
                <ChevronRightIcon className="size-3.5 opacity-60" />
                <Link
                  to={path.event({ series: origin.entry.series, round: origin.round }, run)}
                  className="underline-offset-4 hover:underline"
                >
                  {t('championships.detail.roundAt', { number, round: round.name })}
                </Link>
              </>
            ) : quick && (
              // A race event of the player's own leads back the same way: the
              // Race tab, then the race.
              <>
                <Link to={path.race()} className="underline-offset-4 hover:underline">
                  {t('nav.race')}
                </Link>
                <ChevronRightIcon className="size-3.5 opacity-60" />
                <Link to={path.raceEvent({ id: quick.race.id })} className="underline-offset-4 hover:underline">
                  {quick.race.title}
                </Link>
              </>
            )}
            title={title}
            line={[record.layout?.name ?? record.summary.track]}
            recordedAt={record.recordedAt}
          />

          {figures.length > 0 ? <ResultStrip figures={figures} /> : null}

          <div className={cn('grid items-start gap-4', (after || historic) && 'lg:grid-cols-[minmax(0,1fr)_20rem]')}>
            <div className="flex min-w-0 flex-col gap-4">
              {race && own.length >= 3 ? <Podium rows={own} playerName={playerName} /> : null}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <ClassificationTable
                  rows={rows}
                  race={race}
                  playerName={playerName}
                  classes={classes}
                  prizeOf={historic && championship ? (row) => (
                    row.place && !row.place.bonusOnly
                      ? prizeFor(championship, row.place.entry, row.place.classPosition)
                      : null
                  ) : undefined}
                  footnote={session.order === 'raceResult' ? (
                    <>
                      <CheckIcon className="size-3.5 text-success" />
                      {t('results.order.raceResultHint')}
                    </>
                  ) : (
                    <>
                      <InfoIcon className="size-3.5 text-warning-foreground dark:text-warning" />
                      {t('results.order.inferredHint')}
                    </>
                  )}
                />
              </div>
            </div>

            {historic && origin && championship ? (
              <HistoricResultCard
                prize={mine?.place && !mine.place.bonusOnly && race
                  ? prizeFor(championship, mine.place.entry, mine.place.classPosition)
                  : null}
                place={race ? mine?.place?.classPosition ?? null : null}
                to={path.event({ series: origin.entry.series, round: origin.round }, run)}
              />
            ) : null}
            {after && championship ? (
              <aside className="flex flex-col rounded-xl border bg-card shadow-sm">
                <h2 className="px-4 pt-4 text-sm font-semibold">
                  {t('standings.afterRound', { number })}
                </h2>
                <div className="px-1 pt-2 pb-1">
                  <StandingsTable season={after} series={championship} playerName={playerName} compact />
                </div>
                {origin ? (
                  <Link
                    to={path.championship({ id: origin.entry.series }, run, 'standings')}
                    className="flex items-center justify-center gap-1 border-t py-2 text-xs font-medium text-primary hover:bg-accent/50"
                  >
                    {t('standings.fullStandings')}
                    <ChevronRightIcon className="size-3.5" />
                  </Link>
                ) : null}
              </aside>
            ) : null}
          </div>
        </>
      ) : null}
    </ScreenBody>
  );
};
