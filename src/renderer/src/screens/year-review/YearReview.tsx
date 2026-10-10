import { ArrowRightIcon, CalendarClockIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { EditionCard } from './EditionCard.tsx';
import { YearHeadSkeleton } from './YearHeadSkeleton.tsx';
import { YearReviewSkeleton } from './YearReviewSkeleton.tsx';
import { addDays } from '../../../../shared/utils/calendar-days';
import { seasonYear } from '../../../../shared/utils/editions';
import {
  AdvanceDialog, ErrorCard, ResultStrip, ScreenBody, ScreenHeader,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  useCareer, useClockMove, usePageName,
} from '@/hooks';
import { useFormat } from '@/i18n';
import { EDITION_ACCENT } from '@/lib/accents';
import { linkRun, path, ROUTE } from '@/lib/routes';
import { yearReview } from '@/lib/season-review';

/**
 * One season of the career, looked back on: the year in numbers and every
 * edition it entered. While the season is the current one it is the year so
 * far, and the place it is finished from - moving the clock on into the next,
 * which gives up whatever of it is still to run once the player has said so.
 */
export const YearReview = () => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort, formatNumber } = useFormat();
  const { season: param } = useParams<PathParam<typeof ROUTE.yearReview>>();
  const state = useCareer();
  const move = useClockMove(state);
  const { career, calendar } = state;

  const index = Number(param);
  const season = career?.seasons.find((one) => one.index === index) ?? null;
  const review = useMemo(() => (season && career ? yearReview(season, career.date) : null), [season, career]);
  const year = season ? seasonYear(season) : null;
  usePageName(year === null ? null : String(year));
  const back = { to: path.history(), label: t('back.history') };

  if (!career) {
    return (
      <ScreenBody className="flex flex-col gap-4 pb-8">
        <ScreenHeader back={back}>{state.error ? null : <YearHeadSkeleton />}</ScreenHeader>
        {state.error ? <ErrorCard error={state.error} onDismiss={state.dismissError} /> : <YearReviewSkeleton />}
      </ScreenBody>
    );
  }

  if (!season || !review || year === null) {
    return (
      <ScreenBody className="flex flex-col gap-4 pb-8">
        <ScreenHeader back={back} />
        <p className="text-sm text-muted-foreground">{t('yearReview.notFound')}</p>
      </ScreenBody>
    );
  }

  // Only the career's last season is still open; every other has closed.
  const open = career.seasons.at(-1) === season;
  const { totals } = review;
  const next = addDays(season.endDate, 1);
  const running = open ? review.running.filter((one) => !one.withdrawn) : [];
  const finish = (): void => move.moveTo(next);

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={back}>
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
            {year}
            <Badge className={open ? EDITION_ACCENT.running : EDITION_ACCENT.over}>
              {t(open ? 'history.underWay' : 'history.closed')}
            </Badge>
          </h1>
          <span className="pb-0.5 text-sm text-muted-foreground">
            {open
              ? t('yearReview.subtitleOpen', { day: formatDay(career.date) })
              : t('yearReview.subtitleClosed', { from: formatDayShort(season.startDate), to: formatDay(season.endDate) })}
          </span>
        </div>
      </ScreenHeader>

      {state.error ? <ErrorCard error={state.error} onDismiss={state.dismissError} /> : null}

      <ResultStrip
        figures={[
          {
            label: t('yearReview.figures.championships'),
            value: formatNumber(totals.championships),
            detail: t('yearReview.finished', { count: totals.finished }),
          },
          { label: t('yearReview.figures.titles'), value: formatNumber(totals.titles) },
          {
            label: t('yearReview.figures.starts'),
            value: formatNumber(totals.starts),
            detail: totals.nonStarts > 0
              ? t('yearReview.nonStarts', { count: totals.nonStarts })
              : t('yearReview.noNonStarts'),
          },
          {
            label: t('yearReview.figures.wins'),
            value: formatNumber(totals.wins),
            detail: t('yearReview.podiums', { count: totals.podiums }),
          },
          {
            label: t('yearReview.figures.poles'),
            value: formatNumber(totals.poles),
            detail: t('yearReview.fastestLaps', { count: totals.fastestLaps }),
          },
        ]}
      />

      {running.map((one) => {
        const left = calendar?.events.filter((event) => (
          event.enrolled && event.series === one.series && event.edition === one.edition && event.status === 'scheduled'
        )) ?? [];
        const upcoming = left[0];

        return (
          <section key={`${one.series}-${one.edition}`} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
            <CalendarClockIcon className="size-5 text-primary" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold">{t('yearReview.running', { name: one.name })}</span>
              {left.length > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {t('yearReview.runningHint', { count: left.length, day: formatDayShort(left[left.length - 1].date) })}
                </span>
              ) : null}
            </div>
            {upcoming ? (
              <Button asChild variant="outline">
                <Link
                  to={path.event(
                    { series: one.series, round: upcoming.round },
                    linkRun({ season: one.season, edition: one.edition }, one.season, one.editions),
                  )}
                >
                  {t('yearReview.goToRound')}
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" disabled={state.busy} onClick={finish}>
              {t('yearReview.finishAnyway', { year })}
            </Button>
          </section>
        );
      })}

      <header className="flex items-baseline justify-between gap-3 px-1 pt-2">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('yearReview.yourChampionships')}
        </h2>
        {review.editions.length > 0 ? (
          <span className="text-xs text-muted-foreground">{t('yearReview.eachOpens')}</span>
        ) : null}
      </header>
      {review.editions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('yearReview.empty')}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {review.editions.map((one) => (
            <EditionCard key={`${one.series}-${one.edition}-${one.entry}`} summary={one} year={year} />
          ))}
        </div>
      )}

      {open ? (
        <div className="flex justify-end pt-2">
          <Button size="lg" disabled={state.busy} onClick={finish}>
            {t('yearReview.finish', { year, next: year + 1 })}
            <ArrowRightIcon />
          </Button>
        </div>
      ) : null}

      <AdvanceDialog pending={move.pending} busy={state.busy} onConfirm={move.confirm} onClose={move.cancel} />
    </ScreenBody>
  );
};
