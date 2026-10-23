import { CarIcon, CheckIcon, PencilIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { CAR_COLUMN, POWER_TO_WEIGHT_SCALE } from './constants.ts';
import { carImageSources } from './utils.ts';
import type { Car } from '../../../../shared/types';
import { rentOf } from '../../../../shared/utils/car-prices';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  ContentImage, NationFlag, PriceOriginBadge, ProvenanceBadges, PurchaseButton, RacedIn, SpecBadge, SWITCH_TRACK,
} from '@/components';
import type { BrowserToggle, CarAppraise, CarTrade } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useFormat } from '@/i18n';
import { CAR_SOURCE_ACCENT } from '@/lib/accents';
import type { Racing } from '@/lib/racing-index';
import { path } from '@/lib/routes';
import type { NavState } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface CarRowProps {
  /**
   * The car to show.
   */
  car: Car;
  /**
   * Which championships race it, or undefined when none does.
   */
  racing: Racing | undefined;
  /**
   * Called with the car when the table is picked from rather than read.
   */
  onSelect?: (car: Car) => void;
  /**
   * Whether this row is the current answer, when it is being picked from.
   */
  selected?: boolean;
  /**
   * A switch on the row, for a browser deciding something about each car.
   */
  toggle?: BrowserToggle;
  /**
   * What the browser does with money, inside a career: the row ends in the
   * car's price and its rent a round, then Purchase in the Store.
   */
  trade?: CarTrade;
  /**
   * What the browser does with prices, in Your content: a car switched on ends
   * in where its price comes from, the price and Edit price.
   */
  appraise?: CarAppraise;
}

/**
 * One car as a line of the comparison table.
 */
