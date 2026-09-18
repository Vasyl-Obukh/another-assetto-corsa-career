import { useTranslation } from 'react-i18next';

import { disciplineKey, tierAccent } from './utils.ts';
import type { LadderPosition } from '../../../../shared/types';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface LadderChipProps {
  /**
   * The discipline and rung one class entry is entered at.
   */
  ladder: LadderPosition;
}

// One chip rather than two, because the pair answers a single question - where
// on the ladder this way in sits - and a multi-class championship listing four
// separate chips reads as four unrelated facts. Each half keeps its own family's
// colour: the discipline's hue, and the tier's metal.
export const LadderChip = ({ ladder }: LadderChipProps) => {
  const { t } = useTranslation();

  return (
    <span className="inline-flex shrink-0 items-center overflow-hidden rounded-md text-xs font-medium">
      <span className={cn('px-2 py-0.5', DISCIPLINE_ACCENT[ladder.discipline])}>
        {t(disciplineKey(ladder.discipline))}
      </span>
      <span className={cn('px-2 py-0.5', tierAccent(ladder.tier))}>
        {t('championships.tier', { tier: ladder.tier })}
      </span>
    </span>
  );
};
