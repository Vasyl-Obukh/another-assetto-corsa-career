import { CheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { RecommendedEntry } from '../../../../shared/utils/recommended-tracks';
import { useToast } from '@/app';
import { TrackPicker } from '@/components/content-picker/index.ts';
import type { RecommendedTracks } from '@/hooks';
import { useFormat } from '@/i18n';
import { TRACK_STATE_ACCENT } from '@/lib/accents';

interface TrackChooserProps {
  /**
   * The recommended layout a track is being chosen for, or null while the
   * picker is closed.
   */
  choosing: RecommendedEntry | null;
  /**
   * The actions a choice is written through.
   */
  tracks: RecommendedTracks;
  /**
   * How many championships race the circuit, for the toast a choice raises.
   */
  championships?: number;
  /**
   * Called as the picker closes, chosen or not.
   */
  onClose: () => void;
}

/**
 * The track picker over every installed track, in the library or not, choosing
 * the track a recommended layout races.
 */
export const TrackChooser = ({
  choosing, tracks, championships, onClose,
}: TrackChooserProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { show } = useToast();
  const label = choosing
    ? t('recommendedTracks.layoutName', { circuit: choosing.circuit.name, layout: choosing.layout.name })
    : '';

  return (
    <TrackPicker
      open={choosing !== null}
      everything
      heading={{
        title: t('recommendedTracks.chooseTitle', { layout: label }),
        hint: t('recommendedTracks.chooseHint'),
      }}
      selectedKey={choosing ? tracks.states?.get(choosing.layout.id)?.track?.key : undefined}
      onOpenChange={(open) => { if (!open) onClose(); }}
      onPick={(track) => {
        if (!choosing) return;
        tracks.choose(choosing.layout.id, track);
        show({
          icon: CheckIcon,
          tone: TRACK_STATE_ACCENT.choice,
          title: t('recommendedTracks.chosen', { layout: label, track: track.name }),
          ...(championships ? {
            detail: t('recommendedTracks.chosenDetail', { count: championships, shown: formatNumber(championships) }),
          } : {}),
        });
        onClose();
      }}
    />
  );
};
