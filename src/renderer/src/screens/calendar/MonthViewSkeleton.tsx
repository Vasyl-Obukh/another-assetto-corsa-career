import {
  DAY_PANEL_QUERY, DAY_SKELETON_CARDS, MONTH_SKELETON_LINES, MONTH_SKELETON_WEEKS, WEEKDAY_REFERENCE,
} from './constants.ts';
import { EventCardSkeleton } from './EventCardSkeleton.tsx';
import { monthGrid } from './utils.ts';
import { DAYS_PER_WEEK } from '../../../../shared/constants';
import { Loading, Shimmer } from '@/components';
import { useMediaQuery } from '@/hooks';
import { useFormat } from '@/i18n';
import { slots } from '@/lib/slots.ts';

interface MonthViewSkeletonProps {
  /**
   * How tall the view is drawn, in pixels - the same height the loaded month
   * takes, so the page does not move when it arrives.
   */
  height: number;
}

/**
 * The month grid while the calendar is read: six weeks under the real weekday
 * row, lines where events race, and the day's list beside it where the
 * window has room for one.
 */
export const MonthViewSkeleton = ({ height }: MonthViewSkeletonProps) => {
  const { formatWeekday } = useFormat();
  const beside = useMediaQuery(DAY_PANEL_QUERY);
  const week = monthGrid(WEEKDAY_REFERENCE).slice(0, DAYS_PER_WEEK);

  return (
    <Loading>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]" style={{ height }}>
        <div
          className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border"
          style={{ gridTemplateRows: `auto repeat(${MONTH_SKELETON_WEEKS}, minmax(0, 1fr))` }}
        >
          {week.map((day) => (
            <span
              key={day}
              className="bg-card px-2 py-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {formatWeekday(day)}
            </span>
          ))}

          {slots(MONTH_SKELETON_WEEKS * DAYS_PER_WEEK).map((at) => (
            <div key={at} className="flex min-h-0 flex-col gap-1 overflow-hidden bg-card p-1.5">
              <Shimmer className="mx-1 mt-0.5 mb-1 h-3 w-4" />
              {slots(MONTH_SKELETON_LINES[at % DAYS_PER_WEEK]).map((line) => (
                <Shimmer key={line} className="h-4.5 w-11/12 rounded" />
              ))}
            </div>
          ))}
        </div>

        {beside ? (
          <aside className="flex min-h-0 flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <Shimmer className="my-0.5 h-4 w-28" />
                <Shimmer className="h-3 w-14" />
              </div>
              <Shimmer className="h-8 w-44" />
            </div>
            {slots(DAY_SKELETON_CARDS).map((at) => <EventCardSkeleton key={at} />)}
          </aside>
        ) : null}
      </div>
    </Loading>
  );
};
