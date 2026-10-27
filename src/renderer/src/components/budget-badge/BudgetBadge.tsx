import { useTranslation } from 'react-i18next';

import { TEAM_BUDGET_LABEL, TEAM_BUDGET_TIP } from './constants.ts';
import type { TeamBudget } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { TEAM_BUDGET_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface BudgetBadgeProps {
  /**
   * How well funded the team is.
   */
  budget: TeamBudget;
  /**
   * Anything the caller adds to the chip.
   */
  className?: string;
}

// How well funded a team is, explaining on hover what that means - works,
// independent and privateer are motorsport's words, not everyone's. Focusable,
// so the explanation is reachable from the keyboard.
export const BudgetBadge = ({ budget, className }: BudgetBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge tabIndex={0} className={cn(TEAM_BUDGET_ACCENT[budget], className)}>
          {t(TEAM_BUDGET_LABEL[budget])}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        <span className="block font-semibold">{t(TEAM_BUDGET_LABEL[budget])}</span>
        {t(TEAM_BUDGET_TIP[budget])}
      </TooltipContent>
    </Tooltip>
  );
};
