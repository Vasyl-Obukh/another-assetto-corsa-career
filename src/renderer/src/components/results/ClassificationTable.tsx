import { TimerIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BonusPoints } from './BonusPoints.tsx';
import { PLAYER_ROW } from './constants.ts';
import { DriverName } from './DriverName.tsx';
import { Movement } from './Movement.tsx';
import { ResultCell } from './ResultCell.tsx';
import { formatGap, formatLapTime } from '../../../../shared/utils/lap-time';
import { CarSwatch } from '../content-image/index.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { classAccent } from '@/lib/accents';
import type { ClassifiedRow } from '@/lib/classification';
import { cn } from '@/lib/utils.ts';

interface ClassificationTableProps {
  /**
   * The rows, in finishing order.
   */
  rows: readonly ClassifiedRow[];
  /**
   * Whether the session was a race, which measures the gap on race time and
   * shows the winner's.
   */
  race: boolean;
  /**
   * What the player is called, over whatever name the session carries for them.
   */
  playerName: string;
  /**
   * A line under the table saying where the order came from.
   */
  footnote?: ReactNode;
  /**
   * The race's classes, in their own order, which picks each one's colour. A
   * class column shows when the rows hold more than one of them.
   */
  classes?: readonly { id: string; name: string }[];
}

/**
 * One session's classification. Every column the session has nothing for is
 * left out, so a quick race has no points, and a simulated session no laps.
 */
export const ClassificationTable = ({
  rows, race, playerName, footnote, classes = [],
}: ClassificationTableProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const carName = useCarNames([...new Set(rows.flatMap((row) => (row.car ? [row.car.model] : [])))]);

  const has = {
    started: race && rows.some((row) => row.started !== null),
    car: rows.some((row) => row.car !== null),
    laps: rows.some((row) => row.laps !== null),
    best: rows.some((row) => row.bestLap !== null),
    gap: rows.some((row) => row.gap !== null || row.total !== null),
    cuts: rows.some((row) => (row.cuts ?? 0) > 0),
    // A race event of the player's own pays nothing, so a place alone is no
    // reason for the column.
    points: rows.some((row) => (row.place?.points ?? 0) > 0),
    classes: new Set(rows.map((row) => row.entry)).size > 1,
  };
  const slotOf = new Map(classes.map((one, at) => [one.id, at]));

  /**
   * How far a row finished behind the front, in words.
   * @param row The row
   * @returns The gap, the winner's time, or nothing
   */
  const gapOf = (row: ClassifiedRow): ReactNode => {
    if (row.total !== null) return formatLapTime(row.total);
    if (!row.gap) return null;
    if ('laps' in row.gap) {
      // Amber: a lapped car is a fact worth noticing, and not an error.
      return (
        <span className="text-warning-foreground dark:text-warning">
          {t('results.lapped', { count: row.gap.laps })}
        </span>
      );
    }

    return t('results.gap', { time: formatGap(row.gap.ms) });
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-2xl border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="w-11 py-2 pr-2 pl-3 font-normal">{t('standings.column.position')}</th>
              {has.started ? (
                <th className="w-9 py-2 font-normal">
                  <span className="sr-only">{t('results.column.gained')}</span>
                </th>
              ) : null}
              <th className="py-2 pr-3 font-normal">{t('standings.column.driver')}</th>
              {has.classes ? <th className="py-2 pr-3 font-normal">{t('results.column.class')}</th> : null}
              {has.car ? <th className="py-2 pr-3 font-normal">{t('results.column.car')}</th> : null}
              {has.laps ? <th className="py-2 pr-3 text-right font-normal">{t('results.column.laps')}</th> : null}
              {has.best ? <th className="py-2 pr-3 text-right font-normal">{t('results.column.best')}</th> : null}
              {has.gap ? (
                <th className="py-2 pr-3 text-right font-normal">
                  {t(race ? 'results.column.timeGap' : 'results.column.gap')}
                </th>
              ) : null}
              {has.cuts ? <th className="py-2 pr-3 text-right font-normal">{t('results.column.cuts')}</th> : null}
              {has.points ? (
                <th className="py-2 pr-3 text-right font-normal">{t('standings.column.points')}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={cn('border-t', row.player && PLAYER_ROW)}>
                <td className="py-1.5 pr-2 pl-3">
                  <ResultCell
                    position={row.position}
                    scored={row.place ? row.place.finishPoints > 0 : false}
                  />
                </td>
                {has.started ? (
                  <td className="py-1.5">
                    <Movement move={row.started === null ? null : row.started - row.position} />
                  </td>
                ) : null}
                <td className="min-w-48 py-1.5 pr-3">
                  <DriverName
                    name={row.player ? playerName : row.driver}
                    nation={row.nation}
                    detail={row.team}
                    player={row.player}
                  />
                </td>
                {has.classes ? (
                  <td className="py-1.5 pr-3 whitespace-nowrap">
                    {row.entry === null ? null : (
                      <span className="flex items-center gap-1.5">
                        <Badge className={classAccent(slotOf.get(row.entry) ?? 0).chip}>
                          {classes.find((one) => one.id === row.entry)?.name ?? row.entry}
                        </Badge>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {row.classPosition === null ? null : formatNumber(row.classPosition)}
                        </span>
                      </span>
                    )}
                  </td>
                ) : null}
                {has.car ? (
                  <td className="py-1.5 pr-3">
                    {row.car ? (
                      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <CarSwatch model={row.car.model} skin={row.car.skin} />
                        <span className="truncate" data-selectable>{carName(row.car.model)}</span>
                      </span>
                    ) : null}
                  </td>
                ) : null}
                {has.laps ? (
                  <td className="py-1.5 pr-3 text-right tabular-nums">
                    {row.laps === null ? null : formatNumber(row.laps)}
                  </td>
                ) : null}
                {has.best ? (
                  <td className="py-1.5 pr-3 text-right tabular-nums">
                    {/* Primary, the fastest lap's colour wherever it is marked. */}
                    {row.fastest && row.bestLap !== null ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        <TimerIcon className="size-3.5" />
                        {formatLapTime(row.bestLap)}
                      </span>
                    ) : formatLapTime(row.bestLap)}
                  </td>
                ) : null}
                {has.gap ? (
                  <td className="py-1.5 pr-3 text-right text-muted-foreground tabular-nums">{gapOf(row)}</td>
                ) : null}
                {has.cuts ? (
                  <td className="py-1.5 pr-3 text-right tabular-nums">
                    {/* Amber where a car cut the track, and nothing where it did not. */}
                    {row.cuts ? (
                      <span className="rounded-md bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning-foreground dark:text-warning">
                        {formatNumber(row.cuts)}
                      </span>
                    ) : <span className="text-muted-foreground">{t('standings.none')}</span>}
                  </td>
                ) : null}
                {has.points ? (
                  <td className="py-1.5 pr-3 text-right font-semibold tabular-nums">
                    {row.place && row.place.points > 0 ? (
                      <>
                        {formatNumber(row.place.finishPoints)}
                        <BonusPoints
                          qualifying={row.place.qualifyingPoints}
                          fastestLap={row.place.fastestLapPoints}
                        />
                      </>
                    ) : <span className="font-normal text-muted-foreground">{t('standings.none')}</span>}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote ? (
        <p className="flex items-center gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );
};
