import { useTranslation } from 'react-i18next';

import type { SeriesListing } from '../../../../shared/types';
import { ProvenanceBadges } from '@/components';

interface MissingContentProps {
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
}

export const MissingContent = ({ listing }: MissingContentProps) => {
  const { t } = useTranslation();

  const cars = [
    ...listing.availability.entries,
    ...listing.availability.rounds.flatMap((round) => round.entries),
  ].flatMap((entry) => entry.missing);
  const tracks = listing.availability.rounds
    .map((round) => round.track)
    .filter((track) => track !== null);

  // Named by folder ID rather than by a display name, because nothing that is
  // not installed has one. The provenance badge is what says where to get it.
  const unique = [...new Map(cars.map((car) => [car.id, car])).values()];

  if (unique.length === 0 && tracks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {unique.length ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{t('championships.missing.cars')}</span>
          {unique.map((car) => (
            <div key={car.id} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">{car.id}</span>
              <ProvenanceBadges provenance={car.provenance} compact />
            </div>
          ))}
        </div>
      ) : null}

      {tracks.length ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{t('championships.missing.tracks')}</span>
          {tracks.map((track) => (
            <div key={track.key} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">{track.key}</span>
              <ProvenanceBadges provenance={track.provenance} compact />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
