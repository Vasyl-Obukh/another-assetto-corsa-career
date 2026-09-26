import { useTranslation } from 'react-i18next';

import { PLAYER_ROW } from './constants.ts';
import { Movement } from './Movement.tsx';
import { ResultCell } from './ResultCell.tsx';
import type { Championship } from '../../../../shared/types';
import { NationFlag } from '../NationFlag.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import type { ClassSeason } from '@/lib/season-results';
import { teamNation } from '@/lib/season-results';
import { cn } from '@/lib/utils.ts';

interface TeamStandingsTableProps {
  /**
   * The class's tables.
   */
  season: ClassSeason;
  /**
   * The championship, for the teams' flags.
   */
  series: Championship;
}

/**
 * A class's team standings: every car a team fields in the class counted
 * together, the player's own team marked.
 */
export const TeamStandingsTable = ({ season, series }: TeamStandingsTableProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const leader = season.teams[0]?.points ?? 0;
  const dash = <span className="text-muted-foreground">{t('standings.none')}</span>;

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left text-xs text-muted-foreground">
          <th className="w-10 py-2 pr-2 pl-3 font-normal">{t('standings.column.position')}</th>
          <th className="w-8 py-2 font-normal" aria-hidden />
          <th className="py-2 pr-3 font-normal">{t('standings.column.team')}</th>
          <th className="py-2 pr-3 text-right font-normal">{t('standings.column.wins')}</th>
          <th className="py-2 pr-3 text-right font-normal">{t('standings.column.gap')}</th>
          <th className="py-2 pr-3 text-right font-normal">{t('standings.column.points')}</th>
        </tr>
      </thead>
      <tbody>
        {season.teams.map((row) => (
          <tr key={row.team} className={cn('border-t first:border-t-0', row.player && PLAYER_ROW)}>
            <td className="py-1.5 pr-2 pl-3"><ResultCell position={row.position} scored={row.points > 0} /></td>
            <td className="py-1.5"><Movement move={row.move} /></td>
            <td className="py-1.5 pr-3">
              <span className="flex items-center gap-2">
                <NationFlag code={teamNation(series, row.team)} className="h-3 w-4.5" />
                <span data-selectable>{row.name}</span>
                {row.player ? <Badge className="h-4 px-1 text-[0.6rem]">{t('standings.yours')}</Badge> : null}
              </span>
            </td>
            <td className="py-1.5 pr-3 text-right tabular-nums">{row.wins ? formatNumber(row.wins) : dash}</td>
            <td className="py-1.5 pr-3 text-right text-muted-foreground tabular-nums">
              {row.position === 1 ? null : t('standings.behind', { points: formatNumber(leader - row.points) })}
            </td>
            <td className="py-1.5 pr-3 text-right font-semibold tabular-nums">{formatNumber(row.points)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
