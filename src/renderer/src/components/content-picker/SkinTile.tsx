import { PaintbrushIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Skin } from '../../../../shared/types';
import { ContentImage } from '@/components/content-image/index.ts';
import { Card } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';
import { skinImageSources } from '@/screens/car-detail';

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

export const SkinTile = ({
  carId, skin, selected, onPick,
}: SkinTileProps) => {
  const { t } = useTranslation();

  // Whoever the author named, in the order a car is identified on track. Most
  // of the base game names none of them, so the folder stands in.
  const figures = [
    skin.number === null ? null : t('cars.detail.number', { value: skin.number }),
    skin.team,
    skin.driver,
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
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
          <ContentImage
            sources={skinImageSources(carId, skin)}
            alt={skin.name}
            className="object-cover"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <PaintbrushIcon className="size-10 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-0.5 p-3">
          <span className="truncate text-sm font-medium" title={skin.name}>{skin.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {figures.length > 0 ? figures.join(' - ') : skin.id}
          </span>
        </div>
      </Card>
    </button>
  );
};
