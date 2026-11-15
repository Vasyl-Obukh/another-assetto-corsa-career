import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { recommendedLayout } from '../../../../shared/utils/recommended-tracks';
import { NationFlag, TrackChooser } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useRecommendedTracks } from '@/hooks';
import { TRACK_STATE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';

interface MissingTrackProps {
  /**
   * The recommended layout the round races.
   */
  layout: string;
}

/**
 * The recommended layout a round cannot race for want of a track: its name,
 * where to get one, and the picker to choose one already installed. Says
 * nothing while the layout races something, since then the round is short of
 * something else.
 */
export const MissingTrack = ({ layout }: MissingTrackProps) => {
  const { t } = useTranslation();
  const tracks = useRecommendedTracks();
  const [choosing, setChoosing] = useState(false);
  const entry = recommendedLayout(layout);

  if (!entry || tracks.states?.get(layout)?.source !== 'missing') return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-lg border px-3.5 py-3">
      <NationFlag code={entry.circuit.nation} className="h-3.5 w-5" />
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold">{t('recommendedTracks.layoutName', { circuit: entry.circuit.name, layout: entry.layout.name })}</span>
        <Badge className={TRACK_STATE_ACCENT.missing}>{t('recommendedTracks.state.missing')}</Badge>
      </div>
      <div className="ml-auto flex flex-wrap gap-1.5">
        <Button asChild size="sm" variant="ghost">
          <Link to={path.settingsTracks()}>{t('recommendedTracks.whereToGet')}</Link>
        </Button>
        <Button size="sm" variant="outline" onClick={() => setChoosing(true)}>
          {t('recommendedTracks.chooseTrack')}
        </Button>
      </div>

      <TrackChooser choosing={choosing ? entry : null} tracks={tracks} onClose={() => setChoosing(false)} />
    </div>
  );
};
