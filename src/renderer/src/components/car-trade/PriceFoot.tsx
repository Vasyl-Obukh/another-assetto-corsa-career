import { useTranslation } from 'react-i18next';

import { BackingMark } from './BackingMark.tsx';
import { PurchaseButton } from './PurchaseButton.tsx';
import type { CarTrade } from './types.ts';
import type { Car } from '../../../../shared/types';
import { liveryName } from '../../../../shared/utils/garage';
import { useFormat } from '@/i18n';
import { PRICE_FOOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface PriceFootProps {
  /**
   * The car the card shows.
   */
  car: Car;
  /**
   * What the browser does with money.
   */
  trade: CarTrade;
}

/**
 * The tinted band closing a car's card in the Store and its pickers: the price
 * large, with its listed price struck under it while it is on sale, and
 * Purchase in the Store. A car the
 * career owns closes on the garage's magenta instead - its livery, and what it
 * sells for.
 */
export const PriceFoot = ({ car, trade }: PriceFootProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { garage } = trade;
  const owned = garage.owned(car.id);
  const price = garage.priceOf(car);
  const deal = garage.dealOf(car);
  const backing = garage.backingOf(car);
  const band = '-mx-3 -mb-3 flex items-center gap-3 px-3 py-2.5';

  if (owned) {
    const livery = liveryName(car, owned.skin) ?? '';

    return (
      <div className={cn(band, PRICE_FOOT.owned)}>
        <div className="flex min-w-0 flex-col">
          <span className="text-[0.6875rem] font-semibold tracking-wide uppercase opacity-75">{t('trade.source.owned')}</span>
          <span className="truncate text-base leading-tight font-semibold">{livery}</span>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-end">
          <span className="text-[0.6875rem] font-semibold tracking-wide uppercase opacity-75">{t('trade.sellsFor')}</span>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(garage.valueOf(owned))}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(band, PRICE_FOOT.forSale)}>
      {/* Two lines high whether or not the car is on sale, so cards side by
          side close level. */}
      <div className="flex min-h-11 min-w-0 flex-col justify-center">
        <span className="flex items-center gap-1.5">
          <span className={cn(
            'text-lg leading-tight font-semibold tabular-nums',
            garage.payableFor(car) > garage.balance && 'text-muted-foreground',
          )}
          >
            {formatMoney(price)}
          </span>
          {backing ? <BackingMark sponsor={backing.sponsor} amount={backing.amount} /> : null}
        </span>
        {deal ? (
          <s className="text-xs text-muted-foreground tabular-nums">{formatMoney(garage.listedOf(car))}</s>
        ) : null}
      </div>
      {trade.mode === 'store' && trade.onPurchase ? (
        // Above the card's own link, which covers the rest of the card.
        <PurchaseButton
          price={price}
          payable={garage.payableFor(car)}
          balance={garage.balance}
          size="sm"
          className="relative z-10 ml-auto"
          onPurchase={() => trade.onPurchase?.(car)}
        />
      ) : null}
    </div>
  );
};
