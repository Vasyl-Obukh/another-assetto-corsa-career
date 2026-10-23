import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
import { carPrice, rentOf, repaintOf } from '../../../../shared/utils/car-prices';
import { useClasses, useSettings } from '@/app';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';

interface CarPricePanelProps {
  /**
   * The car the page shows.
   */
  car: Car;
}

/**
 * The head of a car's sidebar outside a career: what every career pays for it,
 * and the rent and the repaint that follow. Read only - a price the user may
 * change is changed in Your content.
 */
export const CarPricePanel = ({ car }: CarPricePanelProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { catalogue } = useClasses();
  const { settings } = useSettings();
  const price = carPrice(car, catalogue, settings.carPrices);

  return (
    <Card className="gap-2 px-4 py-4">
      <div className="flex flex-col">
        <span className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">{t('trade.price')}</span>
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(price)}</span>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('prices.costs', { rent: formatMoney(rentOf(price)), repaint: formatMoney(repaintOf(price)) })}
      </span>
    </Card>
  );
};
