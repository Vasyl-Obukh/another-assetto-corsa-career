import { MapIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Track } from '../../../../shared/types';
import { ContentImage, ProvenanceBadges, TrackPicker } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { layoutMapSources } from '@/screens/track-browser';

interface TrackFieldProps {
  /**
   * The layout the race names, or null when it names none or names one that is
   * not installed.
   */
  track: Track | null;
  /**
   * Whether the weekend has started, in which case the track cannot change.
   */
  locked: boolean;
  /**
   * Called with the layout the user picked.
   * @param layout The chosen layout
   */
  onPick: (layout: Track) => void;
}

export const TrackField = ({ track, locked, onPick }: TrackFieldProps) => {
  const { t } = useTranslation();
  const { formatDistance } = useFormat();
  const [picking, setPicking] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.track.label')}</CardTitle>
      </CardHeader>

      <CardContent className="flex items-start gap-4">
        <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-md bg-muted">
          {track ? (
            <ContentImage
              sources={layoutMapSources(track)}
              alt={track.name}
              className="object-contain p-2 dark:[&[src*='/outline']]:invert"
              fallback={(
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapIcon className="size-8 text-muted-foreground/40" />
                </div>
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapIcon className="size-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {track ? (
            <>
              <span className="truncate font-medium" title={track.name}>{track.name}</span>
              <div className="flex flex-wrap gap-1">
                <ProvenanceBadges provenance={track.provenance} trackId={track.id} />
                {track.lengthM === null ? null : (
                  <Badge variant="outline">{formatDistance(track.lengthM)}</Badge>
                )}
                <Badge variant="outline">
                  {track.pitboxes === null
                    ? t('tracks.unknownPitboxes')
                    : t('tracks.pitboxes', { count: track.pitboxes })}
                </Badge>
              </div>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{t('race.track.none')}</span>
          )}

          <div>
            <Button
              type="button"
              size="sm"
              variant={track ? 'outline' : 'default'}
              disabled={locked}
              onClick={() => setPicking(true)}
            >
              {track ? t('race.track.change') : t('race.track.pick')}
            </Button>
          </div>
        </div>
      </CardContent>

      <TrackPicker
        open={picking}
        selectedKey={track?.key}
        onOpenChange={setPicking}
        onPick={onPick}
      />
    </Card>
  );
};
