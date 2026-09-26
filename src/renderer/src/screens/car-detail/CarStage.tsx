import {
  CarIcon, ChevronLeftIcon, ChevronRightIcon, PaletteIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
import { carBadgeUrl, isSafeSegment } from '../../../../shared/utils/content-url';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  carPictureSources, ContentImage, LiveryPlate, NationFlag, ProvenanceBadges, SpecBadge,
} from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { carImageSources } from '@/screens/car-browser';

interface CarStageProps {
  /**
   * The car on show.
   */
  car: Car;
  /**
   * Which of its liveries is on the photograph.
   */
  index: number;
  /**
   * Shows another livery.
   * @param next Its position in the car's list
   */
  onIndex: (next: number) => void;
}

/**
 * The previous and next arrows over the photograph, either side of it.
 */
const ARROW = cn(
  'absolute top-[42%] z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full',
  'bg-scrim/55 text-on-scrim backdrop-blur-sm transition-colors hover:bg-scrim/75',
);

/**
 * The car as a wide photograph that steps through its liveries, named over the
 * picture like the browser's poster cards, with every livery as a thumbnail
 * along the bottom.
 */
export const CarStage = ({ car, index, onIndex }: CarStageProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber, formatYear } = useFormat();
  const strip = useRef<HTMLDivElement>(null);

  const { skins } = car;
  const skin = skins.at(index);
  const many = skins.length > 1;
  const nation = nationOfCountry(car.country);
  const credit = [skin?.driver, skin?.team].filter((part): part is string => !!part).join(' · ');

  const step = (by: number): void => onIndex((index + by + skins.length) % skins.length);

  // Keeps the chosen thumbnail in view when the arrows walk past the strip's edge.
  useEffect(() => {
    strip.current?.children.item(index)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div
        role="group"
        aria-roledescription={t('cars.detail.carousel')}
        aria-label={car.name}
        className="relative aspect-[5/2] bg-muted lg:aspect-[21/8]"
      >
        <ContentImage
          key={skin?.id ?? ''}
          sources={skin ? carPictureSources(car.id, skin.id) : carImageSources(car)}
          alt={skin?.name ?? car.name}
          className="object-cover object-[center_60%]"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center pb-16">
              <CarIcon className="size-12 text-muted-foreground/40" />
            </div>
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-scrim/90 via-scrim/45 to-transparent"
        />

        {many ? (
          <>
            <button type="button" className={cn(ARROW, 'left-3')} aria-label={t('cars.detail.previous')} onClick={() => step(-1)}>
              <ChevronLeftIcon className="size-5" />
            </button>
            <button type="button" className={cn(ARROW, 'right-3')} aria-label={t('cars.detail.next')} onClick={() => step(1)}>
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        ) : null}

        {skins.length > 0 ? (
          <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-scrim/60 px-2.5 py-1 text-xs text-on-scrim tabular-nums backdrop-blur-sm">
            <PaletteIcon className="size-3" />
            {t('cars.detail.liveryCount', { shown: formatNumber(index + 1), total: formatNumber(skins.length) })}
          </span>
        ) : null}

        <div className="absolute bottom-4 left-5 flex max-w-[60%] flex-col gap-1.5 text-on-scrim">
          <div className="flex min-w-0 items-center gap-2 text-sm text-on-scrim/90">
            {isSafeSegment(car.id) ? (
              <span className="relative size-[22px] shrink-0 rounded-[5px] bg-on-scrim/90">
                <ContentImage sources={[carBadgeUrl(car.id)]} alt="" className="object-contain p-px" fallback={null} />
              </span>
            ) : null}
            <span className="truncate">{car.brand ?? t('browse.unknown')}</span>
            {nation === null ? null : (
              <span title={formatNation(nation)} className="flex shrink-0"><NationFlag code={nation} /></span>
            )}
            {car.year === null ? null : <span className="shrink-0 tabular-nums">{formatYear(car.year)}</span>}
          </div>
          <h1 className="line-clamp-2 text-2xl leading-tight font-semibold tracking-tight [text-shadow:0_1px_3px_var(--scrim)] lg:text-3xl">
            {car.name}
          </h1>
          <div className="flex flex-wrap gap-1 [&>*]:shadow-sm">
            <ProvenanceBadges provenance={car.provenance} carId={car.id} />
            <SpecBadge carId={car.id} />
          </div>
        </div>

        {skin ? (
          <div className="absolute right-5 bottom-4 flex max-w-[36%] items-center gap-2.5 text-right text-on-scrim">
            <div className="flex min-w-0 flex-col items-end">
              <span className="max-w-full truncate text-sm font-semibold" title={skin.name}>{skin.name}</span>
              {credit === '' ? null : (
                <span className="max-w-full truncate text-xs text-on-scrim/85" title={credit}>{credit}</span>
              )}
            </div>
            {skin.number === null ? null : <LiveryPlate number={skin.number} />}
          </div>
        ) : null}
      </div>

      {many ? (
        <div
          ref={strip}
          className="grid auto-cols-[7rem] grid-flow-col gap-1 overflow-x-auto p-1 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]"
        >
          {skins.map((one, at) => (
            <button
              key={one.id}
              type="button"
              title={one.name}
              aria-label={t('cars.detail.showLivery', { name: one.name })}
              aria-current={at === index}
              onClick={() => onIndex(at)}
              className={cn(
                'relative aspect-video overflow-hidden rounded-md border-2 bg-muted transition-colors',
                at === index ? 'border-primary' : 'border-transparent hover:border-primary/50',
              )}
            >
              <ContentImage sources={carPictureSources(car.id, one.id)} alt="" className="object-cover" fallback={null} />
              {one.number === null ? null : (
                <LiveryPlate number={one.number} className="absolute top-1 left-1 h-4 min-w-5 rounded px-1 text-[10.5px]" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
};
