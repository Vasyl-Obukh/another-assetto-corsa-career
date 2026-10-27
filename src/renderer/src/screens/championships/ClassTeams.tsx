import { useTranslation } from 'react-i18next';

import type { TeamGroup } from './types.ts';
import { BudgetBadge } from '@/components';

interface ClassTeamsProps {
  /**
   * The teams to list, each with its seats in the class.
   */
  groups: readonly TeamGroup[];
  /**
   * The seat the player took, when a career raced this class.
   */
  playerSeat?: string;
  /**
   * What the player is called in the list.
   */
  playerName: string;
}

// The entry list as a paddock reads it: a team, how well funded it is, and who
// drives for it, one team to a line.
export const ClassTeams = ({ groups, playerSeat, playerName }: ClassTeamsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {groups.map(({ team, seats }) => (
        <div key={team?.id ?? ''} className="flex flex-col gap-0.5 border-t py-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-medium">{team?.name ?? t('championships.detail.noTeam')}</span>
            {team?.budget ? <BudgetBadge budget={team.budget} /> : null}
          </div>
          <span className="text-xs text-muted-foreground">
            {seats.map((seat, index) => (
              <span key={seat.id}>
                {index > 0 ? ', ' : null}
                {seat.id === playerSeat ? (
                  <span className="font-semibold text-primary">{playerName}</span>
                ) : seat.driver?.name ?? t('championships.entries.seatUnnamed')}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};
