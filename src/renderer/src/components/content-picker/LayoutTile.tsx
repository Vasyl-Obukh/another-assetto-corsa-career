import { MapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Track } from '../../../../shared/types';
import { ContentImage } from '@/components/content-image/index.ts';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { layoutMapSources } from '@/screens/track-browser';

interface LayoutTileProps {
  /**
   * The layout to draw.
   */
  layout: Track;
  /**
   * Whether this layout is the current answer.
   */
  selected: boolean;
  /**
   * Called when the tile is picked.
   */
  onPick: () => void;
}

export const LayoutTile = ({ layout, selected, onPick }: LayoutTileProps) => {
  const { t } = useTranslation();
  const { formatDistance } = useFormat();

  const figures = [
    layout.lengthM === null ? null : formatDistance(layout.lengthM),
    layout.pitboxes === null ? null : t('tracks.pitboxes', { count: layout.pitboxes }),
  ].filter((figure): figure is string => figure !== null);

  return (
    <button
      type="button"
      onClick={onPick}
      className="block w-full rounded-xl text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className={cn(
        'h-full gap-0 overflow-hidden py-0 transition-[box-shadow,border-color]',
        'hover:border-primary hover:shadow-[0_0_20px_2px] hover:shadow-primary/55',
        selected && 'border-primary shadow-[0_0_20px_2px] shadow-primary/55',
      )}
      >
        {/* The map, not the photograph: every layout of a circuit shares the
            same pit straight. The outline is black on transparent, so the dark
            theme inverts it. */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
          <ContentImage
            sources={layoutMapSources(layout)}
            alt={layout.name}
            className="object-contain p-3 dark:[&[src*='/outline']]:invert"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <MapIcon className="size-10 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-0.5 p-3">
          <span className="truncate text-sm font-medium" title={layout.name}>{layout.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {figures.length > 0 ? figures.join(' - ') : layout.layout}
          </span>
        </div>
      </Card>
    </button>
  );
};
