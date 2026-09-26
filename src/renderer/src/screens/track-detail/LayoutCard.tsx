import { MapIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CircuitChampionship } from './types.ts';
import { byDiscipline } from './utils.ts';
import type { Track } from '../../../../shared/types';
import { CARD_LINK, ContentImage, DistributorBadge } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_DOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { kilometres, layoutMapSources } from '@/screens/track-browser';

interface LayoutCardProps {
  /**
   * The layout.
   */
  layout: Track;
  /**
   * What the card calls it, with the circuit's name taken off.
   */
  name: string;
  /**
   * The championships racing it, or null while the library loads.
   */
  racing: readonly CircuitChampionship[] | null;
  /**
   * Whether to say which way round it runs, for a circuit whose layouts differ
   * in it - the one thing that tells a reversed layout from its original.
   */
  showRun: boolean;
  /**
   * Whether the page is turned to it.
   */
  selected: boolean;
  /**
   * Turns the page to it, or back to the whole circuit when it already is.
   */
  onToggle: () => void;
}

/**
 * One layout of a circuit: its shape, its figures and how many championships
 * race it, as a toggle that turns the whole page to it.
 */
export const LayoutCard = ({
  layout, name, racing, showRun, selected, onToggle,
}: LayoutCardProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const figures = [
    layout.lengthM === null ? null : t('tracks.detail.km', { value: kilometres(layout.lengthM, formatNumber) }),
    layout.pitboxes === null ? null : t('tracks.pitboxes', { count: layout.pitboxes }),
    showRun && layout.run !== null ? t(`tracks.detail.run.${layout.run}`) : null,
  ].filter((figure): figure is string => figure !== null);
  let raced = t('common.dash');
  if (racing !== null && racing.length > 0) raced = t('tracks.detail.championships', { count: racing.length });
  else if (racing !== null) raced = t('tracks.detail.noChampionship');

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={CARD_LINK}
    >
      <Card className={cn(
        'hover-outline h-full gap-0 overflow-hidden py-0',
        selected && 'border-primary ring-1 ring-primary',
      )}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 bg-muted">
          <ContentImage
            sources={layoutMapSources(layout)}
            alt={layout.name}
            className="object-contain px-4 py-3 [&[src*='/outline']]:brightness-0 dark:[&[src*='/outline']]:invert"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <MapIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {layout.provenance.distributor === null ? null : (
              <DistributorBadge distributor={layout.provenance.distributor} />
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1 p-3">
          <span className="truncate text-sm font-semibold" title={layout.name}>{name}</span>
          {/* Wraps rather than truncating, so a long figure is never cut off. */}
          <span className="text-xs text-muted-foreground tabular-nums">
            {figures.join(t('tracks.detail.figureSeparator'))}
          </span>
          <span className={cn(
            'mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground',
            racing !== null && racing.length > 0 && 'text-foreground',
          )}
          >
            <TrophyIcon className="size-3 shrink-0" />
            <span className="truncate">{raced}</span>
            {/* A dot per discipline racing it, in that discipline's colour. */}
            <span className="ml-auto flex gap-1">
              {byDiscipline(racing ?? []).map(({ discipline }) => (
                <i
                  key={discipline}
                  aria-hidden
                  className={cn('size-2 rounded-full', DISCIPLINE_DOT[discipline])}
                />
              ))}
            </span>
          </span>
        </div>
      </Card>
    </button>
  );
};
