import {
  CheckIcon, MapIcon, RotateCcwIcon, RotateCwIcon, TriangleAlertIcon, TrophyIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Track } from '../../../../shared/types';
import { CARD_LINK } from '@/components/browser/index.ts';
import { ContentImage } from '@/components/content-image/index.ts';
import { DistributorBadge } from '@/components/provenance-badges/index.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_DOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { kilometres, layoutImageSources, layoutOutline } from '@/screens/track-browser';
import type { CircuitChampionship } from '@/screens/track-detail';
import { byDiscipline } from '@/screens/track-detail';

interface LayoutTileProps {
  /**
   * The layout to draw.
   */
  layout: Track;
  /**
   * What the tile calls it, with the circuit's name taken off.
   */
  name: string;
  /**
   * The championships racing it, or null while the library loads.
   */
  racing: readonly CircuitChampionship[] | null;
  /**
   * How many cars the race puts on the grid, when the caller knows.
   */
  gridSize?: number;
  /**
   * Whether this layout is the current answer.
   */
  selected: boolean;
  /**
   * Called when the tile is picked.
   */
  onPick: () => void;
}

/**
 * One layout to choose: its shape large, with its own photograph inset, and
 * what tells it apart - length, pit boxes, which way round, who redistributes
 * it and which championships race it. Too few pit boxes for the grid is
 * flagged rather than hidden, since the user may mean to shrink the field.
 */
export const LayoutTile = ({
  layout, name, racing, gridSize, selected, onPick,
}: LayoutTileProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const outline = layoutOutline(layout);
  const [photo] = layoutImageSources(layout);
  const cramped = gridSize !== undefined && layout.pitboxes !== null && layout.pitboxes < gridSize;
  const RunIcon = layout.run === 'anticlockwise' ? RotateCcwIcon : RotateCwIcon;

  return (
    <button
      type="button"
      onClick={onPick}
      className={CARD_LINK}
    >
      <Card className={cn(
        'hover-outline h-full gap-0 overflow-hidden py-0',
        selected && '[--outline-rest:var(--color-primary)]',
      )}
      >
        {/* The map, not the photograph: every layout of a circuit shares the
            same pit straight. Flattened to the text colour, whatever colour
            the mod drew it in. */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
          {outline === null ? null : (
            <ContentImage
              sources={[outline]}
              alt={layout.name}
              className="object-contain px-4.5 pt-4 pb-6 brightness-0 dark:invert"
              fallback={(
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapIcon className="size-10 text-muted-foreground/40" />
                </div>
              )}
            />
          )}
          {photo === undefined ? null : (
            <span className="absolute right-2 bottom-2 aspect-video w-[34%] overflow-hidden rounded-md shadow-md">
              <ContentImage sources={[photo]} alt="" className="object-cover" fallback={null} />
            </span>
          )}
          <div className="absolute inset-x-2 top-2 flex flex-wrap items-start gap-1">
            {layout.provenance.distributor === null ? null : (
              <DistributorBadge distributor={layout.provenance.distributor} />
            )}
            {cramped ? (
              <Badge variant="warning" title={t('race.pick.tooFewHint')}>
                <TriangleAlertIcon />
                {t('race.pick.tooFew', { pits: formatNumber(layout.pitboxes ?? 0), cars: formatNumber(gridSize) })}
              </Badge>
            ) : null}
            {selected ? (
              <Badge className="ml-auto">
                <CheckIcon />
                {t('race.pick.current')}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5 p-3">
          <span className="truncate text-sm font-semibold" title={layout.name}>{name}</span>
          <div className="flex items-center text-xs text-muted-foreground tabular-nums [&>span+span]:ml-2 [&>span+span]:border-l [&>span+span]:pl-2">
            {layout.lengthM === null ? null : (
              <span>{t('tracks.detail.km', { value: kilometres(layout.lengthM, formatNumber) })}</span>
            )}
            {layout.pitboxes === null ? null : <span>{t('tracks.pitboxes', { count: layout.pitboxes })}</span>}
            {layout.run === null ? null : (
              <span className="inline-flex items-center gap-1">
                <RunIcon className="size-3" />
                {t(`tracks.detail.run.${layout.run}`)}
              </span>
            )}
          </div>
          <span className={cn(
            'flex items-center gap-1.5 text-xs text-muted-foreground',
            racing !== null && racing.length > 0 && 'text-foreground',
          )}
          >
            <TrophyIcon className="size-3 shrink-0" />
            <span className="truncate">
              {racing === null ? t('common.dash') : null}
              {racing !== null && racing.length > 0 ? t('race.pick.racedBy', { count: racing.length }) : null}
              {racing !== null && racing.length === 0 ? t('race.pick.racedNone') : null}
            </span>
            <span className="flex shrink-0 gap-1">
              {byDiscipline(racing ?? []).map(({ discipline }) => (
                <i key={discipline} aria-hidden className={cn('size-2 rounded-full', DISCIPLINE_DOT[discipline])} />
              ))}
            </span>
          </span>
        </div>
      </Card>
    </button>
  );
};
