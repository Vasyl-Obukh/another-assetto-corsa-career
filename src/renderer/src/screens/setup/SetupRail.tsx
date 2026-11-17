import { CheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SETUP_STEPS } from './constants.ts';
import { AppMark } from '@/components';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface SetupRailProps {
  /**
   * The index of the step on screen.
   */
  current: number;
}

/**
 * The coloured column beside the wizard, naming every step and marking where
 * the user is: the ones behind ticked, the one on screen lit.
 */
export const SetupRail = ({ current }: SetupRailProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <aside className="flex flex-col gap-6 bg-linear-170 from-welcome-from to-welcome-to p-7 text-welcome-foreground [--logo-red:var(--logo-red-welcome)]">
      <span className="grid size-12 place-items-center rounded-xl bg-welcome-foreground/18">
        <AppMark size={30} />
      </span>
      <span className="text-lg leading-snug font-semibold">{t('setup.title')}</span>

      <ol className="flex flex-col gap-5">
        {SETUP_STEPS.map((step, index) => (
          <li
            key={step.id}
            aria-current={index === current ? 'step' : undefined}
            className={cn('flex items-start gap-3', index > current && 'opacity-65')}
          >
            <span
              className={cn(
                'grid size-6.5 shrink-0 place-items-center rounded-full text-sm font-semibold',
                index < current && 'bg-success text-success-foreground',
                index === current && 'bg-welcome-foreground text-welcome-to',
                index > current && 'bg-welcome-foreground/18',
              )}
            >
              {index < current ? <CheckIcon className="size-3.5" /> : formatNumber(index + 1)}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{t(step.title)}</span>
              <span className="text-xs opacity-80">{t(step.sub)}</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
};
