import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { ChampionsCard } from './ChampionsCard.tsx';
import { ChampionshipReviewSkeleton } from './ChampionshipReviewSkeleton.tsx';
import { FinalStandingsCard } from './FinalStandingsCard.tsx';
import { NextEditionCard } from './NextEditionCard.tsx';
import { ReviewHero } from './ReviewHero.tsx';
import { RoundPathCard } from './RoundPathCard.tsx';
import { TeammateCard } from './TeammateCard.tsx';
import { editionEntry, editionsOf, seasonYear } from '../../../../shared/utils/editions';
import {
  ErrorCard, ResultCell, ResultStrip, ScreenBody, ScreenHeader,
} from '@/components';
import {
  useCareer, useCarNames, usePageName, usePlayerName,
} from '@/hooks';
import { useFormat } from '@/i18n';
import { editionName } from '@/lib/edition-names';
import { linkRun, path, ROUTE } from '@/lib/routes';
import { teamName } from '@/lib/season-results';
import {
  championshipReview, editionOver, nextRun,
} from '@/lib/season-review';

/**
 * One edition of a championship the career raced, looked back on: where the
 * player finished, the champions, the season round by round, the teammate and
 * the final tables - read off the season's own copy, so it never changes once
 * the edition is over.
 */
export const ChampionshipReview = () => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort, formatNumber } = useFormat();
  const params = useParams<PathParam<typeof ROUTE.championshipReview>>();
  const { career, calendar, error, dismissError } = useCareer();
  const playerName = usePlayerName();

  const index = Number(params.season);
  const edition = Number(params.edition);
  const series = params.series ?? '';
  const season = career?.seasons.find((one) => one.index === index) ?? null;
  const entry = season ? editionEntry(season, series, edition) : null;
  const review = useMemo(() => (entry && season ? championshipReview(entry, season.index) : null), [entry, season]);
  const carName = useCarNames(entry ? [entry.car.model] : []);

  const year = season ? seasonYear(season) : null;
  const name = entry && year !== null
    ? editionName({ year, edition: entry.edition, editions: editionsOf(entry.championship) }, t)
    : null;
  usePageName(entry && name ? `${entry.championship.name} ${name}` : null);
  const back = { to: path.history(), label: t('back.history') };

  if (!career) {
    return (
      <ScreenBody className="flex flex-col gap-4 pb-8">
        <ScreenHeader back={back} />
        {error ? <ErrorCard error={error} onDismiss={dismissError} /> : <ChampionshipReviewSkeleton />}
      </ScreenBody>
    );
  }

  if (!season || !entry || !review || year === null || name === null) {
    return (
      <ScreenBody className="flex flex-col gap-4 pb-8">
        <ScreenHeader back={back} />
        <p className="text-sm text-muted-foreground">{t('review.notFound')}</p>
      </ScreenBody>
    );
  }

  const over = editionOver(entry, career.date);
  const { figures, me, table } = review;
  const classEntry = entry.championship.entries.find((one) => one.id === entry.entry);
  const seat = classEntry?.seats.find((one) => one.id === entry.playerSeat);
  const first = entry.events[0]?.date;
  const last = entry.events.at(-1)?.date;
  const current = career.seasons.at(-1)?.index;
  const next = nextRun(entry, season.index);
  const nextYear = next.season === season.index ? year : year + 1;
  // The next run's own rounds, where the calendar holds them: the current
  // season's. A run of a season not yet opened has none to show.
  const nextDates = calendar?.season === next.season
    ? calendar.events
      .filter((one) => one.series === series && one.edition === next.edition)
      .map((one) => one.date)
      .sort()
    : [];
  // Offered only while the next run is still to come: one of a season gone by,
  // or one whose rounds are all behind the clock, can no longer be entered.
  const nextAhead = current !== undefined
    && (next.season > current || (next.season === current && (nextDates.at(-1) ?? career.date) >= career.date));
  const line = [
    t('review.rounds', { count: entry.events.length }),
    ...(figures ? [t('review.races', { count: figures.races })] : []),
    ...(first && last ? [t('review.dates', { from: formatDayShort(first), to: formatDay(last) })] : []),
    ...[teamName(entry.championship, seat?.team)].filter((one): one is string => one !== null),
    carName(entry.car.model),
  ];

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={back} />
      {error ? <ErrorCard error={error} onDismiss={dismissError} /> : null}
      {over ? null : <p className="text-sm text-muted-foreground">{t('review.notOver')}</p>}

      <ReviewHero
        name={entry.championship.name}
        edition={name}
        ladder={classEntry?.ladder ?? null}
        finale={entry.championship.rounds.at(-1)}
        line={line}
        over={over}
        position={figures && review.season.counted > 0 ? me?.position ?? null : null}
        field={review.field}
        points={figures?.points ?? 0}
      />

      {figures ? (
        <ResultStrip
          figures={[
            {
              label: t('review.figures.points'),
              value: formatNumber(figures.points),
              detail: me?.position === 1
                ? t('review.clear', { points: formatNumber(figures.lead) })
                : t('review.toChampion', { points: formatNumber(figures.gap) }),
            },
            {
              label: t('review.figures.wins'),
              value: formatNumber(figures.wins),
              detail: t('review.podiums', { count: figures.podiums }),
            },
            {
              label: t('review.figures.poles'),
              value: formatNumber(figures.poles),
              detail: t('review.fastestLaps', { count: figures.fastestLaps }),
            },
            {
              label: t('review.figures.best'),
              value: figures.best === null
                ? t('home.noPosition')
                : <ResultCell position={figures.best} scored={figures.best <= 10} size="lg" />,
              detail: figures.average === null
                ? undefined
                : t('review.average', { value: formatNumber(Math.round(figures.average * 10) / 10) }),
            },
            {
              label: t('review.figures.starts'),
              value: formatNumber(figures.starts),
              detail: [
                t('review.startsOf', { count: figures.races }),
                figures.nonStarts > 0
                  ? t('review.nonStarts', { count: figures.nonStarts })
                  : t('review.noNonStarts'),
              ].join(' · '),
            },
          ]}
        />
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {review.season.counted > 0 ? (
            <ChampionsCard entry={entry} champions={review.champions} playerName={playerName} />
          ) : null}
          <RoundPathCard
            series={entry.championship}
            path={review.path}
            field={review.field}
          />
          {table ? (
            <FinalStandingsCard
              table={table}
              series={entry.championship}
              playerName={playerName}
              everyRace={path.championship(
                { id: series },
                linkRun({ season: season.index, edition: entry.edition }, current, editionsOf(entry.championship)),
                'standings',
              )}
            />
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          {nextAhead ? (
            <NextEditionCard
              entry={entry}
              next={next}
              year={nextYear}
              opens={nextDates[0] ?? null}
              open={next.season === current}
            />
          ) : null}
          {me && review.teammate ? (
            <TeammateCard series={entry.championship} me={me} record={review.teammate} playerName={playerName} />
          ) : null}
        </aside>
      </div>
    </ScreenBody>
  );
};
