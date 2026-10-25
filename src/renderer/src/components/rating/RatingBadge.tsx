import { ChevronDownIcon, ChevronUpIcon, GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { RatingLine } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { HISTORIC_ACCENT, RATING_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface RatingBadgeProps {
  /**
   * The line it chips.
   */
  line: Pick<RatingLine, 'kind' | 'historic'>;
  /**
   * Anything the caller adds.
   */
  className?: string;
}

/**
 * What a line of a career's rating log is, in the colour of what moved it - a
 * historic event's sessions in its leather.
 */
export const RatingBadge = ({ line, className }: RatingBadgeProps) => {
  const { t } = useTranslation();
  const historic = line.historic && (line.kind === 'race' || line.kind === 'qualifying');

  return (
    <Badge className={cn(historic ? HISTORIC_ACCENT : RATING_ACCENT[line.kind], className)}>
      {line.kind === 'promotion' ? <ChevronUpIcon /> : null}
      {line.kind === 'drop' ? <ChevronDownIcon /> : null}
      {line.kind === 'speed' ? <GaugeIcon /> : null}
      {historic ? t('rating.kind.historic') : t(`rating.kind.${line.kind}`)}
    </Badge>
  );
};
