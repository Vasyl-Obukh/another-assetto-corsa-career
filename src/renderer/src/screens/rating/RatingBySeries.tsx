import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { lineRun } from './utils.ts';
import type { Career, RatingLine } from '../../../../shared/types';
import { HistoricChip, RatingChange } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { ratingSeriesTotals } from '@/lib/rating';
import { path } from '@/lib/routes';
import { disciplineKey } from '@/screens/championships';

interface RatingBySeriesProps {
  /**
   * The lines it totals.
   */
  lines: readonly RatingLine[];
  /**
   * The career, whose seasons say which run each championship's link names.
   */
  career: Pick<Career, 'seasons'>;
}

/**
 * What each championship and historic event moved its discipline's rating by,
 * most first - each chipped in its discipline, or as the historic event it was.
 */
export const RatingBySeries = ({ lines, career }: RatingBySeriesProps) => {
  const { t } = useTranslation();
  const totals = ratingSeriesTotals(lines);

  return (
    <section className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold">{t('rating.bySeries')}</h2>
      {totals.length === 0 ? <p className="text-sm text-muted-foreground">{t('rating.nothing')}</p> : null}
      {totals.map((one) => (
        <div key={`${one.season}:${one.series}:${one.edition}`} className="flex min-w-0 items-center gap-2 text-sm">
          {one.historic
            ? <HistoricChip />
            : <Badge className={DISCIPLINE_ACCENT[one.discipline]}>{t(disciplineKey(one.discipline))}</Badge>}
          <div className="flex min-w-0 flex-1 flex-col">
            {one.historic ? <span className="truncate">{one.name}</span> : (
              <Link
                to={path.championship({ id: one.series }, lineRun(one, career))}
                className="truncate hover:text-primary"
              >
                {one.name}
              </Link>
            )}
            <span className="text-xs text-muted-foreground">{t('rating.sessions', { count: one.sessions })}</span>
          </div>
          <RatingChange change={one.change} />
        </div>
      ))}
    </section>
  );
};
