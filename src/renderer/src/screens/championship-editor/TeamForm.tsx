import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TEAM_BUDGET_LABEL, TEAM_BUDGETS } from './constants.ts';
import { NationFields } from './NationFields.tsx';
import { RowForm } from './RowForm.tsx';
import type { Team, TeamBudget } from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { Field, NOT_SET } from '@/screens/race';

interface TeamFormProps {
  /**
   * The team as it stands, which seeds the draft. Read once, on mount.
   */
  team: Team;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the team to commit.
   * @param next The team as edited
   */
  onConfirm: (next: Team) => void;
  /**
   * Called to leave the row as it was.
   */
  onCancel: () => void;
}

export const TeamForm = ({
  team, locked, onConfirm, onCancel,
}: TeamFormProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(team);
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `team-${team.id}`;

  return (
    <RowForm
      // Name, budget, nationality and code - short enough to be one line.
      columns={4}
      locked={locked}
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
    >
      <Field id={`${idPrefix}-name`} label={t('editor.teams.name')}>
        <Input
          id={`${idPrefix}-name`}
          ref={name}
          value={draft.name}
          disabled={locked}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Field>

      <Field id={`${idPrefix}-budget`} label={t('editor.teams.budgetLabel')}>
        <Select
          value={draft.budget ?? NOT_SET}
          disabled={locked}
          onValueChange={(value) => setDraft({
            ...draft,
            budget: value === NOT_SET ? undefined : (value as TeamBudget),
          })}
        >
          <SelectTrigger id={`${idPrefix}-budget`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NOT_SET}>{t('editor.teams.budget.unsaid')}</SelectItem>
            {TEAM_BUDGETS.map((budget) => (
              <SelectItem key={budget} value={budget}>
                {t(TEAM_BUDGET_LABEL[budget])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <NationFields
        idPrefix={idPrefix}
        nation={draft}
        locked={locked}
        onChange={(nation) => setDraft({ ...draft, ...nation })}
      />
    </RowForm>
  );
};
