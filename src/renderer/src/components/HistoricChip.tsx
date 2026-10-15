import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { HISTORIC_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface HistoricChipProps {
  /**
   * Anything the caller adds, such as the smaller size a card's row of chips
   * uses.
   */
  className?: string;
}

// Says an event is a historic event rather than a round of a championship, in
// the one colour that means that wherever the two meet.
export const HistoricChip = ({ className }: HistoricChipProps) => {
  const { t } = useTranslation();

  return <Badge className={cn(HISTORIC_ACCENT, className)}>{t('historic.chip')}</Badge>;
};
