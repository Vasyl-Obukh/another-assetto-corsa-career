import { PencilIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PriceOriginBadge } from './PriceOriginBadge.tsx';
import type { CarAppraise } from './types.ts';
import type { Car } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { PRICE_FOOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface AppraiseFootProps {
  /**
   * The car the card shows, which the user has added.
   */
  car: Car;
  /**
   * What the browser does with prices.
   */
  appraise: CarAppraise;
}

/**
 * The tinted band closing the card of a car the user added: its price, where
 * that comes from, and Edit price.
 */
export const AppraiseFoot = ({ car, appraise }: AppraiseFootProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <div className={cn('-mx-3 -mb-3 flex items-center gap-3 px-3 py-2.5', PRICE_FOOT.forSale)}>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="text-lg leading-tight font-semibold tabular-nums">{formatMoney(appraise.priceOf(car))}</span>
        <PriceOriginBadge origin={appraise.originOf(car)} />
      </div>
      {/* Above the card's own link, which covers the rest of the card. */}
      <Button variant="outline" size="sm" className="relative z-10 ml-auto" onClick={() => appraise.onEdit(car)}>
        <PencilIcon />
        {t('prices.edit')}
      </Button>
    </div>
  );
};
