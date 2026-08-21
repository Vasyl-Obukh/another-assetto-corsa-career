import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { carImageSources, roundRatio, visibleTags } from './utils.ts';
import type { Car } from '../../../../shared/types';
import { ContentImage } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';

interface CarCardProps {
  /**
   * The car to show.
   */
  car: Car;
}

export const CarCard = ({ car }: CarCardProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatYear } = useFormat();

  const { shown, extra } = visibleTags(car.tags);
  const { specs } = car;

  // A parsed number where there is one, the author's own words where there is
  // not, and nothing at all otherwise - the row wraps, so a gap is invisible.
  const figures = [
    specs.bhp !== null ? t('cars.bhp', { value: formatNumber(specs.bhp) }) : specs.raw.bhp,
    specs.weightKg !== null
      ? t('cars.weightKg', { value: formatNumber(specs.weightKg) })
      : specs.raw.weight,
    specs.powerToWeight !== null
      ? t('cars.powerToWeight', { value: formatNumber(roundRatio(specs.powerToWeight)) })
      : null,
  ].filter((figure): figure is string => typeof figure === 'string' && figure.trim() !== '');

  return (
    <Card className="gap-0 overflow-hidden py-0 [contain-intrinsic-size:auto_18rem] [content-visibility:auto]">
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
          {car.year !== null ? (
            <Badge variant="outline">{formatYear(car.year)}</Badge>
          ) : null}
          {car.carClass !== null ? (
            <Badge variant="secondary">{car.carClass}</Badge>
          ) : null}
          {shown.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
          {extra > 0 ? (
            <Badge variant="outline">{t('cars.moreTags', { count: extra })}</Badge>
          ) : null}
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
};
