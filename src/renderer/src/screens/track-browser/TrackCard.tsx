import { MapIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isLocated, trackImageSources } from './utils.ts';
import type { Track } from '../../../../shared/types';
import { ContentImage } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';

interface TrackCardProps {
  /**
   * The layout to show.
   */
  track: Track;
}

export const TrackCard = ({ track }: TrackCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="gap-0 overflow-hidden py-0 [contain-intrinsic-size:auto_18rem] [content-visibility:auto]">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={trackImageSources(track)}
          alt={track.name}
          // The second source is an outline: black on transparent, so it
          // disappears in the dark theme without being inverted.
          className="object-cover [&[src*='/outline']]:object-contain [&[src*='/outline']]:p-4 dark:[&[src*='/outline']]:invert"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center">
              <MapIcon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium" title={track.name}>{track.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {track.country ?? t('browse.unknown')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {track.layout === '' ? null : (
            <Badge variant="secondary" title={track.layout}>{track.layout}</Badge>
          )}
          <Badge variant="outline">
            {track.pitboxes === null
              ? t('tracks.unknownPitboxes')
              : t('tracks.pitboxes', { count: track.pitboxes })}
          </Badge>
          {isLocated(track) ? (
            <Badge variant="outline">
              <MapPinIcon />
              {t('tracks.located')}
            </Badge>
          ) : null}
        </div>
      </div>
    </Card>
  );
};
