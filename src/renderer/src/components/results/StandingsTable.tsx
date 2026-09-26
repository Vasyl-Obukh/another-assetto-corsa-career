import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { PLAYER_ROW } from './constants.ts';
import { DriverName } from './DriverName.tsx';
import { Movement } from './Movement.tsx';
import { ResultCell } from './ResultCell.tsx';
import { compactRows } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import type { ClassSeason } from '@/lib/season-results';
import { seatNation, teamName } from '@/lib/season-results';
import { cn } from '@/lib/utils.ts';

interface StandingsTableProps {
  /**
   * The class's tables.
   */
  season: ClassSeason;
  /**
   * The championship, for flags and team names.
   */
  series: Championship;
  /**
   * What the player is called, over the name the championship gave their seat.
   */
  playerName: string;
  /**
   * The short form a sidebar shows: the top of the table and the player with
   * whoever is either side of them, positions, movement and points alone.
   */
  compact?: boolean;
}

/**
 * How many races the full table's form guide shows.
 */
const FORM_RACES = 5;

/**
 * A class's driver standings. The full table carries movement, team, the last
 * few races, wins, podiums, what the bonuses paid where the championship pays
 * any, and the gap to the leader; the compact one is what a sidebar has room for.
 */
export const StandingsTable = ({
  season, series, playerName, compact = false,
}: StandingsTableProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const leader = season.drivers[0]?.points ?? 0;
  // A column for a bonus only where the championship pays one, so a table
  // never carries a column of dashes for a rule it does not have.
  const qualifying = series.pointsSystems.some((system) => (system.qualifying ?? []).some((one) => one > 0));
  const fastest = series.pointsSystems.some((system) => (system.fastestLap ?? 0) > 0);
  const rows = compact ? compactRows(season.drivers) : season.drivers.map((row) => ({ row, gap: false }));
  const columns = compact ? 4 : 8 + Number(qualifying) + Number(fastest);
  const dash = <span className="text-muted-foreground">{t('standings.none')}</span>;

  return (
    <table className="w-full border-collapse text-sm">
      {compact ? null : (
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="w-10 py-2 pr-2 pl-3 font-normal">{t('standings.column.position')}</th>
            <th className="w-8 py-2 font-normal" aria-hidden />
            <th className="py-2 pr-3 font-normal">{t('standings.column.driver')}</th>
            <th className="py-2 pr-3 font-normal">{t('standings.column.form', { count: FORM_RACES })}</th>
            <th className="py-2 pr-3 text-right font-normal">{t('standings.column.wins')}</th>
            <th className="py-2 pr-3 text-right font-normal">{t('standings.column.podiums')}</th>
            {qualifying ? <th className="py-2 pr-3 text-right font-normal">{t('standings.column.qualifying')}</th> : null}
            {fastest ? <th className="py-2 pr-3 text-right font-normal">{t('standings.column.fastestLap')}</th> : null}
            <th className="py-2 pr-3 text-right font-normal">{t('standings.column.gap')}</th>
            <th className="py-2 pr-3 text-right font-normal">{t('standings.column.points')}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map(({ row, gap }) => (
          <Fragment key={row.key}>
            {gap ? (
              <tr aria-hidden>
                <td colSpan={columns} className="py-0.5 text-center text-xs text-muted-foreground">
                  {t('standings.skipped')}
                </td>
              </tr>
            ) : null}
            <tr
              className={cn(
                'border-t first:border-t-0',
                row.player && PLAYER_ROW,
              )}
            >
              <td className="py-1.5 pr-2 pl-3">
                <ResultCell position={row.position} scored={row.points > 0} />
              </td>
              <td className="py-1.5"><Movement move={row.move} /></td>
              <td className="w-full max-w-0 py-1.5 pr-3">
                <DriverName
                  name={row.player ? playerName : row.driver}
                  nation={seatNation(series, row.seat)}
                  detail={compact ? null : teamName(series, row.team)}
                  player={row.player}
                  substitute={row.substitute && !compact}
                />
              </td>
              {compact ? null : (
                <>
                  <td className="py-1.5 pr-3">
                    <span className="flex gap-0.5">
                      {row.places.filter((place) => !place.bonusOnly).slice(-FORM_RACES).map((place, at) => (
                        <ResultCell
                          // eslint-disable-next-line react/no-array-index-key -- one per race, in the order they ran
                          key={at}
                          size="sm"
                          position={place.classPosition}
                          scored={place.finishPoints > 0}
                          pole={place.qualifyingPosition === 1}
                          fastestLap={place.fastestLap}
                        />
                      ))}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{row.wins ? formatNumber(row.wins) : dash}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">
                    {row.podiums ? formatNumber(row.podiums) : dash}
                  </td>
                  {qualifying ? (
                    <td className="py-1.5 pr-3 text-right font-semibold text-session-qualify-foreground tabular-nums">
                      {row.qualifyingPoints
                        ? t('standings.bonus.plus', { points: formatNumber(row.qualifyingPoints) })
                        : dash}
                    </td>
                  ) : null}
                  {fastest ? (
                    <td className="py-1.5 pr-3 text-right font-semibold text-primary tabular-nums">
                      {row.fastestLapPoints
                        ? t('standings.bonus.plus', { points: formatNumber(row.fastestLapPoints) })
                        : dash}
                    </td>
                  ) : null}
                  <td className="py-1.5 pr-3 text-right text-muted-foreground tabular-nums">
                    {row.position === 1 ? null : t('standings.behind', { points: formatNumber(leader - row.points) })}
                  </td>
                </>
              )}
              <td className="py-1.5 pr-3 text-right font-semibold tabular-nums">{formatNumber(row.points)}</td>
            </tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};
