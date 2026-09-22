import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { STANDINGS_PREVIEW } from './constants.ts';
import type { DriverStanding, TeamStanding } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PODIUM_ACCENT } from '@/lib/accents';

/**
 * One row of either table, which is all this renders.
 */
interface StandingsRow {
  /**
   * What identifies the row, for React.
   */
  key: string;
  /**
   * Where it stands.
   */
  position: number;
  /**
   * Who or what it is.
   */
  name: string;
  /**
   * What sits under the name, or null when nothing does.
   */
  detail: string | null;
  /**
   * Points scored.
   */
  points: number;
}

interface StandingsTableProps {
  /**
   * The rows, best placed first.
   */
  rows: readonly StandingsRow[];
  /**
   * Which seat the player holds, so their row can be marked.
   */
  playerKey?: string;
}

export const StandingsTable = ({ rows, playerKey }: StandingsTableProps) => {
  const { t } = useTranslation();
  const [all, setAll] = useState(false);

  const shown = all ? rows : rows.slice(0, STANDINGS_PREVIEW);

  return (
    <div className="flex flex-col gap-1">
      {shown.map((row) => (
        <div
          key={row.key}
          className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${
            row.key === playerKey ? 'bg-accent' : ''
          }`}
        >
          {/* A podium place wears its metal; everything below keeps the plain
              chip, which is what the accent map's three-long list is for. */}
          <Badge variant="outline" className={`w-8 justify-center ${PODIUM_ACCENT[row.position - 1] ?? ''}`}>
            {row.position}
          </Badge>
          <span className="min-w-0 flex-1 truncate">{row.name}</span>
          {row.detail ? (
            <span className="hidden min-w-0 flex-1 truncate text-muted-foreground sm:block">
              {row.detail}
            </span>
          ) : null}
          <span className="w-12 text-right tabular-nums">{row.points}</span>
        </div>
      ))}

      {rows.length > STANDINGS_PREVIEW ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(!all)}>
          {t(all ? 'calendar.standings.showLess' : 'calendar.standings.showAll')}
        </Button>
      ) : null}
    </div>
  );
};

/**
 * Reads a driver table into rows.
 * @param drivers The standings
 * @param playerSeat The seat the player holds, when one of these is theirs
 * @param playerName What to call them instead of the name the document gave
 * that seat
 * @returns The rows
 */
export const driverRows = (
  drivers: readonly DriverStanding[],
  playerSeat?: string,
  playerName?: string,
): StandingsRow[] => drivers.map((driver) => ({
  key: driver.seat,
  position: driver.position,
  name: driver.seat === playerSeat && playerName ? playerName : driver.driver,
  detail: driver.team,
  points: driver.points,
}));

/**
 * Reads a team table into rows.
 * @param teams The standings
 * @returns The rows
 */
export const teamRows = (teams: readonly TeamStanding[]): StandingsRow[] => teams.map((team) => ({
  key: team.team,
  position: team.position,
  name: team.name,
  detail: null,
  points: team.points,
}));
