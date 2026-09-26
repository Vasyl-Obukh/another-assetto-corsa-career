import { CarIcon, PaletteIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { carImageSources } from './utils.ts';
import type { Car } from '../../../../shared/types';
import { carBadgeUrl, isSafeSegment } from '../../../../shared/utils/content-url';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  CARD_LINK, ContentImage, FigureLine, NationFlag, PosterCaption, ProvenanceBadges, RacedIn, SpecBadge, ToggleCard,
} from '@/components';
import type { BrowserToggle } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import type { Racing } from '@/lib/racing-index';
import { path } from '@/lib/routes';
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
}

/**
 * A car as a poster: its name and maker over the photograph, with what tells
 * one car from another below it.
 */
export const CarCard = ({
  car, racing, onSelect, selected = false, toggle,
}: CarCardProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber, formatYear } = useFormat();

  const { performance } = car;
  const on = toggle?.isOn(car.id) ?? false;
  const nation = nationOfCountry(car.country);
  const figure = (value: number | null): string | null => (value === null ? null : formatNumber(Math.round(value)));

  const card = (
    <Card className={cn(
      'hover-outline h-full gap-0 overflow-hidden py-0',
      '[contain-intrinsic-size:auto_22rem] [content-visibility:auto]',
      selected && '[--outline-rest:var(--color-primary)]',
      on && 'border-primary',
    )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={carImageSources(car)}
          alt={car.name}
          className="object-cover"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center pb-12">
              <CarIcon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        />
        {/* No Custom chip on a toggling card: its switch already says so. */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 [&>*]:shadow-sm">
          <ProvenanceBadges provenance={car.provenance} carId={toggle ? undefined : car.id} />
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
          { unit: t('cars.unitKg'), value: figure(performance.weightKg) },
          { unit: t('cars.unitBhpPerTonne'), value: figure(performance.powerToWeight) },
        ]}
        />

        <div className="mt-auto pt-0.5">
          <RacedIn racing={racing} />
        </div>
      </div>
    </Card>
  );

  if (toggle) {
    return (
      <ToggleCard
        checked={on}
        label={car.name}
        onChange={(next) => toggle.onToggle(car.id, next)}
        to={path.car({ id: car.id })}
        section={toggle.section}
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
