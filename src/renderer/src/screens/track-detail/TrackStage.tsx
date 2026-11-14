import {
  ChevronLeftIcon, ChevronRightIcon, ImageIcon, MapIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { StagePhoto } from './types.ts';
import {
  circuitLogo, circuitPlace, layoutShortName, longestLayout,
} from './utils.ts';
import type { Track, TrackGroup } from '../../../../shared/types';
import {
  ContentImage, NationFlag, ProvenanceBadges,
} from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { layoutOutline } from '@/screens/track-browser';

interface TrackStageProps {
  /**
   * The circuit on show.
   */
  circuit: TrackGroup;
  /**
   * The layout the page is turned to, or null for the whole circuit.
   */
  layout: Track | null;
  /**
   * The pictures to step through.
   */
  photos: readonly StagePhoto[];
  /**
   * Which of them is showing.
   */
  index: number;
  /**
   * Shows another picture.
   * @param next Its position in the list
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
 * The circuit as a wide photograph that steps through its loading-screen
 * pictures, named over the picture the way the car page is, with the shape of
 * the layout in view on a plate beside it.
 */
export const TrackStage = ({
  circuit, layout, photos, index, onIndex,
}: TrackStageProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber } = useFormat();
  const units = useUnits();
  const strip = useRef<HTMLDivElement>(null);

  const photo = photos.at(index);
  const many = photos.length > 1;
  const { nation, place } = circuitPlace(circuit, formatNation, t);
  const logo = circuitLogo(circuit);
  const shown = layout ?? longestLayout(circuit);
  const outline = layoutOutline(shown);

  const step = (by: number): void => onIndex((index + by + photos.length) % photos.length);

  useEffect(() => {
    strip.current?.children.item(index)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div
        role="group"
        aria-roledescription={t('tracks.detail.carousel')}
        aria-label={circuit.name}
        className="relative aspect-[5/2] overflow-hidden bg-muted lg:aspect-[21/8]"
      >
        {photo ? (
          <ContentImage
            key={photo.key}
            sources={[...photo.sources]}
            alt={circuit.name}
            // A preview is a few hundred pixels wide; softened, it reads as a
            // backdrop rather than as a blurry photograph.
            className={cn('object-cover', photo.soft && 'scale-[1.02] blur-[1.5px]')}
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center pb-16">
                <MapIcon className="size-12 text-muted-foreground/40" />
              </div>
            )}
          />
        ) : null}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-t from-scrim/90 via-scrim/40 via-45% to-transparent to-75%',
            photo?.soft && 'via-scrim/55 to-scrim/30',
          )}
        />

        {many ? (
          <>
            <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-scrim/60 px-2.5 py-1 text-xs text-on-scrim tabular-nums backdrop-blur-sm">
              <ImageIcon className="size-3" />
              {t('tracks.detail.photoCount', { shown: formatNumber(index + 1), total: formatNumber(photos.length) })}
            </span>
            <button type="button" className={cn(ARROW, 'left-3')} aria-label={t('tracks.detail.previous')} onClick={() => step(-1)}>
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              className={cn(ARROW, 'right-[calc(30%+1.75rem)]')}
              aria-label={t('tracks.detail.next')}
              onClick={() => step(1)}
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        ) : null}

        <div className="absolute bottom-4 left-5 flex max-w-[58%] flex-col gap-1.5 text-on-scrim">
          <div className="flex min-w-0 items-center gap-2 text-sm text-on-scrim/90">
            {logo === null ? null : (
              <span className="relative size-[26px] shrink-0 rounded-[5px] bg-on-scrim/90">
                <ContentImage sources={[logo]} alt="" className="object-contain p-px" fallback={null} />
              </span>
            )}
            {nation === null ? null : <span className="flex shrink-0"><NationFlag code={nation} /></span>}
            <span className="truncate">{place ?? t('browse.unknown')}</span>
          </div>
          <h1 className="line-clamp-2 text-2xl leading-tight font-semibold tracking-tight [text-shadow:0_1px_3px_var(--scrim)] lg:text-3xl">
            {circuit.name}
          </h1>
          <div className="flex flex-wrap gap-1 [&>*]:shadow-sm">
            <ProvenanceBadges provenance={circuit.provenance} trackId={circuit.id} />
          </div>
        </div>

        {/* The shape, drawn in the scrim's own text colour whatever colour the
            mod drew it in - the same flattening the browser's cards do. */}
        <div className="absolute top-4 right-4 bottom-4 flex w-[30%] flex-col rounded-xl bg-scrim/55 px-3 py-2.5 text-on-scrim backdrop-blur-sm">
          <div className="relative min-h-0 flex-1">
            {outline === null ? null : (
              <ContentImage
                key={shown.key}
                sources={[outline]}
                alt={shown.name}
                className="object-contain p-2 brightness-0 invert"
                fallback={(
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapIcon className="size-10 opacity-40" />
                  </div>
                )}
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="truncate font-semibold" title={shown.name}>{layoutShortName(shown, circuit.name)}</span>
            {shown.lengthM === null ? null : (
              <span className="ml-auto shrink-0 tabular-nums opacity-80">
                {units.formatLap(shown.lengthM)}
              </span>
            )}
          </div>
        </div>
      </div>

      {many && !photos[0]?.soft ? (
        <div
          ref={strip}
          className="grid auto-cols-[7rem] grid-flow-col justify-start gap-1 overflow-x-auto p-1 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]"
        >
          {photos.map((one, at) => (
            <button
              key={one.key}
              type="button"
              aria-label={t('tracks.detail.showPhoto', { number: formatNumber(at + 1) })}
              aria-current={at === index}
              onClick={() => onIndex(at)}
              className={cn(
                'relative aspect-video overflow-hidden rounded-md border-2 bg-muted transition-colors',
                at === index ? 'border-primary' : 'border-transparent hover:border-primary/50',
              )}
            >
              <ContentImage sources={[...one.sources]} alt="" className="object-cover" fallback={null} />
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
};
