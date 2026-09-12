import { useTranslation } from 'react-i18next';

import { TEAM_BUDGET_ACCENT, TEAM_BUDGET_LABEL } from './constants.ts';
import { ListRow } from './ListRow.tsx';
import type { Team } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowDrag } from '@/hooks';
import { cn } from '@/lib/utils.ts';

interface TeamRowProps {
  /**
   * The team the row stands for.
   */
  team: Team;
  /**
   * Where it sits in the list, counting from zero.
   */
  index: number;
  /**
   * How many teams there are, which is what disables the last Move later.
   */
  count: number;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be opened, which it may not while another already is.
   */
  editable: boolean;
  /**
   * The list's drag state.
   */
  drag: RowDrag;
  /**
   * Called to open the team's form.
   */
  onEdit: () => void;
  /**
   * Called to move the team along the list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the team from the championship.
   */
  onRemove: () => void;
}

/**
 * One team, read-only.
 *
 * A team is identified by its name and read by its budget; the rest is behind
 * its form.
 */
export const TeamRow = ({
  team, index, count, locked, editable, drag, onEdit, onMove, onRemove,
}: TeamRowProps) => {
  const { t } = useTranslation();

  return (
    <ListRow
      index={index}
      number={index + 1}
      name={team.name}
      label={team.name}
      first={index === 0}
      last={index === count - 1}
      locked={locked}
      editable={editable}
      drag={drag}
      onEdit={onEdit}
      onMove={onMove}
      onRemove={onRemove}
    >
      {team.budget === undefined ? null : (
        <Badge className={cn('shrink-0', TEAM_BUDGET_ACCENT[team.budget])}>
          {t(TEAM_BUDGET_LABEL[team.budget])}
        </Badge>
      )}

      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
        {team.nationCode ?? ''}
      </span>
    </ListRow>
  );
};
