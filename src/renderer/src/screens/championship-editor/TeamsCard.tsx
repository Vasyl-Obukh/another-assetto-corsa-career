import { AddButton } from './AddButton.tsx';
import { ROW_SCOPE } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { TeamDialog } from './TeamDialog.tsx';
import { TeamTile } from './TeamTile.tsx';
import {
  nationsIn, nextTeam, withoutTeam, withTeam,
} from './utils.ts';
import type { Championship } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';
import { useRowDrag } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { moveAt, moveTo } from '@/screens/race';

interface TeamsCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Which row of the editor has its form open. Shared with every other list, so
   * that opening one row quietens the rest of the screen.
   */
  rows: RowEditState;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole championship whenever the teams change.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

/**
 * The teams as tiles, several to a line: a team is a name and a budget, and a
 * row across the whole window for each left most of every row empty. A tile
 * opens the team's dialog.
 */
export const TeamsCard = ({
  series, rows, locked, onChange,
}: TeamsCardProps) => {
  const { t } = useKindTranslation();
  const teams = series.teams ?? [];
  const adding = rows.adding(ROW_SCOPE.TEAMS);
  const several = series.entries.length > 1;

  const drag = useRowDrag({
    count: teams.length,
    // Reordering under a visible form moves the tiles the user is reading.
    locked: locked || !rows.editable,
    onMove: (from, to) => onChange({ ...series, teams: moveTo([...teams], from, to) }),
  });

  /**
   * Says what one team fields across the championship.
   * @param team The team's id
   * @returns How many seats, and in which classes when there is more than one
   */
  const fieldsOf = (team: string): string => {
    const classes = series.entries.filter((entry) => entry.seats.some((seat) => seat.team === team));
    const count = classes.reduce((total, entry) => total + entry.seats.filter((seat) => seat.team === team).length, 0);
    if (count === 0) return t('editor.teams.noSeats');

    return several
      ? t('editor.teams.seatsIn', { count, classes: classes.map((entry) => entry.name).join(', ') })
      : t('editor.teams.seats', { count });
  };

  const editing = teams.find((team) => rows.editing(ROW_SCOPE.TEAMS, team.id));

  return (
    <EditorSection
      title={t('editor.teams.title')}
      hint={t('editor.teams.hintShort')}
      summary={t('editor.teams.count', { count: teams.length })}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2">
        {teams.map((team, index) => (
          <TeamTile
            key={team.id}
            team={team}
            index={index}
            count={teams.length}
            fields={fieldsOf(team.id)}
            locked={locked}
            editable={rows.editable}
            drag={drag}
            onEdit={() => rows.edit(ROW_SCOPE.TEAMS, team.id)}
            onMove={(by) => onChange({ ...series, teams: moveAt([...teams], index, by) })}
            onRemove={() => onChange(withoutTeam(series, team.id))}
          />
        ))}

        <AddButton
          label={t('editor.teams.add')}
          className="min-h-16"
          disabled={locked || !rows.editable}
          onClick={() => rows.add(ROW_SCOPE.TEAMS)}
        />
      </div>

      {/* Mounted only while open, so each seeds its draft afresh. */}
      {editing === undefined ? null : (
        <TeamDialog
          team={editing}
          adding={false}
          fields={fieldsOf(editing.id)}
          used={nationsIn(series)}
          locked={locked}
          onConfirm={(next) => { onChange(withTeam(series, editing.id, next)); rows.close(); }}
          onCancel={rows.close}
        />
      )}

      {adding ? (
        <TeamDialog
          // Minted at render: nextTeam is pure and the dialog seeds once.
          team={nextTeam(series)}
          adding
          fields=""
          used={nationsIn(series)}
          locked={locked}
          onConfirm={(next) => { onChange({ ...series, teams: [...teams, next] }); rows.close(); }}
          onCancel={rows.close}
        />
      ) : null}
    </EditorSection>
  );
};
