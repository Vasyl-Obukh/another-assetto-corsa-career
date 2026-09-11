import { useTranslation } from 'react-i18next';

import { SEAT_COLUMNS } from './constants.ts';
import type { Seat, Team } from '../../../../shared/types';

interface SeatListProps {
  /**
   * The seats on the grid, in the order the championship lists them.
   */
  seats: readonly Seat[];
  /**
   * Every team the championship fields, for naming the one in each seat.
   */
  teams: readonly Team[];
}

export const SeatList = ({ seats, teams }: SeatListProps) => {
  const { t } = useTranslation();
  const named = new Map(teams.map((team) => [team.id, team]));

  return (
    <ol className={SEAT_COLUMNS}>
      {seats.map((seat, index) => (
        <li key={seat.id} className="flex items-baseline gap-3 break-inside-avoid py-0.5">
          <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
            {index + 1}
          </span>
          <span className="min-w-0 truncate">
            {seat.driver?.name ?? t('championships.entries.seatUnnamed')}
          </span>
          {seat.driver?.nationCode ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {seat.driver.nationCode}
            </span>
          ) : null}
          {/* Pushed right rather than given a column, so a seat with no team
              leaves no hole in the middle of the row. */}
          <span className="ml-auto min-w-0 truncate text-xs text-muted-foreground">
            {named.get(seat.team ?? '')?.name ?? ''}
          </span>
        </li>
      ))}
    </ol>
  );
};
