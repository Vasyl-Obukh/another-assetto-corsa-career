import { useTranslation } from 'react-i18next';

import { YEAR_SKELETON } from './constants.ts';
import { ResultStrip, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

// The season's historic events while the career is read: the heading, the
// figures under their real labels and the table's headings, with a
// placeholder for each value.
export const HistoricSectionSkeleton = () => {
  const { t } = useTranslation();
  const figure = { value: <Shimmer className="h-6 w-10" />, detail: <Shimmer className="h-3 w-16" /> };

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between gap-3 px-1 pt-2">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('yearReview.historic.title')}
        </h2>
        <Shimmer className="h-3 w-16" />
      </header>

      <ResultStrip
        figures={[
          { label: t('yearReview.historic.raced'), ...figure },
          { label: t('yearReview.figures.wins'), ...figure },
          { label: t('yearReview.historic.podiums'), ...figure },
          { label: t('yearReview.historic.prize'), ...figure },
          { label: t('yearReview.historic.notRaced'), ...figure },
        ]}
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full border-collapse text-sm">
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
            {slots(YEAR_SKELETON.historic).map((at) => (
              <tr key={at} className="border-t">
                <td className="py-2 pr-3 pl-4"><Shimmer className="h-3.5 w-16" /></td>
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-3">
                    <Shimmer deep className="aspect-[16/10] w-12 rounded" />
                    <Shimmer className="h-3.5 w-40" />
                  </span>
                </td>
                <td className="py-2 pr-3"><Shimmer className="h-3.5 w-36" /></td>
                <td className="py-2 pr-3"><Shimmer className="h-3.5 w-6" /></td>
                <td className="py-2 pr-3"><Shimmer className="h-5 w-8 rounded-md" /></td>
                <td className="py-2 pr-4"><Shimmer className="ml-auto h-3.5 w-14" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
