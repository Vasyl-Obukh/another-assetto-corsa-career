import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
import { repaintOf } from '../../../../shared/utils/car-prices';
import { liveryName } from '../../../../shared/utils/garage';
import {
  CarSourceBadge, CarSwatch, PurchaseButton, PurchaseDialog, RepaintDialog, SellDialog, TradeButton,
} from '@/components';
import { Card } from '@/components/ui/card.tsx';
import type { Garage } from '@/hooks';
import { useFormat } from '@/i18n';

interface CarTradePanelProps {
  /**
   * The car the page shows.
   */
  car: Car;
  /**
   * The career's garage.
   */
  garage: Garage;
}

/**
 * The head of a car's sidebar in a career: its price and Purchase - which
 * turns into a refusal where the career cannot pay - or, for a car it owns, the
 * livery it wears, what was paid for it and when, and Repaint and Sell with
 * what each costs or pays.
 */
export const CarTradePanel = ({ car, garage }: CarTradePanelProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney } = useFormat();
  const [open, setOpen] = useState<'purchase' | 'repaint' | 'sell' | null>(null);
  const owned = garage.owned(car.id);
  const price = garage.priceOf(car);
  const close = (): void => setOpen(null);

  return (
    <Card className="gap-3 px-4 py-4">
      {owned ? (
        <>
          <div className="flex items-center gap-2">
            <CarSourceBadge source="owned" />
            <span className="ml-auto text-xs text-muted-foreground">
              {t('trade.paidOn', { paid: formatMoney(owned.paid), day: formatDay(owned.bought) })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CarSwatch model={car.id} skin={owned.skin} />
            <span className="truncate">{liveryName(car, owned.skin)}</span>
          </div>
          <div className="flex gap-2">
            <TradeButton kind="repaint" amount={repaintOf(owned.paid)} className="flex-1" onClick={() => setOpen('repaint')} />
            <TradeButton kind="sell" amount={garage.valueOf(owned)} className="flex-1" onClick={() => setOpen('sell')} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col">
            <span className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">{t('trade.price')}</span>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(price)}</span>
          </div>
          <PurchaseButton price={price} balance={garage.balance} size="lg" onPurchase={() => setOpen('purchase')} />
        </>
      )}

      <PurchaseDialog car={open === 'purchase' ? car : null} garage={garage} onClose={close} />
      <RepaintDialog car={open === 'repaint' ? car : null} garage={garage} onClose={close} />
      <SellDialog car={open === 'sell' ? car : null} garage={garage} onClose={close} />
    </Card>
  );
};
