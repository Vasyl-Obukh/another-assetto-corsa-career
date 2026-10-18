import { CheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { STEPS } from './constants.ts';
import type { Step } from './types.ts';
import { cn } from '@/lib/utils.ts';

interface StepperProps {
  /**
   * The step the page is on.
   */
  step: Step;
}

/**
 * Which of New championship's steps the page is on: each numbered, a step
 * done ticked, and the one open in primary.
 */
export const Stepper = ({ step }: StepperProps) => {
  const { t } = useTranslation();
  const at = STEPS.indexOf(step);

  return (
    <ol className="flex items-center gap-2" aria-label={t('newChampionship.stepNumber', { number: at + 1, count: STEPS.length })}>
      {STEPS.map((one, index) => (
        <li key={one} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden className="h-px w-6 bg-border" /> : null}
          <span
            aria-current={index === at ? 'step' : undefined}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium',
              index === at ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'grid size-5 place-items-center rounded-full text-xs tabular-nums [&_svg]:size-3',
                index === at && 'bg-primary text-primary-foreground',
                index < at && 'bg-primary/15 text-primary',
                index > at && 'bg-muted',
              )}
            >
              {index < at ? <CheckIcon /> : index + 1}
            </span>
            {t(`newChampionship.steps.${one}`)}
          </span>
        </li>
      ))}
    </ol>
  );
};
