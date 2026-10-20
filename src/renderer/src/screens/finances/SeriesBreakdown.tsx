import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Career, LedgerLine } from '../../../../shared/types';
import { HistoricChip, MoneyAmount } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { seriesTotals } from '@/lib/finances';
import { path } from '@/lib/routes';
import { disciplineKey } from '@/screens/championships';

interface SeriesBreakdownProps {
  /**
   * The lines it totals.
   */
  lines: readonly LedgerLine[];
  /**
   * The career, whose seasons say which discipline each championship was
   * raced in.
   */
  career: Career;
}

/**
 * What each championship and historic event came to, net of its fees, most
 * first - each chipped in its discipline, or as the historic event it was.
 */
export const SeriesBreakdown = ({ lines, career }: SeriesBreakdownProps) => {
  const { t } = useTranslation();
  const totals = seriesTotals(lines);

  return (
    <section className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold">{t('finances.bySeries')}</h2>
      {totals.length === 0 ? <p className="text-sm text-muted-foreground">{t('finances.nothing')}</p> : null}
      {totals.map((one) => {
        const entry = career.seasons
          .find((season) => season.index === one.season)?.entries
          .find((held) => held.series === one.series && held.edition === one.edition);
        const discipline = entry?.championship.entries.find((held) => held.id === entry.entry)?.ladder.discipline;

        return (
          <div key={one.series} className="flex min-w-0 items-center gap-2 text-sm">
            {one.historic ? <HistoricChip /> : null}
            {!one.historic && discipline ? (
              <Badge className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
            ) : null}
            {one.historic ? <span className="min-w-0 flex-1 truncate">{one.name}</span> : (
              <Link
                to={path.championship({ id: one.series }, { season: one.season, edition: one.edition })}
                className="min-w-0 flex-1 truncate hover:text-primary"
              >
                {one.name}
              </Link>
            )}
            <MoneyAmount amount={one.amount} />
          </div>
        );
      })}
    </section>
  );
};
