import { MapIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LAP_DIGITS } from './constants.ts';
import type { Track } from '../../../../shared/types';
import { ContentImage, ProvenanceBadges, TrackPicker } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { layoutImageSources, layoutOutline } from '@/screens/track-browser';

interface TrackCardProps {
  /**
   * The layout the race names, or null while it names none or names one that
   * is not installed.
   */
  track: Track | null;
  /**
   * How many cars the classes put on the grid, which the picker warns a layout
   * with fewer pit boxes about.
   */
  gridSize: number;
  /**
   * Whether the event has started, in which case the track cannot change.
   */
  locked: boolean;
  /**
   * Called with the layout picked.
   * @param layout The layout
   */
  onPick: (layout: Track) => void;
}

/**
 * Where a race event runs: the layout's shape with its photograph inset, as
 * the picker's own tiles draw it, its figures and the way to change it.
 */
export const TrackCard = ({
  track, gridSize, locked, onPick,
}: TrackCardProps) => {
  const { t } = useTranslation();
  const units = useUnits();
  const [picking, setPicking] = useState(false);
  const outline = track ? layoutOutline(track) : null;
  const [photo] = track ? layoutImageSources(track) : [];
  const cramped = track?.pitboxes != null && track.pitboxes < gridSize;

  return (
    <Card className="gap-2.5 p-3">
      <div className="flex items-center gap-2">
        <span className="flex-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('race.track.label')}</span>
        {track && !locked ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setPicking(true)}>
            {t('race.track.change')}
          </Button>
        ) : null}
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
        {outline === null ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapIcon className="size-8 text-muted-foreground/40" />
          </div>
        ) : (
          <ContentImage
            sources={[outline]}
            alt={track?.name ?? ''}
            className="object-contain px-6 pt-4 pb-6 brightness-0 dark:invert"
            fallback={null}
          />
        )}
        {photo === undefined ? null : (
          <span className="absolute right-2 bottom-2 aspect-video w-[34%] overflow-hidden rounded-md shadow-md">
            <ContentImage sources={[photo]} alt="" className="object-cover" fallback={null} />
          </span>
        )}
      </div>

      {track ? (
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="truncate font-medium" title={track.name}>{track.name}</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <ProvenanceBadges provenance={track.provenance} trackId={track.id} />
            {track.lengthM === null ? null : (
              <span>{units.formatLap(track.lengthM, LAP_DIGITS)}</span>
            )}
            {track.pitboxes === null ? null : (
              // Amber where the classes hold more cars than the pits do.
              <span className={cramped ? 'font-medium text-warning-foreground dark:text-warning' : undefined}>
                {t('tracks.pitboxes', { count: track.pitboxes })}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          <span className="text-sm text-muted-foreground">{t('race.track.none')}</span>
          <Button type="button" disabled={locked} onClick={() => setPicking(true)}>{t('race.track.pick')}</Button>
        </>
      )}

      <TrackPicker
        open={picking}
        selectedKey={track?.key}
        gridSize={gridSize}
        onOpenChange={setPicking}
        onPick={onPick}
      />
    </Card>
  );
};
