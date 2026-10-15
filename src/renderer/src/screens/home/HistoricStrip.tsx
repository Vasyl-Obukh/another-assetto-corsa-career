import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { HistoricTile } from './HistoricTile.tsx';
import { stripRows } from './utils.ts';
import { path } from '@/lib/routes';
import type { HistoricReview } from '@/lib/season-review';

interface HistoricStripProps {
  /**
   * The season's historic events.
   */
  review: HistoricReview;
  /**
   * Which season, counting from zero, for the way into its review.
   */
  season: number;
  /**
   * The season's year, which heads the strip.
   */
  year: number;
  /**
   * The ISO date the career's clock stands at.
   */
  clock: string;
}

// The season's historic events as a strip of cards around the clock - the last
// two behind it and those coming up - with the way to all of them.
export const HistoricStrip = ({
  review, season, year, clock,
}: HistoricStripProps) => {
  const { t } = useTranslation();
  const shown = stripRows(review.rows, clock);
  const next = review.rows.find((row) => row.outcome === 'scheduled');

  return (
    <section className="flex flex-col gap-2">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('home.historic.title', { year })}
        </h2>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {t('home.historic.counts', { count: review.rows.length, raced: review.raced, declined: review.notRaced })}
          <Link to={path.yearReview({ season })} className="flex items-center font-medium text-primary hover:underline">
            {t('home.historic.all')}
            <ChevronRightIcon className="size-3.5" />
          </Link>
        </span>
      </header>
      <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        {shown.map((row) => <HistoricTile key={row.series} row={row} next={row === next} />)}
      </div>
    </section>
  );
};
