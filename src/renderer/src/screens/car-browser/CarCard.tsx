import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { carImageSources, roundRatio } from './utils.ts';
import type { Car } from '../../../../shared/types';
import { ContentImage, ProvenanceBadges, SpecBadge } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface CarCardProps {
  /**
   * The car to show.
   */
  car: Car;
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
}

export const CarCard = ({ car, onSelect, selected = false }: CarCardProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatYear } = useFormat();

  const { performance } = car;

  // A parsed number where there is one, the author's own words where there is
  // not, and nothing at all otherwise - the row wraps, so a gap is invisible.
  const figures = [
    performance.bhp !== null ? t('cars.bhp', { value: formatNumber(performance.bhp) }) : performance.raw.bhp,
    performance.weightKg !== null
      ? t('cars.weightKg', { value: formatNumber(performance.weightKg) })
      : performance.raw.weight,
    performance.powerToWeight !== null
      ? t('cars.powerToWeight', { value: formatNumber(roundRatio(performance.powerToWeight)) })
      : null,
  ].filter((figure): figure is string => typeof figure === 'string' && figure.trim() !== '');

  const card = (
    <Card className={cn(
      'h-full gap-0 overflow-hidden py-0 transition-[box-shadow,border-color] hover:border-primary',
      'hover:shadow-[0_0_20px_2px] hover:shadow-primary/55',
      '[contain-intrinsic-size:auto_18rem] [content-visibility:auto]',
      selected && 'border-primary shadow-[0_0_20px_2px] shadow-primary/55',
    )}
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={carImageSources(car)}
          alt={car.name}
          className="object-cover"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center">
              <CarIcon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium" title={car.name}>{car.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {car.brand ?? t('browse.unknown')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          <ProvenanceBadges provenance={car.provenance} />
          {car.year !== null ? (
            <Badge variant="outline">{formatYear(car.year)}</Badge>
          ) : null}
          <SpecBadge carId={car.id} />
        </div>

        {figures.length > 0 ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {figures.map((figure) => <span key={figure}>{figure}</span>)}
          </div>
        ) : null}

        <span className="text-xs text-muted-foreground/70">
          {car.skins.length === 0 ? t('cars.noSkins') : t('cars.skins', { count: car.skins.length })}
        </span>
      </div>
    </Card>
  );

  const wrapper = 'block w-full rounded-xl text-left focus-visible:ring-[3px] '
    + 'focus-visible:ring-ring/50 focus-visible:outline-none';

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(car)} className={wrapper}>
        {card}
      </button>
    );
  }

  return <Link to={path.car({ id: car.id })} className={wrapper}>{card}</Link>;
};
