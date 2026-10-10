import { useTranslation } from 'react-i18next';

import { HISTORY_SKELETON } from './constants.ts';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * History while the career is read: two seasons, the current one with an
 * edition and the one before with three, under the table's real headings.
 */
export const HistorySkeleton = () => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col gap-6">
      {HISTORY_SKELETON.map((rows) => (
        <section key={rows} className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-0.5">
            <Shimmer className="h-6 w-14" />
            <Shimmer className="h-5.5 w-18" />
            <Shimmer className="ml-1.5 h-3.5 w-64" />
            <Shimmer className="ml-auto h-8 w-28" />
          </div>
          <div className="overflow-hidden rounded-xl border bg-card px-1.5 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="w-2 py-2" aria-hidden />
                  <th className="px-2 py-2 font-medium">{t('history.col.championship')}</th>
                  <th className="px-2 py-2 font-medium">{t('history.col.edition')}</th>
                  <th className="px-2 py-2" aria-hidden />
                  <th className="px-2 py-2 font-medium">{t('history.col.rounds')}</th>
                  <th className="px-2 py-2 font-medium">{t('history.col.champion')}</th>
                  <th className="px-2 py-2 text-right font-medium">{t('history.col.you')}</th>
                  <th className="px-2 py-2 text-right font-medium">{t('history.col.points')}</th>
                  <th className="w-6" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {slots(rows).map((at) => (
                  <tr key={at} className="border-b last:border-b-0">
                    <td className="py-2 pr-0 pl-1"><Shimmer className="h-7 w-1 rounded-full" /></td>
                    <td className="px-2 py-2"><Shimmer className="h-3.5 w-44" /></td>
                    <td className="px-2 py-2"><Shimmer className="h-5.5 w-12" /></td>
                    <td className="px-2 py-2"><Shimmer className="h-5.5 w-36" /></td>
                    <td className="px-2 py-2"><Shimmer className="h-3.5 w-12" /></td>
                    <td className="px-2 py-2"><Shimmer className="h-3.5 w-28" /></td>
                    <td className="px-2 py-2"><Shimmer className="ml-auto h-6 w-9" /></td>
                    <td className="px-2 py-2"><Shimmer className="ml-auto h-3.5 w-8" /></td>
                    <td aria-hidden />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </Loading>
  );
};
