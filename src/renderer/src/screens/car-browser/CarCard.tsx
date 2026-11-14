import { CarIcon, PaletteIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { carImageSources } from './utils.ts';
import type { Car } from '../../../../shared/types';
import { carBadgeUrl, isSafeSegment } from '../../../../shared/utils/content-url';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  AppraiseFoot, CARD_COVER, CARD_LINK, carPictureSources, ContentImage, FigureLine, GarageFoot, NationFlag,
  PosterCaption, PriceFoot, ProvenanceBadges, RacedIn, SaleBadge, SpecBadge, ToggleCard,
} from '@/components';
import type { BrowserToggle, CarAppraise, CarTrade } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import type { Racing } from '@/lib/racing-index';
import { path } from '@/lib/routes';
import type { NavState } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface CarCardProps {
  /**
   * The car to show.
   */
  car: Car;
  /**
   * Which championships race it, or undefined when none does.
   */
  racing: Racing | undefined;
  /**
   * Called with the car when the card is used as a picker rather than a link.
   *
   * This is the whole of the browser's selection semantics: with it the card is
   * a button that answers a question, without it a link to the car's own page.
   * Everything else about the browser - paging, search, facets, the grid - does
   * not care which it is.
   */
  onSelect?: (car: Car) => void;
  /**
   * Whether this card is the current answer, when it is being picked from.
   */
  selected?: boolean;
  /**
   * A switch on the card, for a browser deciding something about each car.
   * Wins over `onSelect`: the card flips its switch, or opens the car's page
   * where the toggle names a section, rather than answering.
   */
  toggle?: BrowserToggle;
  /**
   * What the browser does with money, inside a career: the card closes on what
   * the car costs, or on what the career's own is worth, and shows the livery
   * an owned car wears.
   */
  trade?: CarTrade;
  /**
   * What the browser does with prices, in Your content: a car switched on
   * closes on what it costs and Edit price.
   */
  appraise?: CarAppraise;
}

/**
 * A car as a poster: its name and maker over the photograph, with what tells
 * one car from another below it.
 */
export const CarCard = ({
  car, racing, onSelect, selected = false, toggle, trade, appraise,
}: CarCardProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber, formatYear } = useFormat();
  const units = useUnits();

  const { performance } = car;
  const on = toggle?.isOn(car.id) ?? false;
  const nation = nationOfCountry(car.country);
  const figure = (value: number | null): string | null => (value === null ? null : formatNumber(Math.round(value)));
  const owned = trade?.garage.owned(car.id) ?? null;
  const deal = trade?.garage.dealOf(car) ?? null;
  // A card with buttons of its own is not one link: the link covers the card
  // from inside it, and the buttons sit above it.
  const buttons = trade !== undefined && trade.mode !== 'pick' && toggle === undefined && onSelect === undefined;
  const priced = appraise !== undefined && on;

  const card = (
    <Card className={cn(
      'hover-outline relative h-full gap-0 overflow-hidden py-0',
      '[contain-intrinsic-size:auto_22rem] [content-visibility:auto]',
      selected && '[--outline-rest:var(--color-primary)]',
      on && 'border-primary',
    )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={owned ? [...carPictureSources(car.id, owned.skin), ...carImageSources(car)] : carImageSources(car)}
          alt={car.name}
          className="object-cover"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center pb-12">
              <CarIcon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        />
        {/* No Custom chip on a toggling card: its switch already says so. */}
        {/* Kept clear of the livery count, so a sale's tag wraps under a long
            pack name rather than sliding beneath it. */}
        <div className={cn(
          'absolute top-2 left-2 flex flex-wrap gap-1 [&>*]:shadow-sm',
          toggle ? 'right-28' : 'right-16',
        )}
        >
          <ProvenanceBadges provenance={car.provenance} carId={toggle ? undefined : car.id} />
          {deal ? <SaleBadge deal={deal} named /> : null}
        </div>
        {car.skins.length > 0 ? (
          <span
            title={t('cars.skins', { count: car.skins.length })}
            className={cn(
              'absolute top-2 inline-flex items-center gap-1 rounded-full bg-scrim/60 px-2 py-0.5 text-xs font-medium',
              'text-on-scrim backdrop-blur-sm',
              // Clear of the switch a toggling card wears in that corner.
              toggle ? 'right-16' : 'right-2',
            )}
          >
            <PaletteIcon className="size-3" />
            {formatNumber(car.skins.length)}
          </span>
        ) : null}
        <PosterCaption
          name={car.name}
          overline={(
            <>
              {isSafeSegment(car.id) ? (
                <span className="relative size-[18px] shrink-0 rounded-[4px] bg-on-scrim/90">
                  <ContentImage sources={[carBadgeUrl(car.id)]} alt="" className="object-contain p-px" fallback={null} />
                </span>
              ) : null}
              <span className="truncate">{car.brand ?? t('browse.unknown')}</span>
              {nation === null ? null : (
                <span title={formatNation(nation)} className="flex shrink-0"><NationFlag code={nation} /></span>
              )}
              {car.year === null ? null : <span className="ml-auto shrink-0 tabular-nums">{formatYear(car.year)}</span>}
            </>
          )}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
        <div className="flex flex-wrap gap-1 empty:hidden">
          <SpecBadge carId={car.id} />
        </div>

        <FigureLine figures={[
          { unit: t('cars.unitBhp'), value: figure(performance.bhp) },
          {
            unit: units.unit('weight'),
            value: performance.weightKg === null ? null : units.figure('weight', performance.weightKg),
          },
          { unit: t('cars.unitBhpPerTonne'), value: figure(performance.powerToWeight) },
        ]}
        />

        {trade?.mode === 'garage' ? <GarageFoot car={car} trade={trade} /> : (
          <div className="mt-auto pt-0.5">
            <RacedIn racing={racing} />
          </div>
        )}
        {trade && trade.mode !== 'garage' ? <PriceFoot car={car} trade={trade} /> : null}
        {priced ? <AppraiseFoot car={car} appraise={appraise} /> : null}
      </div>
      {buttons ? (
        <Link
          to={path.car({ id: car.id })}
          state={trade.mode === 'garage' ? { section: 'garage' } satisfies NavState : undefined}
          aria-label={car.name}
          className={CARD_COVER}
        />
      ) : null}
    </Card>
  );

  if (buttons) return card;

  if (toggle) {
    return (
      <ToggleCard
        checked={on}
        label={car.name}
        onChange={(next) => toggle.onToggle(car.id, next)}
        to={path.car({ id: car.id })}
        section={toggle.section}
        buttons={priced}
      >
        {card}
      </ToggleCard>
    );
  }

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(car)} className={CARD_LINK}>
        {card}
      </button>
    );
  }

  return <Link to={path.car({ id: car.id })} className={CARD_LINK}>{card}</Link>;
};
