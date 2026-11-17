import { useTranslation } from 'react-i18next';

import { missingContent, missingTrackLabel } from './utils.ts';
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

  const { cars, tracks, pitboxes } = missingContent(listing);

  if (cars.length === 0 && tracks.length === 0 && pitboxes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {cars.length ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{t('championships.missing.cars')}</span>
          {cars.map((car) => (
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
              <span className="min-w-0 flex-1 truncate text-sm">{missingTrackLabel(track, t)}</span>
              <ProvenanceBadges provenance={track.provenance} compact />
            </div>
          ))}
        </div>
      ) : null}

      {pitboxes.length ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{t('championships.missing.pitboxes')}</span>
          {pitboxes.map((one) => (
            <div key={one.key} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">{one.track}</span>
              {/* Neutral on purpose: two counts, under a heading that says what is wrong. */}
              <span className="text-xs text-muted-foreground tabular-nums">
                {t('championships.missing.pitboxesFor', { available: one.available, needed: one.needed })}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
