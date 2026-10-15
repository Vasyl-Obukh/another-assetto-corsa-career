import { useState } from 'react';


import { TEAM_BUDGETS } from './constants.ts';
import { EditorDialog } from './EditorDialog.tsx';
import { NationPicker } from './NationPicker.tsx';
import { RadioCard } from './RadioCard.tsx';
import type { Team, TeamBudget } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFocusOnMount } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { TEAM_BUDGET_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { TEAM_BUDGET_LABEL } from '@/screens/championships';
import { Field } from '@/screens/race';

interface TeamDialogProps {
  /**
   * The team as it stands, or the one being added.
   */
  team: Team;
  /**
   * Whether it is a new team, which changes what the dialog is headed with.
   */
  adding: boolean;
  /**
   * What the team fields, already translated, for the footer.
   */
  fields: string;
  /**
   * The nations the championship already uses, most used first, with how many
   * teams and seats use each.
   */
  used: readonly (readonly [string, number])[];
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the team as edited.
   * @param next The team
   */
  onConfirm: (next: Team) => void;
  /**
   * Called to close without keeping anything.
   */
  onCancel: () => void;
}

/**
 * A team's name, where it is from and how well funded it is - the budget as
 * cards that say what each level means, in its own colour.
 */
export const TeamDialog = ({
  team, adding, fields, used, locked, onConfirm, onCancel,
}: TeamDialogProps) => {
  const { t } = useKindTranslation();
  const [draft, setDraft] = useState(team);
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `team-${team.id}`;
  const budgets: readonly (TeamBudget | undefined)[] = [...TEAM_BUDGETS, undefined];

  return (
    <EditorDialog
      title={adding ? t('editor.teams.adding') : draft.name || t('editor.teams.unnamed')}
      description={t('editor.teams.formHint')}
      note={adding ? undefined : fields}
      confirmLabel={adding ? t('editor.teams.add') : t('editor.save')}
      locked={locked}
      className="sm:max-w-2xl"
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Field id={`${idPrefix}-name`} label={t('editor.teams.name')}>
          <Input
            id={`${idPrefix}-name`}
            ref={name}
            value={draft.name}
            disabled={locked}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </Field>
        <Field id={`${idPrefix}-nation`} label={t('editor.nation.nation')}>
          <NationPicker
            id={`${idPrefix}-nation`}
            value={draft.nationCode}
            used={used}
            disabled={locked}
            onChange={(nationCode) => setDraft({ ...draft, nationCode })}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t('editor.teams.budgetLabel')}</span>
        <div role="radiogroup" aria-label={t('editor.teams.budgetLabel')} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {budgets.map((budget) => {
            const chosen = draft.budget === budget;

            return (
              <RadioCard
                key={budget ?? 'unsaid'}
                checked={chosen}
                disabled={locked}
                className="p-3"
                onClick={() => setDraft({ ...draft, budget })}
              >
                <span className="flex min-w-0 flex-col gap-1">
                  {budget === undefined ? (
                    <span className="text-sm font-medium">{t('editor.teams.budget.unsaid')}</span>
                  ) : (
                    <Badge className={cn('w-fit', TEAM_BUDGET_ACCENT[budget])}>{t(TEAM_BUDGET_LABEL[budget])}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{t(`editor.teams.budgetHint.${budget ?? 'unsaid'}`)}</span>
                </span>
              </RadioCard>
            );
          })}
        </div>
      </div>
    </EditorDialog>
  );
};
