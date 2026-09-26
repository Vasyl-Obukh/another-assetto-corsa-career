import { useTranslation } from 'react-i18next';

import { COMPACT_AROUND, COMPACT_TOP } from './constants.ts';
import { Shimmer } from '../Shimmer.tsx';
import { slots } from '@/lib/slots.ts';

/**
 * One row at a compact StandingsTable's height: a place, room for the
 * movement, a driver's flag and name, and the points.
 * @param at The row's key
 * @returns The row
 */
const row = (at: number) => (
  <tr key={at} className="border-t first:border-t-0">
    <td className="py-1.5 pr-2 pl-3"><Shimmer className="h-6 w-7.5 rounded-md" /></td>
    <td className="py-1.5"><span className="inline-flex min-w-7"><Shimmer className="h-3 w-4" /></span></td>
    <td className="w-full max-w-0 py-1.5 pr-3">
      <span className="flex min-w-0 items-center gap-2 leading-tight">
        <Shimmer className="h-3 w-4.5 rounded-sm" />
        <span><Shimmer className="inline-block h-3.5 w-28 align-middle" /></span>
      </span>
    </td>
    <td className="py-1.5 pr-3"><Shimmer className="ml-auto h-3.5 w-6" /></td>
  </tr>
);

interface CompactStandingsSkeletonProps {
  /**
   * Whether the player has a row to show below the top, which a championship
   * they are not in never does.
   */
  withPlayer?: boolean;
}

/**
 * A compact StandingsTable while the season is read: the top of the table,
 * and - where the player is in it - the gap and the player with whoever is
 * either side of them.
 */
export const CompactStandingsSkeleton = ({ withPlayer = true }: CompactStandingsSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {slots(COMPACT_TOP).map(row)}
        {withPlayer ? (
          <>
            <tr aria-hidden>
              <td colSpan={4} className="py-0.5 text-center text-xs text-muted-foreground">
                {t('standings.skipped')}
              </td>
            </tr>
            {slots(COMPACT_AROUND).map((at) => row(COMPACT_TOP + at))}
          </>
        ) : null}
      </tbody>
    </table>
  );
};
