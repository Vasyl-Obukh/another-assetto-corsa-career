import { useTranslation } from 'react-i18next';

import { BonusPoints } from './BonusPoints.tsx';
import { ResultCell } from './ResultCell.tsx';
import type { StandingsView } from './types.ts';
import { useFormat } from '@/i18n';
import { resultAccent } from '@/lib/accents';
import type { RaceColumn } from '@/lib/season-results';
import { placeIn, teamPointsIn } from '@/lib/season-results';
import { cn } from '@/lib/utils.ts';

interface MatrixCellProps {
  /**
   * The race the cell is a column of.
   */
  race: RaceColumn;
  /**
   * The class the row is in.
   */
  entry: string;
  /**
   * The driver row's key, or the team's id when `team` is set.
   */
  row: string;
  /**
   * Whether the row is a team's, which shows what all its cars took.
   */
  team: boolean;
  /**
   * What a driver's cell says.
   */
  view: StandingsView;
}

/**
 * One cell of the season grid: what a driver took from a race - the points,
 * or where they finished - or what a team's cars took between them.
 */
export const MatrixCell = ({
  race, entry, row, team, view,
}: MatrixCellProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const nothing = <span className="text-muted-foreground">{t('standings.notRaced')}</span>;

  if (team) {
    const points = teamPointsIn(race.score, entry, row);

    return points ? formatNumber(points) : nothing;
  }

  const place = placeIn(race.score, entry, row);
  if (!place) return nothing;
  // Qualifying points earned for a race somebody else then drove: the points
  // alone, with no finish to show.
  if (place.bonusOnly) {
    return (
      <span className="inline-flex items-center text-xs">
        {nothing}
        <BonusPoints qualifying={place.qualifyingPoints} fastestLap={0} className="self-start" />
      </span>
    );
  }

  if (view === 'positions') {
    return (
      <ResultCell
        position={place.classPosition}
        scored={place.finishPoints > 0}
        pole={place.qualifyingPosition === 1}
        fastestLap={place.fastestLap}
      />
    );
  }

  if (place.points === 0) return nothing;

  return (
    <span
      className={cn(
        'inline-flex h-6 min-w-7.5 items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums',
        resultAccent(place.classPosition, place.finishPoints > 0),
      )}
    >
      {formatNumber(place.finishPoints)}
      <BonusPoints
        qualifying={place.qualifyingPoints}
        fastestLap={place.fastestLapPoints}
        className="self-start"
      />
    </span>
  );
};
