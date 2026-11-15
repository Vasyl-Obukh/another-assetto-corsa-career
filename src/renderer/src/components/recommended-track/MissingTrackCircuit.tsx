import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { RecommendedTrackCard } from './RecommendedTrackCard.tsx';
import { TrackChooser } from './TrackChooser.tsx';
import { recommendedLayout } from '../../../../shared/utils/recommended-tracks';
import type { RecommendedEntry } from '../../../../shared/utils/recommended-tracks';
import { Button } from '@/components/ui/button.tsx';
import { DialogFooter } from '@/components/ui/dialog.tsx';
import { useChampionships, useRecommendedTracks } from '@/hooks';
import { circuitUsage } from '@/lib/circuit-usage';
import { path } from '@/lib/routes';

interface MissingTrackCircuitProps {
  /**
   * The recommended layout the round races, and its circuit.
   */
  entry: RecommendedEntry;
}

/**
 * What a missing track's dialog holds: the circuit's card, where to get a
 * track, and the picker its Choose buttons open.
 */
export const MissingTrackCircuit = ({ entry }: MissingTrackCircuitProps) => {
  const { t } = useTranslation();
  const [choosing, setChoosing] = useState<RecommendedEntry | null>(null);
  const tracks = useRecommendedTracks();
  const { listings } = useChampionships();
  const usage = useMemo(() => circuitUsage(listings), [listings]);

  return (
    <>
      <RecommendedTrackCard
        circuit={entry.circuit}
        usage={usage.get(entry.circuit.id)}
        states={tracks.states}
        tracks={tracks}
        onChoose={(chosen) => setChoosing(recommendedLayout(chosen.id))}
      />
      <DialogFooter className="sm:justify-start">
        <Button asChild size="sm" variant="ghost">
          <Link to={path.settingsTracks()}>{t('recommendedTracks.whereToGet')}</Link>
        </Button>
      </DialogFooter>

      <TrackChooser
        choosing={choosing}
        tracks={tracks}
        championships={usage.get(entry.circuit.id)?.championships}
        onClose={() => setChoosing(null)}
      />
    </>
  );
};
