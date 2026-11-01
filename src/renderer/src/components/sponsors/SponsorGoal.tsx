import { useTranslation } from 'react-i18next';

import { goalProgress, goalText } from './utils.ts';
import type { SponsorGoal as Goal } from '../../../../shared/types';
import type { GoalStanding } from '../../../../shared/utils/sponsors';
import { Badge } from '@/components/ui/badge.tsx';
import { KEEP_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SponsorGoalProps {
  /**
   * The goal.
   */
  goal: Goal;
  /**
   * Where it stands, for a deal running - absent on an offer.
   */
  standing?: GoalStanding;
  /**
   * Whether it says Goal before it - left off where a row already names it.
   */
  labelled?: boolean;
  /**
   * Anything the caller adds.
   */
  className?: string;
}

/**
 * A deal's goal for its year, and for a deal running, whether it is on course
 * - in the words and colours a contract's keep is shown in - and how far it has
 * got.
 */
export const SponsorGoal = ({
  goal, standing, labelled = true, className,
}: SponsorGoalProps) => {
  const { t } = useTranslation();
  const mark = standing?.onCourse === true ? 'kept' : standing?.onCourse === false ? 'short' : null;

  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm', className)}>
      {labelled ? (
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('sponsors.goal.label')}
        </span>
      ) : null}
      <span>{goalText(goal, t)}</span>
      {mark ? <Badge className={KEEP_ACCENT[mark]}>{t(`championships.contract.mark.${mark}`)}</Badge> : null}
      {standing ? <span className="basis-full text-xs text-muted-foreground">{goalProgress(goal, standing, t)}</span> : null}
    </div>
  );
};