export const CarRow = ({
  car, racing, onSelect, selected = false, toggle, trade, appraise,
}: CarRowProps) => {
  const { t } = useTranslation();
  const {
    formatMoney, formatNation, formatNumber, formatYear,
  } = useFormat();
  const owned = trade?.garage.owned(car.id) ?? null;
  const price = trade?.garage.priceOf(car) ?? 0;
  // Priced, the row makes room for what the car costs by giving up the
  // columns a buyer can do without, its provenance moving under its name.
  const priced = trade !== undefined;
  const { performance } = car;
  const nation = nationOfCountry(car.country);
  const dash = <span className="text-muted-foreground">{t('common.dash')}</span>;
  const navigate = useNavigate();
  // Picking answers the picker; reading opens the car's page, and so does
  // toggling where the toggle names a section - otherwise the row flips its
  // switch. The name is what is focused, and the rest of the row is a larger
  // target for the pointer.
  const pick = toggle === undefined && onSelect !== undefined ? () => onSelect(car) : undefined;
  const flip = toggle !== undefined && toggle.section === undefined
    ? () => toggle.onToggle(car.id, !toggle.isOn(car.id))
    : undefined;
  const state = toggle?.section === undefined ? undefined : { section: toggle.section } satisfies NavState;
  const open = (): void => {
    navigate(path.car({ id: car.id }), { state });
  };
  let name = (
    <Link
      to={path.car({ id: car.id })}
      state={state}
      className="font-semibold hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {car.name}
    </Link>
  );
  if (flip !== undefined) name = <span className="font-semibold">{car.name}</span>;
  else if (pick !== undefined) {
    name = (
      <button
        type="button"
        className="text-left font-semibold hover:underline"
        onClick={(event) => {
          event.stopPropagation();
          pick();
        }}
      >
        {car.name}
      </button>
    );
  }

  return (
    <tr
      className={cn(
        'border-t first:border-t-0 hover:bg-accent/50',
        'cursor-pointer',
        selected && 'bg-primary/8',
      )}
      onClick={pick ?? flip ?? open}
    >
      {toggle === undefined ? null : (
        <td className="w-14 px-2.5 py-1.5" onClick={(event) => event.stopPropagation()}>
          <Switch
            checked={toggle.isOn(car.id)}
            aria-label={car.name}
            className={SWITCH_TRACK}
            onCheckedChange={(next) => toggle.onToggle(car.id, next)}
          />
        </td>
      )}
      <td className="w-20 py-1.5 pr-1 pl-2.5 @[44rem]:w-28">
        <div className="relative h-10 w-16 overflow-hidden rounded-md bg-muted @[44rem]:h-13 @[44rem]:w-24">
          <ContentImage
            sources={carImageSources(car)}
            alt=""
            className="object-cover"
            fallback={<CarIcon className="absolute inset-0 m-auto size-5 text-muted-foreground/40" />}
          />
        </div>
      </td>
      <td className="px-2.5 py-1.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          {name}
          <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{car.brand ?? t('browse.unknown')}</span>
            {nation === null ? null : (
              <span title={formatNation(nation)} className="flex shrink-0"><NationFlag code={nation} /></span>
            )}
            <span className={cn('flex gap-1', !priced && CAR_COLUMN.inline)}>
              <ProvenanceBadges provenance={car.provenance} carId={toggle ? undefined : car.id} />
            </span>
          </span>
          <span className={cn('flex flex-wrap gap-1 pt-0.5 empty:hidden', CAR_COLUMN.inline)}>
            <SpecBadge carId={car.id} />
          </span>
        </div>
      </td>
      <td className={cn('px-2.5 py-1.5', CAR_COLUMN.wide)}>
        <div className="flex flex-wrap gap-1"><SpecBadge carId={car.id} /></div>
      </td>
      <td className={cn('px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums', CAR_COLUMN.year)}>
        {car.year === null ? dash : formatYear(car.year)}
      </td>
      <td className="px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums">
        {performance.bhp === null ? dash : formatNumber(performance.bhp)}
      </td>
      <td className={cn('px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums', CAR_COLUMN.weight)}>
        {performance.weightKg === null ? dash : formatNumber(performance.weightKg)}
      </td>
      <td className={cn('px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums', priced && 'hidden')}>
        {performance.powerToWeight === null ? dash : (
          <span className="inline-flex items-center gap-2">
            {formatNumber(Math.round(performance.powerToWeight))}
            {/* A bar against one fixed scale, so the fast cars stand out
                whichever page of the list they arrived on. */}
            <span aria-hidden className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary/70"
                style={{ width: `${Math.min(100, (performance.powerToWeight / POWER_TO_WEIGHT_SCALE) * 100)}%` }}
              />
            </span>
          </span>
        )}
      </td>
      <td className={cn('px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums', priced ? 'hidden' : CAR_COLUMN.liveries)}>
        {formatNumber(car.skins.length)}
      </td>
      <td className="px-2.5 py-1.5"><RacedIn racing={racing} compact /></td>
      <td className={cn('px-2.5 py-1.5', priced ? 'hidden' : CAR_COLUMN.wide)}>
        <div className="flex flex-wrap gap-1">
          <ProvenanceBadges provenance={car.provenance} carId={toggle ? undefined : car.id} />
        </div>
      </td>
      {trade ? (
        <>
          <td className={cn(
            'px-2.5 py-1.5 text-right font-semibold whitespace-nowrap tabular-nums',
            !owned && price > trade.garage.balance && 'text-muted-foreground',
          )}
          >
            {formatMoney(price)}
          </td>
          <td className="px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums">
            {owned ? dash : formatMoney(rentOf(price))}
          </td>
        </>
      ) : null}
      {appraise ? (
        <>
          <td className="px-2.5 py-1.5 text-right whitespace-nowrap">
            {toggle?.isOn(car.id) ? (
              <span className="inline-flex items-center gap-2">
                <PriceOriginBadge origin={appraise.originOf(car)} />
                <span className="font-semibold tabular-nums">{formatMoney(appraise.priceOf(car))}</span>
              </span>
            ) : dash}
          </td>
          <td className="w-1 px-2.5 py-1.5 text-right" onClick={(event) => event.stopPropagation()}>
            {toggle?.isOn(car.id) ? (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                aria-label={t('prices.editFor', { car: car.name })}
                title={t('prices.edit')}
                onClick={() => appraise.onEdit(car)}
              >
                <PencilIcon />
              </Button>
            ) : null}
          </td>
        </>
      ) : null}
      {trade?.mode === 'store' ? (
        // One width whatever it holds, so nothing shifts from row to row.
        <td className="w-1 px-2.5 py-1.5 text-right whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
          {owned ? (
            <Badge className={cn('h-8 w-32 justify-center', CAR_SOURCE_ACCENT.owned)}>
              <CheckIcon />
              {t('trade.source.owned')}
            </Badge>
          ) : (
            <PurchaseButton
              price={price}
              balance={trade.garage.balance}
              size="sm"
              className="w-32"
              onPurchase={() => trade.onPurchase?.(car)}
            />
          )}
        </td>
      ) : null}
    </tr>
  );
};
