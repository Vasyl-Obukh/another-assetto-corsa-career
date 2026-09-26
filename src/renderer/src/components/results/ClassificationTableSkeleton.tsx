import { useTranslation } from 'react-i18next';

import { Shimmer } from '../Shimmer.tsx';
import { slots } from '@/lib/slots.ts';

interface ClassificationTableSkeletonProps {
  /**
   * How many rows to stand in for.
   */
  rows: number;
  /**
   * Whether it is a race, which adds the places gained and words the gap as a
   * time.
   */
  race: boolean;
  /**
   * Whether the session pays points, which adds their column.
   */
  points: boolean;
  /**
   * Whether the table carries a footnote under it.
   */
  footnote: boolean;
  /**
   * Whether several classes raced, which adds each row's class.
   */
  classes?: boolean;
}

/**
 * A ClassificationTable while its session is read: the columns nearly every
 * session has - a driver over their team, the car, laps, best lap and gap - and
 * rows of their height, so nothing moves when the classification lands.
 */
export const ClassificationTableSkeleton = ({
  rows, race, points, footnote, classes = false,
}: ClassificationTableSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-2xl border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="w-11 py-2 pr-2 pl-3 font-normal">{t('standings.column.position')}</th>
              {race ? (
                <th className="w-9 py-2 font-normal">
                  <span className="sr-only">{t('results.column.gained')}</span>
                </th>
              ) : null}
              <th className="py-2 pr-3 font-normal">{t('standings.column.driver')}</th>
              {classes ? <th className="py-2 pr-3 font-normal">{t('results.column.class')}</th> : null}
              <th className="py-2 pr-3 font-normal">{t('results.column.car')}</th>
              <th className="py-2 pr-3 text-right font-normal">{t('results.column.laps')}</th>
              <th className="py-2 pr-3 text-right font-normal">{t('results.column.best')}</th>
              <th className="py-2 pr-3 text-right font-normal">
                {t(race ? 'results.column.timeGap' : 'results.column.gap')}
              </th>
              {points ? (
                <th className="py-2 pr-3 text-right font-normal">{t('standings.column.points')}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {slots(rows).map((row) => (
              <tr key={row} className="border-t">
                <td className="py-1.5 pr-2 pl-3">
                  <Shimmer className="h-6 w-7.5 rounded-md" />
                </td>
                {race ? (
                  <td className="py-1.5">
                    <Shimmer className="h-3 w-5" />
                  </td>
                ) : null}
                <td className="min-w-48 py-1.5 pr-3">
                  {/* DriverName's two tight lines, each shimmer set inside a
                      line box of its text so the row keeps its height. */}
                  <span className="flex min-w-0 items-center gap-2">
                    <Shimmer className="h-3 w-4.5 rounded-sm" />
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span><Shimmer className="inline-block h-3.5 w-32 align-middle" /></span>
                      <span className="text-xs"><Shimmer className="inline-block h-3 w-20 align-middle" /></span>
                    </span>
                  </span>
                </td>
                {classes ? (
                  <td className="py-1.5 pr-3">
                    <span className="flex items-center gap-1.5">
                      <Shimmer className="h-5.5 w-16 rounded-md" />
                      <Shimmer className="h-3 w-3" />
                    </span>
                  </td>
                ) : null}
                <td className="py-1.5 pr-3">
                  <span className="flex items-center gap-2">
                    <Shimmer deep className="size-4.5 rounded" />
                    <Shimmer className="h-3.5 w-28" />
                  </span>
                </td>
                <td className="py-1.5 pr-3">
                  <Shimmer className="ml-auto h-3.5 w-5" />
                </td>
                <td className="py-1.5 pr-3">
                  <Shimmer className="ml-auto h-3.5 w-16" />
                </td>
                <td className="py-1.5 pr-3">
                  <Shimmer className="ml-auto h-3.5 w-14" />
                </td>
                {points ? (
                  <td className="py-1.5 pr-3">
                    <Shimmer className="ml-auto h-3.5 w-5" />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote ? (
        <div className="flex items-center gap-2 border-t px-4 py-2.5 text-xs">
          <Shimmer className="size-3.5 rounded-full" />
          <Shimmer className="my-0.5 h-3 w-72" />
        </div>
      ) : null}
    </div>
  );
};
