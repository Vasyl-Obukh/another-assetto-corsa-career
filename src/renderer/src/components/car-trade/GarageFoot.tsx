import { useTranslation } from 'react-i18next';

import { TradeButton } from './TradeButton.tsx';
import type { CarTrade } from './types.ts';
import type { Car } from '../../../../shared/types';
import { liveryName } from '../../../../shared/utils/garage';
import { CarSwatch } from '@/components/content-image/index.ts';
import { useFormat } from '@/i18n';

interface GarageFootProps {
  /**
   * The car the card shows, which the career owns.
   */
  car: Car;
  /**
   * What the browser does with money.
   */
  trade: CarTrade;
}

/**
 * What closes a car's card in the Garage: the livery it wears, when it was
 * bought and what it races in this season, then Repaint and Sell with what each
 * costs or pays on its button.
 */
export const GarageFoot = ({ car, trade }: GarageFootProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const { garage } = trade;
  const owned = garage.owned(car.id);
  if (!owned) return null;

  const livery = liveryName(car, owned.skin) ?? '';
  const racing = garage.racingIn(car.id).map((entry) => entry.championship.name);

  return (
    <div className="mt-auto flex flex-col gap-3">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">{t('trade.livery')}</dt>
        <dd className="flex min-w-0 items-center justify-end gap-1.5 font-semibold">
          <CarSwatch model={car.id} skin={owned.skin} />
          <span className="truncate">{livery}</span>
        </dd>
        <dt className="text-muted-foreground">{t('trade.bought')}</dt>
        <dd className="text-right font-semibold">{formatDay(owned.bought)}</dd>
        <dt className="text-muted-foreground">{t('trade.racingIn')}</dt>
        <dd className={racing.length > 0 ? 'truncate text-right font-semibold' : 'text-right text-muted-foreground'}>
          {racing.length > 0 ? racing.join(', ') : t('trade.racingNothing')}
        </dd>
      </dl>
      {/* Above the card's own link, which covers the rest of the card; side by
          side where the card is wide enough, one above the other where not. */}
      <div className="relative z-10 flex flex-wrap gap-2">
        <TradeButton
          kind="repaint"
          size="sm"
          amount={garage.repaintCost(owned)}
          className="flex-1"
          onClick={() => trade.onRepaint?.(car)}
        />
        <TradeButton kind="sell" size="sm" amount={garage.valueOf(owned)} className="flex-1" onClick={() => trade.onSell?.(car)} />
      </div>
    </div>
  );
};
