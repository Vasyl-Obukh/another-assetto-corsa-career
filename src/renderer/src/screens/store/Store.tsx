import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_CARS } from './constants.ts';
import { DealBanner } from './DealBanner.tsx';
import { readStoreSwitches, storeSwitchesKey } from './utils.ts';
import type { Car, CarQuery } from '../../../../shared/types';
import { saleEnds } from '../../../../shared/utils/car-sale';
import { useSlot } from '@/app';
import { PurchaseDialog, RailSection, RailSwitch } from '@/components';
import { useGarage, usePreference } from '@/hooks';
import { useFormat } from '@/i18n';
import { CarBrowserBody } from '@/screens/car-browser';

/**
 * A career's Store: the car browser over the whole library, every card saying
 * what the car costs to buy and every row what it costs to rent a round too,
 * and buying it straight from there - the livery step, then a confirmation. The week's Deal of the week
 * stands above the list while nothing narrows it but This week's switch, which
 * keeps the cars on sale alone.
 */
export const Store = () => {
  const { t } = useTranslation();
  const garage = useGarage();
  const [buying, setBuying] = useState<Car | null>(null);
  const { career } = useSlot();
  const [switches, setSwitches] = usePreference(storeSwitchesKey(career?.id ?? ''), readStoreSwitches);
  const { owned, affordable, onSale } = switches;
  const { formatDay, formatNumber } = useFormat();
  // Only a career has a Store, and the routes mount it in nothing else.
  if (!garage) return null;

  const { sale, deals } = garage;
  const headline = deals.find((deal) => deal.headline) ?? null;
  // Its switch goes once nothing is left on sale, and so does what it keeps.
  const onlyOnSale = onSale && deals.length > 0;
  // The banner stands over the whole Store, and over its cars on sale - the
  // Deal of the week being one of them. Any other switch narrows it away, as
  // the rail's filters do.
  const leads = headline !== null && !owned && !affordable;

  const ids = garage.cars.map((one) => one.model);
  const baseQuery: CarQuery = {
    ...(owned ? { ids: ids.length > 0 ? ids : [...NO_CARS] } : {}),
    ...(onlyOnSale ? { onSale: true } : {}),
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
        lead={leads && headline ? {
          model: headline.model,
          render: (racing) => <DealBanner deal={headline} garage={garage} racing={racing} onPurchase={setBuying} />,
        } : undefined}
        railTop={(
          <>
            {sale && deals.length > 0 ? (
              <RailSection title={t('store.thisWeek')}>
                <RailSwitch
                  label={t('store.onSale')}
                  hint={t('store.onSaleHint', {
                    count: deals.length,
                    cars: formatNumber(deals.length),
                    day: formatDay(saleEnds(sale.week)),
                  })}
                  checked={onSale}
                  onChange={(next) => setSwitches({ ...switches, onSale: next })}
                />
              </RailSection>
            ) : null}
            <RailSection title={t('store.yours')}>
              <RailSwitch label={t('store.owned')} checked={owned} onChange={(next) => setSwitches({ ...switches, owned: next })} />
              <RailSwitch label={t('store.affordable')} checked={affordable} onChange={(next) => setSwitches({ ...switches, affordable: next })} />
            </RailSection>
          </>
        )}
      />
      <PurchaseDialog car={buying} garage={garage} onClose={() => setBuying(null)} />
    </>
  );
};
