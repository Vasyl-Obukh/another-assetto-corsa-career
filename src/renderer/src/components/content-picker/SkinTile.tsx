import { PaintbrushIcon, UserIcon } from 'lucide-react';

import type { Skin } from '../../../../shared/types';
import { CARD_LINK } from '@/components/browser/index.ts';
import { carPictureSources, ContentImage } from '@/components/content-image/index.ts';
import { LiveryPlate } from '@/components/LiveryPlate.tsx';
import { Card } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';

interface SkinTileProps {
  /**
   * Folder name of the car the livery belongs to.
   */
  carId: string;
  /**
   * The livery to draw.
   */
  skin: Skin;
  /**
   * Whether this livery is the current answer.
   */
  selected: boolean;
  /**
   * Called when the tile is picked.
   */
  onPick: () => void;
}

/**
 * One livery to pick: its photo with the racing number on a plate, as the car
 * page's carousel shows it, then its name and whoever the author credited.
 */
export const SkinTile = ({
  carId, skin, selected, onPick,
}: SkinTileProps) => {
  // Most of the base game credits nobody, so the line is left out rather than
  // filled with the folder name.
  const credit = [skin.driver, skin.team].filter((part): part is string => part !== null).join(' · ');

  return (
    <button
      type="button"
      onClick={onPick}
      className={CARD_LINK}
    >
      <Card className={cn(
        'hover-outline h-full gap-0 overflow-hidden py-0',
        '[contain-intrinsic-size:auto_14rem] [content-visibility:auto]',
        selected && '[--outline-rest:var(--color-primary)]',
      )}
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
          <ContentImage
            sources={carPictureSources(carId, skin.id)}
            alt={skin.name}
            className="object-cover"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <PaintbrushIcon className="size-10 text-muted-foreground/40" />
              </div>
            )}
          />
          {skin.number === null ? null : <LiveryPlate number={skin.number} className="absolute top-2 left-2" />}
        </div>

        <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2.5">
          <span className="truncate text-sm font-semibold" title={skin.name}>{skin.name}</span>
          {credit === '' ? null : (
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground" title={credit}>
              <UserIcon className="size-3 shrink-0" />
              <span className="truncate">{credit}</span>
            </span>
          )}
        </div>
      </Card>
    </button>
  );
};
