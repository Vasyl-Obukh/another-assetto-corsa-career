import { CheckIcon, ChevronRightIcon, InfoIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { ResultDetailSkeleton } from './ResultDetailSkeleton.tsx';
import { ResultHero } from './ResultHero.tsx';
import { formatGap, formatLapTime } from '../../../../shared/utils/lap-time';
import { entryResults } from '../../../../shared/utils/standings';
import {
  BonusPoints, ClassificationTable, ErrorCard, Podium, ResultCell, ResultStrip,
  ScreenBody, ScreenHeader, StandingsTable,
} from '@/components';
import type { StripFigure } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import {
  useCareer, useCareerEvent, usePageName, useResult,
} from '@/hooks';
import { usePlayerName } from '@/hooks';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { classifiedRows } from '@/lib/classification';
import { archiveOrigins, raceTitle, sessionTypeOf } from '@/lib/result-weekends';
import { path, ROUTE } from '@/lib/routes';
import { seasonResults } from '@/lib/season-results';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';

export const ResultDetail = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { file = '' } = useParams<PathParam<typeof ROUTE.result>>();
  const detail = useResult(file);
  const { career } = useCareer();

  const { record } = detail;
  const origin = useMemo(() => archiveOrigins(career).get(file) ?? null, [career, file]);
  const event = useCareerEvent(origin?.entry.series ?? '', origin?.round ?? '');
  const view = origin ? event.view : null;
  const session = record?.summary.sessions.at(-1) ?? null;
  const type = sessionTypeOf(session?.type ?? 1);
  const race = type === 'race';
  const eventSession = view?.sessions.find((one) => one.index === origin?.launch) ?? null;
  const championship = origin?.entry.championship ?? null;
  const round = championship?.rounds.find((one) => one.id === origin?.round) ?? null;
  const number = round && championship ? championship.rounds.indexOf(round) + 1 : 0;
  const playerName = usePlayerName();

  const rows = classifiedRows({
    type,
    standings: session?.standings ?? null,
    record: eventSession?.record ?? null,
    grid: view?.grid ?? [],
    score: eventSession?.score ?? null,
    startOrder: eventSession?.startOrder ?? null,
    series: championship,
    substituted: false,
  });
  const mine = rows.find((row) => row.player);
  const fastest = Math.min(...rows.map((row) => row.bestLap ?? Infinity));

  // Where the championship stood once this race was in it.
  const after = useMemo(() => {
    if (!origin || !race) return null;
    const season = seasonResults(entryResults(origin.entry), origin.round);

    return season.classes.find((one) => one.entry === origin.entry.entry) ?? null;
  }, [origin, race]);

  const title = round
    ? t('results.sessionOf', { round: round.name, session: eventSession?.name ?? t(SESSION_TYPE_LABEL[type]) })
    : t('results.sessionOf', {
      round: (record && raceTitle(record)) || record?.summary.track || '',
      session: t(SESSION_TYPE_LABEL[type]),
    });
  usePageName(record ? title : null);

  const figures: StripFigure[] = mine ? [
    {
      label: t('event.result.you'),
      value: <ResultCell position={mine.position} scored={(mine.place?.finishPoints ?? 0) > 0} prefixed size="lg" />,
      detail: t('results.strip.of', { count: rows.length }),
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
    ...(mine.place ? [{
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
      {detail.loading ? (
        <ResultDetailSkeleton
          race={eventSession ? eventSession.type === 'race' : true}
          standings={origin !== null && (eventSession ? eventSession.type === 'race' : true)}
        />
      ) : null}

      {!detail.loading && record === null && detail.error === null ? (
        <p className="text-sm text-muted-foreground">{t('results.notFound')}</p>
      ) : null}

      {record && session ? (
        <>
          <ResultHero
            layout={round
              ? { id: round.track.id, layout: round.track.layout ?? '' }
              : record.layout ?? null}
            chip={(
              <Badge className={SESSION_ACCENT[type]}>{t(SESSION_TYPE_LABEL[type])}</Badge>
            )}
            links={origin && round && championship ? (
              <>
                <Link to={path.championship({ id: origin.entry.series })} className="underline-offset-4 hover:underline">
                  {championship.name}
                </Link>
                <ChevronRightIcon className="size-3.5 opacity-60" />
                <Link
                  to={path.event({ series: origin.entry.series, round: origin.round })}
                  className="underline-offset-4 hover:underline"
                >
                  {t('championships.detail.roundAt', { number, round: round.name })}
                </Link>
              </>
            ) : null}
            title={title}
            line={[record.layout?.name ?? record.summary.track]}
            recordedAt={record.recordedAt}
          />

          {figures.length > 0 ? <ResultStrip figures={figures} /> : null}

          <div className={cn('grid items-start gap-4', after && 'lg:grid-cols-[minmax(0,1fr)_20rem]')}>
            <div className="flex min-w-0 flex-col gap-4">
              {race && rows.length >= 3 ? <Podium rows={rows} playerName={playerName} /> : null}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <ClassificationTable
                  rows={rows}
                  race={race}
                  playerName={playerName}
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
                    to={{ pathname: path.championship({ id: origin.entry.series }), search: '?tab=standings' }}
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
