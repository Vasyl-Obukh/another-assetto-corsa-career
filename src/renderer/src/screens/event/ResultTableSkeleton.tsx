import { useTranslation } from 'react-i18next';

import {
  ClassificationTableSkeleton, Loading, PodiumSkeleton, ResultStrip, Shimmer,
} from '@/components';

interface ResultTableSkeletonProps {
  /**
   * Whether to hold the player's strip open: a session they drove always has
   * one, but before its archive is read there is no order to place them in.
   */
  strip: boolean;
  /**
   * Whether the session is a race, which stands a podium over the table.
   */
  race: boolean;
  /**
   * How many rows to stand in for.
   */
  rows: number;
  /**
   * Whether the session pays points.
   */
  points: boolean;
  /**
   * Whether several classes raced it.
   */
  classes: boolean;
}

/**
 * A driven session's result while its archive is read: the player's strip, a
 * race's podium, and the bordered classification under it with a row per car.
 */
export const ResultTableSkeleton = ({
  strip, race, rows, points, classes,
}: ResultTableSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Loading className="flex flex-col gap-4">
      {strip ? (
        <ResultStrip
          figures={[{
            label: t('event.result.you'),
            value: <Shimmer className="h-7.5 w-10 rounded-md" />,
            detail: <Shimmer className="h-3 w-10" />,
          }]}
        />
      ) : null}
      {race ? <PodiumSkeleton /> : null}
      <div className="overflow-hidden rounded-xl border">
        <ClassificationTableSkeleton rows={rows} race={race} points={points} footnote classes={classes} />
      </div>
    </Loading>
  );
};
