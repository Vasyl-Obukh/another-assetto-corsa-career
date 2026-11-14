import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { DealBannerSkeleton } from './DealBannerSkeleton.tsx';
import type { Car } from '../../../../shared/types';
import { saleEnds } from '../../../../shared/utils/car-sale';
import type { LiveDeal } from '../../../../shared/utils/car-sale';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  CARD_COVER, ContentImage, FigureLine, NationFlag, ProvenanceBadges, PurchaseButton, RacedIn, SaleBadge, SpecBadge,
} from '@/components';
import { Card } from '@/components/ui/card.tsx';
import type { Garage } from '@/hooks';
import { useCarDetail, useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import type { Racing } from '@/lib/racing-index';
import { path } from '@/lib/routes';
import { carImageSources } from '@/screens/car-browser';

interface DealBannerProps {
  /**
   * The Deal of the week.
   */
  deal: LiveDeal;
  /**
   * The career's garage, which prices it.
   */
  garage: Garage;
  /**
   * Where it races, from the browser below it.
   */
  racing: Racing | undefined;
  /**
   * Called to buy it.
   * @param car The car
   */
  onPurchase(car: Car): void;
}

/**
 * The Deal of the week, standing above the Store's list: the car large, until
 * when it runs, and its sale price with Purchase.
 */
export const DealBanner = ({
  deal, garage, racing, onPurchase,
}: DealBannerProps) => {
  const { t } = useTranslation();
  const {
    formatDay, formatMoney, formatNation, formatNumber, formatYear,
  } = useFormat();
  // Over the library alone: a car taken out of it since the sale was drawn is
  // no longer for sale.
  const { car, loading } = useCarDetail(deal.model, false);
  const units = useUnits();

  if (loading) return <DealBannerSkeleton />;
  // A car gone from the install has nothing to show, and the list still offers the rest.
  if (!car || !garage.sale) return null;

  const { performance } = car;
  const nation = nationOfCountry(car.country);
  const figure = (value: number | null): string | null => (value === null ? null : formatNumber(Math.round(value)));
  const weight = performance.weightKg === null ? null : units.figure('weight', performance.weightKg);

  return (
    <Card className="relative grid grid-cols-[minmax(0,26rem)_minmax(0,1fr)] gap-0 overflow-hidden py-0 ring-2 ring-sale-solid">
      <Link to={path.car({ id: car.id })} aria-label={car.name} className={CARD_COVER} />
      <div className="relative min-h-60 bg-scrim">
        <ContentImage sources={carImageSources(car)} alt={car.name} className="object-cover" fallback={null} />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 [&>*]:shadow-sm">
          <ProvenanceBadges provenance={car.provenance} carId={car.id} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5 px-5 py-4">
        <div className="flex items-center gap-2">
          <SaleBadge deal={deal} named />
          <span className="text-sm text-muted-foreground">
            {t('sale.until', { day: formatDay(saleEnds(garage.sale.week)) })}
          </span>
        </div>
        <h2 className="text-xl font-semibold">{car.name}</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{car.brand ?? t('browse.unknown')}</span>
          {nation === null ? null : (
            <span title={formatNation(nation)} className="flex"><NationFlag code={nation} /></span>
          )}
          {car.year === null ? null : <span className="tabular-nums">{formatYear(car.year)}</span>}
          <SpecBadge carId={car.id} />
        </div>
        <FigureLine figures={[
          { unit: t('cars.unitBhp'), value: figure(performance.bhp) },
          { unit: units.unit('weight'), value: weight },
          { unit: t('cars.unitBhpPerTonne'), value: figure(performance.powerToWeight) },
        ]}
        />
        <RacedIn racing={racing} />

        <div className="mt-auto flex items-end gap-4 border-t pt-3">
          <div className="flex flex-col">
            <s className="text-sm text-muted-foreground tabular-nums">{formatMoney(garage.listedOf(car))}</s>
            <span className="flex items-center gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(garage.priceOf(car))}</span>
              <SaleBadge deal={deal} />
            </span>
          </div>
          {/* Above the banner's own link, which covers the rest of it. */}
          <PurchaseButton
            price={garage.priceOf(car)}
            payable={garage.payableFor(car)}
            balance={garage.balance}
            size="lg"
            className="relative z-10 ml-auto"
            onPurchase={() => onPurchase(car)}
          />
        </div>
      </div>
    </Card>
  );
};
