import type { ParseKeys } from 'i18next';

import type { TeamBudget } from '../../../../shared/types';

/**
 * The label for each budget.
 *
 * A record over the enum rather than a lookup by string, so adding a budget
 * fails to compile until it has been named.
 */
export const TEAM_BUDGET_LABEL = {
  works: 'editor.teams.budget.works',
  independent: 'editor.teams.budget.independent',
  privateer: 'editor.teams.budget.privateer',
} as const satisfies Record<TeamBudget, ParseKeys>;

/**
 * What each budget means, as its chip's tooltip explains it.
 */
export const TEAM_BUDGET_TIP = {
  works: 'editor.teams.budgetTip.works',
  independent: 'editor.teams.budgetTip.independent',
  privateer: 'editor.teams.budgetTip.privateer',
} as const satisfies Record<TeamBudget, ParseKeys>;
