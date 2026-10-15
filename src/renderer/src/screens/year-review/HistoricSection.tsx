import { useTranslation } from 'react-i18next';

import { HistoricEventRow } from './HistoricEventRow.tsx';
import { ResultStrip } from '@/components';
import { useFormat } from '@/i18n';
import type { HistoricReview } from '@/lib/season-review';

interface HistoricSectionProps {
  /**
   * The season's historic events.
   */
  review: HistoricReview;
  /**
   * Which season it is, counting from zero.
   */
  season: number;
  /**
   * The season the career is in.
   */
  current: number;
}

// A season's historic events, under its championships: what the player made of
// them in figures, then every one the season drew.
export const HistoricSection = ({ review, season, current }: HistoricSectionProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber } = useFormat();

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between gap-3 px-1 pt-2">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('yearReview.historic.title')}
        </h2>
        <span className="text-xs text-muted-foreground">
          {t('yearReview.historic.drawn', { count: review.rows.length })}
        </span>
      </header>

      <ResultStrip
        figures={[
          {
            label: t('yearReview.historic.raced'),
            value: formatNumber(review.raced),
            detail: t('yearReview.historic.of', { count: review.rows.length }),
          },
          { label: t('yearReview.figures.wins'), value: formatNumber(review.wins) },
          { label: t('yearReview.historic.podiums'), value: formatNumber(review.podiums) },
          { label: t('yearReview.historic.prize'), value: formatMoney(review.prize) },
          {
            label: t('yearReview.historic.notRaced'),
            value: formatNumber(review.notRaced),
            detail: t('yearReview.historic.byField'),
          },
        ]}
      />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-2xl border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 pl-4 font-normal">{t('yearReview.historic.column.date')}</th>
              <th className="py-2 pr-3 font-normal">{t('yearReview.historic.column.event')}</th>
              <th className="py-2 pr-3 font-normal">{t('yearReview.historic.column.car')}</th>
              <th className="py-2 pr-3 font-normal">{t('yearReview.historic.column.qualified')}</th>
              <th className="py-2 pr-3 font-normal">{t('yearReview.historic.column.finished')}</th>
              <th className="py-2 pr-4 text-right font-normal">{t('yearReview.historic.column.prize')}</th>
            </tr>
          </thead>
          <tbody>
            {review.rows.map((row) => (
              <HistoricEventRow key={row.series} row={row} season={season} current={current} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
