import { ChevronRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { HistorySkeleton } from './HistorySkeleton.tsx';
import { HistoryTable } from './HistoryTable.tsx';
import { seasonYear } from '../../../../shared/utils/editions';
import { ErrorCard, ScreenBody, ScreenHeader } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCareer } from '@/hooks';
import { EDITION_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { historicReview, yearReview } from '@/lib/season-review';

/**
 * Every season of the career, newest first, the current one included: what
 * each entered and how it ended, and the way into each year's review and each
 * edition's. Reached from Home rather than the navigation.
 */
export const History = () => {
  const { t } = useTranslation();
  const { career, error, dismissError } = useCareer();

  const years = useMemo(() => (career ? [...career.seasons].reverse().map((season) => ({
    season,
    year: seasonYear(season),
    open: season === career.seasons.at(-1),
    review: yearReview(season, career.date),
    historic: historicReview(season),
  })) : []), [career]);

  return (
    <ScreenBody className="flex flex-col gap-6 pb-8">
      <ScreenHeader back={{ to: path.home(), label: t('back.home') }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{t('history.title')}</h1>
          <span className="text-sm text-muted-foreground">{t('history.subtitle')}</span>
        </div>
      </ScreenHeader>

      {error ? <ErrorCard error={error} onDismiss={dismissError} /> : null}
      {!career && !error ? <HistorySkeleton /> : null}
      {career && years.every((one) => one.review.editions.length === 0) ? (
        <p className="text-sm text-muted-foreground">{t('history.empty')}</p>
      ) : null}

      {years.filter((one) => one.open || one.review.editions.length > 0 || one.historic.raced > 0).map(({
        season, year, open, review, historic,
      }) => (
        <section key={season.index} className="flex flex-col gap-2">
          <header className="flex flex-wrap items-center gap-2.5 px-0.5">
            <h2 className="text-xl font-semibold">{year}</h2>
            <Badge className={open ? EDITION_ACCENT.running : EDITION_ACCENT.over}>
              {t(open ? 'history.underWay' : 'history.closed')}
            </Badge>
            <span className="ml-1.5 flex flex-wrap gap-3.5 text-sm text-muted-foreground">
              <span>{t('history.championships', { count: review.totals.championships })}</span>
              <span>{t('history.titles', { count: review.totals.titles })}</span>
              <span>{t('home.wins', { count: review.totals.wins })}</span>
              <span>{t('history.podiums', { count: review.totals.podiums })}</span>
              {/* Beside the championships, never among them. */}
              {historic.rows.length > 0 ? (
                <span>{t('history.historic', { count: historic.raced, wins: historic.wins })}</span>
              ) : null}
            </span>
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link to={path.yearReview({ season: season.index })}>
                {t(open ? 'history.soFar' : 'history.yearReview')}
                <ChevronRightIcon />
              </Link>
            </Button>
          </header>
          {review.editions.length > 0
            ? <HistoryTable editions={review.editions} year={year} />
            : <p className="px-0.5 text-sm text-muted-foreground">{t('history.nothing')}</p>}
        </section>
      ))}
    </ScreenBody>
  );
};
