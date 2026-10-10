import { ArrowRightIcon, FlagIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';

interface YearDoneProps {
  /**
   * The season, by its index.
   */
  season: number;
  /**
   * The year it is.
   */
  year: number;
  /**
   * The ISO date the next season opens on.
   */
  opens: string;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to move the clock on into the next season.
   */
  onFinish: () => void;
  /**
   * Called to find a championship still running this year.
   */
  onFind: () => void;
}

/**
 * What stands where the next event would once everything the career entered
 * this year has run: a look back over the year, the way into the next, and
 * whatever is still left to enter before the year is out.
 */
export const YearDone = ({
  season, year, opens, busy, onFinish, onFind,
}: YearDoneProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();

  return (
    <section className="flex flex-col items-start justify-center gap-3 rounded-xl border bg-card p-6 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FlagIcon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t('home.yearDone.title', { year })}</h2>
        <p className="text-sm text-muted-foreground">{t('home.yearDone.hint', { next: year + 1 })}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link to={path.yearReview({ season })}>
            {t('home.yearDone.review', { year })}
            <ArrowRightIcon />
          </Link>
        </Button>
        <Button variant="outline" disabled={busy} onClick={onFinish}>{t('home.yearDone.finish')}</Button>
        <Button variant="ghost" className="text-primary" onClick={onFind}>{t('home.yearDone.find')}</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('home.yearDone.note', { day: formatDay(opens), next: year + 1 })}
      </p>
    </section>
  );
};
