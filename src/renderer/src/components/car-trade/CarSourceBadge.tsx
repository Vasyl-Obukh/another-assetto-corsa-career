import { CheckIcon, KeyRoundIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CarSource } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { CAR_SOURCE_ACCENT } from '@/lib/accents';

interface CarSourceBadgeProps {
  /**
   * Whether the car is owned or rented.
   */
  source: CarSource;
}

/**
 * Whose a car is: Owned on the garage's magenta, Rented on the rental's teal.
 */
export const CarSourceBadge = ({ source }: CarSourceBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Badge className={CAR_SOURCE_ACCENT[source]}>
      {source === 'owned' ? <CheckIcon /> : <KeyRoundIcon />}
      {t(`trade.source.${source}`)}
    </Badge>
  );
};
