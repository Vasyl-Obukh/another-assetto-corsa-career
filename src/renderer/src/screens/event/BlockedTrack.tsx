import { useTranslation } from 'react-i18next';

import type { RoundBlock } from '../../../../shared/types';
import { recommendedLayout } from '../../../../shared/utils/recommended-tracks';
import { NationFlag, TrackSettingsLink } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { TRACK_STATE_ACCENT } from '@/lib/accents';

interface BlockedTrackProps {
  /**
   * The recommended layout the round races.
   */
  layout: string;
  /**
   * What stops the round.
   */
  block: RoundBlock;
}

/**
 * The recommended layout a round cannot race for its track - not installed, or
 * with too few pit boxes for the field - and the way to the Tracks tab, where
 * the track it races is chosen. Says nothing when the round is short of
 * something else.
 */
export const BlockedTrack = ({ layout, block }: BlockedTrackProps) => {
  const { t } = useTranslation();
  const entry = recommendedLayout(layout);

  if (!entry || block.kind === 'other') return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-lg border px-3.5 py-3">
      <NationFlag code={entry.circuit.nation} className="h-3.5 w-5" />
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold">{t('recommendedTracks.layoutName', { circuit: entry.circuit.name, layout: entry.layout.name })}</span>
        {block.kind === 'pitboxes' ? (
          <Badge variant="destructive">
            {t('event.skip.pitboxes', { available: block.available, needed: block.needed })}
          </Badge>
        ) : (
          <Badge className={TRACK_STATE_ACCENT.missing}>{t('recommendedTracks.state.missing')}</Badge>
        )}
      </div>
      <TrackSettingsLink layout={layout} className="ml-auto" />
    </div>
  );
};
