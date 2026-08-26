import { PaintbrushIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { skinImageSources } from './utils.ts';
import type { Skin } from '../../../../shared/types';
import { ContentImage } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';

interface SkinCardProps {
  /**
   * Folder name of the car the livery belongs to.
   */
  carId: string;
  /**
   * The livery to show.
   */
  skin: Skin;
}

export const SkinCard = ({ carId, skin }: SkinCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="gap-0 overflow-hidden py-0 [contain-intrinsic-size:auto_16rem] [content-visibility:auto]">
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

      <div className="flex min-w-0 flex-col gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium" title={skin.name}>{skin.name}</span>
          {/* Most of the base game names no driver at all, so a placeholder here
              would be a line of noise on every card of a Kunos car. */}
          {skin.driver !== null ? (
            <span className="truncate text-xs text-muted-foreground" title={skin.driver}>
              {skin.driver}
            </span>
          ) : null}
        </div>

        {skin.number !== null || skin.team !== null || skin.country !== null ? (
          <div className="flex flex-wrap gap-1">
            {skin.number !== null ? (
              <Badge variant="secondary">{t('cars.detail.number', { value: skin.number })}</Badge>
            ) : null}
            {skin.team !== null ? <Badge variant="outline">{skin.team}</Badge> : null}
            {skin.country !== null ? <Badge variant="outline">{skin.country}</Badge> : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
};
