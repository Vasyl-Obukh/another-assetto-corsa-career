import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisciplineTile } from './DisciplineTile.tsx';
import { HowItMoves } from './HowItMoves.tsx';
import { RatingBySeries } from './RatingBySeries.tsx';
import { RatingChart } from './RatingChart.tsx';
import { RatingLog } from './RatingLog.tsx';
import type { ChartLine, ChartTick } from './types.ts';
import { describeRatingLine } from './utils.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import { seasonYear } from '../../../../shared/utils/editions';
import { useSlot } from '@/app';
import {
  RatingChange, ScreenBody, ScreenHeader, Segments,
} from '@/components';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_STROKE } from '@/lib/accents';
import {
  hasRaced, ratingPoints, ratingSeasons, ratingShownBy, seasonOpening,
} from '@/lib/rating';
import type { RatingFilter } from '@/lib/rating';
import { path } from '@/lib/routes';
import { disciplineKey } from '@/screens/championships';
import { MoneyTile } from '@/screens/finances';

/**
 * The season picker's value for every season at once.
 */
const EVERY_SEASON = 'all';

/**
 * The career's ratings: the global one and each discipline's, where each
 * stands on its rung, how they moved over the career, and every change of
 * them, a line each, saying what moved it. Reached from Home and the header.
 * The page holds still and only the log scrolls.
 *
 * Read off the career the slot already holds, so there is nothing to load.
 */
export const Rating = () => {
  const { t } = useTranslation();
  const format = useFormat();
  const { formatNumber, formatYear } = format;
  const { career } = useSlot();
  const current = career?.seasons.at(-1)?.index ?? 0;
  const [picked, setPicked] = useState<string>(String(current));
  const [filter, setFilter] = useState<RatingFilter>('all');

  const log = useMemo(() => career?.ratingLog ?? [], [career]);
  const seasons = useMemo(() => {
    const held = ratingSeasons(log);

    return held.includes(current) ? held : [current, ...held];
  }, [log, current]);
  const points = useMemo(() => ratingPoints(log), [log]);

  if (!career) return null;

  const season = picked === EVERY_SEASON ? null : Number(picked);
  const inSeason = log.filter((line) => season === null || line.season === season);
  const shown = inSeason.filter((line) => ratingShownBy(line, filter)).reverse();
  const opened = seasonOpening(career, season ?? current);
  const yearOf = (index: number): string => {
    const held = career.seasons.find((one) => one.index === index);

    return held ? formatYear(seasonYear(held)) : String(index + 1);
  };

  const raced = DISCIPLINES.filter((discipline) => hasRaced(log, discipline));
  const lines: ChartLine[] = [
    ...raced.map((discipline) => ({
      key: discipline,
      label: t(disciplineKey(discipline)),
      color: DISCIPLINE_STROKE[discipline],
      values: points.map((point) => point.ratings.disciplines[discipline]),
    })),
    {
      key: 'global', label: t('rating.global'), color: 'var(--foreground)', dashed: true, values: points.map((point) => point.ratings.global),
    },
  ];
  const ticks: ChartTick[] = points.flatMap((point, at) => (
    at === 0 || point.line.season !== points[at - 1].line.season ? [{ at, label: yearOf(point.line.season) }] : []
  ));
  const labels = points.map((point) => (point.line.kind === 'opening'
    ? t('rating.chart.opened', { year: yearOf(0) })
    : describeRatingLine(point.line, t, format).title));
  const unraced = DISCIPLINES.filter((discipline) => !raced.includes(discipline));

  return (
    <ScreenBody className="flex h-full flex-col gap-5 pb-6">
      <ScreenHeader back={{ to: path.home(), label: t('back.home') }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{t('rating.title')}</h1>
          <span className="text-sm text-muted-foreground">{t('rating.subtitle')}</span>
        </div>
      </ScreenHeader>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={picked} onValueChange={setPicked}>
          <SelectTrigger className="w-40" aria-label={t('rating.season')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((index) => <SelectItem key={index} value={String(index)}>{yearOf(index)}</SelectItem>)}
            <SelectItem value={EVERY_SEASON}>{t('rating.everySeason')}</SelectItem>
          </SelectContent>
        </Select>
        <Segments
          label={t('rating.show')}
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'all', label: t('rating.filter.all') },
            { id: 'sessions', label: t('rating.filter.sessions') },
            { id: 'levels', label: t('rating.filter.levels') },
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MoneyTile
          lead="rating"
          label={t('rating.global')}
          value={formatNumber(career.globalRating)}
          hint={(
            <>
              <RatingChange change={career.globalRating - opened.global} className="text-xs" />
              {' '}
              {t('rating.thisSeason')}
            </>
          )}
        >
          <span className="text-xs text-muted-foreground">{t('rating.globalHint')}</span>
        </MoneyTile>
        {DISCIPLINES.map((discipline) => (
          <DisciplineTile
            key={discipline}
            career={career}
            discipline={discipline}
            change={career.rating[discipline] - opened.disciplines[discipline]}
          />
        ))}
      </div>

      {/* Held at a height where the window allows, so only the log scrolls;
          a window too short for that lets the page scroll instead. */}
      <div className="flex min-h-96 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-xl border bg-card px-4 pt-3 pb-2">
            <h2 className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
              {t('rating.chart.title')}
              <span className="ml-auto flex flex-wrap items-center gap-3 text-xs font-normal text-muted-foreground">
                {lines.map((line) => (
                  <span key={line.key} className="flex items-center gap-1.5">
                    <span className="h-0.5 w-3.5 rounded-full" style={{ background: line.color }} />
                    {line.label}
                  </span>
                ))}
                {unraced.length > 0 ? (
                  <span>{t('rating.chart.unraced', { disciplines: unraced.map((one) => t(disciplineKey(one))).join(', ') })}</span>
                ) : null}
              </span>
            </h2>
            <RatingChart lines={lines} labels={labels} ticks={ticks} />
          </section>
          <section className="flex min-h-48 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
            <h2 className="flex items-baseline gap-2 px-4 pt-3 pb-2 text-sm font-semibold">
              {t('rating.log')}
              <span className="font-normal text-muted-foreground">{t('rating.lines', { count: shown.length })}</span>
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {shown.length > 0
                ? <RatingLog lines={shown} career={career} />
                : <p className="px-4 pb-4 text-sm text-muted-foreground">{t('rating.empty')}</p>}
            </div>
          </section>
        </div>
        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <RatingBySeries lines={inSeason} career={career} />
          <HowItMoves speed={career.settings.ratingSpeed} />
        </aside>
      </div>
    </ScreenBody>
  );
};
