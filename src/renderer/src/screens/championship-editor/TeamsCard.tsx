import { UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ROW_SCOPE } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { RowList } from './RowList.tsx';
import { TeamForm } from './TeamForm.tsx';
import { TeamRow } from './TeamRow.tsx';
import { nextTeam, withoutTeam, withTeam } from './utils.ts';
import type { Championship, Team } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';

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
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole championship whenever the teams change.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const TeamsCard = ({
  series, rows, locked, onChange,
}: TeamsCardProps) => {
  const { t } = useTranslation();
  const teams = series.teams ?? [];

  /**
   * Puts the teams back on the championship.
   * @param next The teams, in order
   */
  const apply = (next: readonly Team[]): void => onChange({ ...series, teams: next });

  return (
    <EditorSection
      icon={<UsersIcon />}
      title={t('editor.teams.title')}
      hint={t('editor.teams.hint')}
      summary={t('editor.teams.count', { count: teams.length })}
      className="flex flex-col gap-3"
    >
      <RowList
        items={teams}
        scope={ROW_SCOPE.TEAMS}
        rows={rows}
        locked={locked}
        idOf={(team) => team.id}
        empty={t('editor.teams.empty')}
        addLabel={t('editor.teams.add')}
        onReorder={apply}
        renderRow={(team, controls) => (
          <TeamRow {...controls} team={team} onRemove={() => onChange(withoutTeam(series, team.id))} />
        )}
        renderForm={(team) => (
          <TeamForm
            // Minted at render when adding: nextTeam is pure and the form seeds once.
            team={team ?? nextTeam(series)}
            locked={locked}
            onConfirm={(next) => {
              onChange(team ? withTeam(series, team.id, next) : { ...series, teams: [...teams, next] });
              rows.close();
            }}
            onCancel={rows.close}
          />
        )}
      />
    </EditorSection>
  );
};
