import { useTranslation } from 'react-i18next';

import { PLAYER_ROW } from './constants.ts';
import { DriverName } from './DriverName.tsx';
import { MatrixCell } from './MatrixCell.tsx';
import { MatrixLegend } from './MatrixLegend.tsx';
import { ResultCell } from './ResultCell.tsx';
import type { StandingsView } from './types.ts';
import type { Championship } from '../../../../shared/types';
import { NationFlag } from '../NationFlag.tsx';
import { useFormat } from '@/i18n';
import type { ClassSeason, RoundColumn } from '@/lib/season-results';
import { seatNation, teamNation } from '@/lib/season-results';
import { cn } from '@/lib/utils.ts';

interface StandingsMatrixProps {
  /**
   * The class's tables.
   */
  season: ClassSeason;
  /**
   * Every round of the season, in calendar order.
   */
  rounds: readonly RoundColumn[];
  /**
   * The championship, for flags and its bonus rules.
   */
  series: Championship;
  /**
   * Teams rather than drivers.
   */
  teams: boolean;
  /**
   * What a driver's cell says: the points the race paid, or where they finished.
   */
  view: StandingsView;
  /**
   * What the player is called, over the name the championship gave their seat.
   */
  playerName: string;
  /**
   * Called with a round's id when its heading is clicked. Left out, the
   * headings are only headings.
   * @param round The round, by its id
   */
  onOpenRound?: (round: string) => void;
}

/**
 * Pinned to the left while the grid scrolls, so a row is always someone's.
 */
const PIN_LEFT = 'sticky left-0 z-10 bg-card';

/**
 * The name column, pinned beside the position with a rule down its right.
 */
const PIN_NAME = 'sticky left-12 z-10 bg-card shadow-[1px_0_0_var(--color-border)]';

/**
 * Pinned to the right, so the total is always beside the row it adds up.
 */
const PIN_RIGHT = 'sticky right-0 z-10 bg-card shadow-[-1px_0_0_var(--color-border)]';

/**
 * A season as a grid: drivers or teams down, every race of every round across,
 * the total last. Rounds still to come are shaded columns, so the season's
 * length reads at a glance. The name and total columns stay put while a long
 * season scrolls sideways.
 */
export const StandingsMatrix = ({
  season, rounds, series, teams, view, playerName, onOpenRound,
}: StandingsMatrixProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const rows = teams
    ? season.teams.map((row) => ({
      key: row.team,
      position: row.position,
      points: row.points,
      player: row.player,
      name: (
        <span className="flex items-center gap-2">
          <NationFlag code={teamNation(series, row.team)} className="h-3 w-4.5" />
          <span className="truncate" data-selectable>{row.name}</span>
        </span>
      ),
    }))
    : season.drivers.map((row) => ({
      key: row.key,
      position: row.position,
      points: row.points,
      player: row.player,
      name: (
        <DriverName
          name={row.player ? playerName : row.driver}
          nation={seatNation(series, row.seat)}
          player={row.player}
          detail={row.substitute ? t('standings.substituteShort') : null}
        />
      ),
    }));

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto border-t">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className={cn(PIN_LEFT, 'w-12')} aria-hidden />
              <th className={PIN_NAME} aria-hidden />
              {rounds.map((column) => (
                <th
                  key={column.round.id}
                  colSpan={Math.max(1, column.races.length)}
                  className="border-l px-1 pt-2 font-normal"
                >
                  <button
                    type="button"
                    disabled={!onOpenRound}
                    title={column.round.name}
                    onClick={() => onOpenRound?.(column.round.id)}
                    className="mx-auto flex max-w-24 flex-col items-center rounded px-1 leading-tight enabled:hover:text-primary"
                  >
                    <span className="font-semibold text-foreground">
                      {t('standings.roundShort', { number: column.number })}
                    </span>
                    <span className="w-full truncate">{column.round.name}</span>
                  </button>
                </th>
              ))}
              <th className={PIN_RIGHT} aria-hidden />
            </tr>
            <tr className="text-xs text-muted-foreground">
              <th className={cn(PIN_LEFT, 'border-b')} aria-hidden />
              <th className={cn(PIN_NAME, 'border-b py-1.5 pr-3 text-left font-normal')}>
                {t(teams ? 'standings.column.team' : 'standings.column.driver')}
              </th>
              {rounds.flatMap((column) => (column.races.length === 0
                ? [<th key={column.round.id} className="border-b border-l" aria-hidden />]
                : column.races.map((race, at) => (
                  <th
                    key={`${column.round.id}-${race.launch}`}
                    className={cn('border-b px-0.5 py-1.5 font-normal', at === 0 && 'border-l')}
                  >
                    {column.races.length > 1 ? t('standings.raceShort', { number: at + 1 }) : t('standings.raceOnly')}
                  </th>
                ))))}
              <th className={cn(PIN_RIGHT, 'border-b px-3 py-1.5 text-right font-normal')}>
                {t('standings.column.points')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={cn(row.player && PLAYER_ROW)}>
                <td className={cn(PIN_LEFT, 'border-b py-1 pl-3')}>
                  <ResultCell position={row.position} scored={row.points > 0} />
                </td>
                <td className={cn(PIN_NAME, 'max-w-56 border-b py-1 pr-3')}>{row.name}</td>
                {rounds.flatMap((column) => (column.races.length === 0
                  ? [<td key={column.round.id} aria-hidden className="border-b border-l bg-muted/40" />]
                  : column.races.map((race, at) => (
                    <td
                      key={`${column.round.id}-${race.launch}`}
                      className={cn(
                        'border-b px-0.5 py-1 text-center',
                        at === 0 && 'border-l',
                        race.score === null && 'bg-muted/40',
                      )}
                    >
                      {race.score === null ? null : (
                        <MatrixCell race={race} entry={season.entry} row={row.key} team={teams} view={view} />
                      )}
                    </td>
                  ))))}
                <td className={cn(PIN_RIGHT, 'border-b px-3 py-1 text-right font-semibold tabular-nums')}>
                  {formatNumber(row.points)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MatrixLegend series={series} teams={teams} view={view} openable={onOpenRound !== undefined} />
    </div>
  );
};
