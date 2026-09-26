import { useTranslation } from 'react-i18next';

import { tierAccent, tierMetalKey } from './utils.ts';
import { cn } from '@/lib/utils.ts';

interface TierMedalProps {
  /**
   * Which rung, 1 being the top.
   */
  tier: number;
  /**
   * Its size, and anything else the caller adds.
   */
  className?: string;
}

// A round medal in the tier's metal, carrying the number, so a rung reads as a
// rank without a legend beside it.
export const TierMedal = ({ tier, className }: TierMedalProps) => {
  const { t } = useTranslation();
  const label = t('championships.entryMetal', { tier, metal: t(tierMetalKey(tier)) });

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums',
        tierAccent(tier),
        className,
      )}
    >
      {tier}
    </span>
  );
};
