import { PencilIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PriceOrigin } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { PRICE_ORIGIN_ACCENT } from '@/lib/accents';

interface PriceOriginBadgeProps {
  /**
   * Where the price comes from.
   */
  origin: PriceOrigin;
}

/**
 * Where the price of a car the user added comes from: Your price, or
 * Suggested. A listed car's price has only the one source, so it says nothing.
 */
export const PriceOriginBadge = ({ origin }: PriceOriginBadgeProps) => {
  const { t } = useTranslation();
  if (origin === 'catalogue') return null;

  return (
    <Badge className={PRICE_ORIGIN_ACCENT[origin]}>
      {origin === 'yours' ? <PencilIcon /> : null}
      {t(`prices.origin.${origin}`)}
    </Badge>
  );
};
