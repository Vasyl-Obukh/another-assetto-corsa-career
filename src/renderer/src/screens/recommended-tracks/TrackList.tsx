import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { RecommendedCircuit } from '../../../../shared/types';
import { recommendedLayout } from '../../../../shared/utils/recommended-tracks';
import type { RecommendedEntry } from '../../../../shared/utils/recommended-tracks';
import { RecommendedTrackCard, TrackChooser } from '@/components';
import type { RecommendedTracks } from '@/hooks';
import type { CircuitUsage } from '@/lib/circuit-usage';

interface TrackListProps {
  /**
   * The circuits to list, in order.
   */
  circuits: readonly RecommendedCircuit[];
  /**
   * How much of the library races each circuit.
   */
  usage: ReadonlyMap<string, CircuitUsage>;
  /**
   * The layouts' states and the actions over them.
   */
  tracks: RecommendedTracks;
  /**
   * Whether the rows' menus may open a track's page; first-run setup says not.
   */
  trackPages?: boolean;
}

/**
 * The circuits as cards, and the picker their Choose buttons open.
 */
export const TrackList = ({
  circuits, usage, tracks, trackPages = true,
}: TrackListProps) => {
  const { t } = useTranslation();
  const [choosing, setChoosing] = useState<RecommendedEntry | null>(null);

  return (
    <>
      {circuits.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t('recommendedTracks.empty')}</p>
      ) : (
        <div className="flex flex-col gap-3 pb-1">
          {circuits.map((circuit) => (
            <RecommendedTrackCard
              key={circuit.id}
              circuit={circuit}
              usage={usage.get(circuit.id)}
              states={tracks.states}
              tracks={tracks}
              onChoose={(layout) => setChoosing(recommendedLayout(layout.id))}
              trackPages={trackPages}
            />
          ))}
        </div>
      )}

      <TrackChooser
        choosing={choosing}
        tracks={tracks}
        championships={choosing ? usage.get(choosing.circuit.id)?.championships : undefined}
        onClose={() => setChoosing(null)}
      />
    </>
  );
};
