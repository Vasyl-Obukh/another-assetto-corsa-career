import { useTranslation } from 'react-i18next';

import type { Discipline } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface CoversBadgeProps {
  /**
   * The discipline a deal covers, or null for any racing.
   */
  covers: Discipline | null;
  /**
   * Anything the caller adds.
   */
  className?: string;
}

/**
 * What a sponsor covers: a discipline in its own colour, or any racing -
 * neutral on purpose, since it names no discipline to colour.
 */
export const CoversBadge = ({ covers, className }: CoversBadgeProps) => {
  const { t } = useTranslation();

  return covers
    ? <Badge className={cn(DISCIPLINE_ACCENT[covers], className)}>{t(`championships.discipline.${covers}`)}</Badge>
    : <Badge variant="secondary" className={className}>{t('sponsors.anyDiscipline')}</Badge>;
};
