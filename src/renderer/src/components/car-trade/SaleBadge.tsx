import { BadgePercentIcon, TagIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { LiveDeal } from '../../../../shared/utils/car-sale';
import { Badge } from '@/components/ui/badge.tsx';
import { SALE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SaleBadgeProps {
  /**
   * The car's deal this week.
   */
  deal: LiveDeal;
  /**
   * Whether the Deal of the week says so, which it does wherever nothing beside
   * it already does.
   */
  named?: boolean;
  /**
   * Anything the caller adds, such as a shadow over a picture.
   */
  className?: string;
}

/**
 * What the week's sale takes off a car: a pale tag, or the Deal of the week's
 * solid one.
 */
export const SaleBadge = ({ deal, named = false, className }: SaleBadgeProps) => {
  const { t } = useTranslation();
  const off = t('sale.off', { off: deal.off });

  return (
    <Badge className={cn(deal.headline ? SALE_ACCENT.headline : SALE_ACCENT.deal, className)}>
      {deal.headline ? <BadgePercentIcon /> : <TagIcon />}
      {deal.headline && named ? t('sale.headlineOff', { off }) : off}
    </Badge>
  );
};
