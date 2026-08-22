import { MapIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isLocated, pitboxRange, trackImageSources } from './utils.ts';
import type { TrackGroup } from '../../../../shared/types';
import { ContentImage, ProvenanceBadges } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';

interface TrackCardProps {
  /**
   * The track to show, holding the layouts that matched the filters.
   */
  group: TrackGroup;
}

export const TrackCard = ({ group }: TrackCardProps) => {
  const { t } = useTranslation();

  // Layouts of one circuit disagree about grid size - an LFM pit lane holds 48
  // where Kunos' holds 24 - so the badge spans them rather than picking one.
  const pitboxes = pitboxRange(group);
  let pitboxLabel = t('tracks.unknownPitboxes');
  if (pitboxes !== null) {
    pitboxLabel = pitboxes.from === pitboxes.to
      ? t('tracks.pitboxes', { count: pitboxes.to })
      : t('tracks.pitboxesRange', pitboxes);
  }

  return (
    <Card className="gap-0 overflow-hidden py-0 [contain-intrinsic-size:auto_18rem] [content-visibility:auto]">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={trackImageSources(group)}
          alt={group.name}
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
          <span className="truncate font-medium" title={group.name}>{group.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {group.country ?? t('browse.unknown')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          <ProvenanceBadges provenance={group.provenance} />
          {group.layouts.length > 1 ? (
            <Badge variant="secondary">
              {t('tracks.layouts', { count: group.layouts.length })}
            </Badge>
          ) : null}
          <Badge variant="outline">{pitboxLabel}</Badge>
          {isLocated(group) ? (
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
