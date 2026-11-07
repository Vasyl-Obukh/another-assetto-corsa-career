import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_CARS } from './constants.ts';
import type { Car, CarQuery } from '../../../../shared/types';
import { PurchaseDialog, RailSection, RailSwitch } from '@/components';
import { useGarage } from '@/hooks';
import { CarBrowserBody } from '@/screens/car-browser';

/**
 * A career's Store: the car browser over the whole library, every card and row
 * saying what the car costs to buy and to rent a round, and buying it straight
 * from there - the livery step, then a confirmation.
 */
export const Store = () => {
  const { t } = useTranslation();
  const garage = useGarage();
  const [buying, setBuying] = useState<Car | null>(null);
  const [owned, setOwned] = useState(false);
  const [affordable, setAffordable] = useState(false);
  // Only a career has a Store, and the routes mount it in nothing else.
  if (!garage) return null;

  const ids = garage.cars.map((one) => one.model);
  const baseQuery: CarQuery = {
    ...(owned ? { ids: ids.length > 0 ? ids : [...NO_CARS] } : {}),
    ...(affordable ? {
      payable: { money: garage.balance, share: garage.backing?.share ?? 0, models: garage.backing?.models ?? [] },
    } : {}),
  };

  return (
    <>
      <CarBrowserBody
        memoryId="store"
        heading={{ title: t('store.title'), subtitle: t('store.subtitle') }}
        baseQuery={baseQuery}
        trade={{ mode: 'store', garage, onPurchase: setBuying }}
        railTop={(
          <RailSection title={t('store.yours')}>
            <RailSwitch label={t('store.owned')} checked={owned} onChange={setOwned} />
            <RailSwitch label={t('store.affordable')} checked={affordable} onChange={setAffordable} />
          </RailSection>
        )}
      />
      <PurchaseDialog car={buying} garage={garage} onClose={() => setBuying(null)} />
    </>
  );
};
