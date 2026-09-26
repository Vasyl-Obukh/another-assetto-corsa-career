import { useTranslation } from 'react-i18next';

import type { SeriesListing } from '../../../../shared/types';
import { roundRaceable } from '../../../../shared/utils/round-availability';
import { cn } from '@/lib/utils.ts';

interface RoundTicksProps {
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
}

// The season at a glance: a tick per round, so its length is visible before it
// is counted. A round that can be raced wears the race colour and one missing
// content is left grey, which is how a partly installed calendar shows.
export const RoundTicks = ({ listing }: RoundTicksProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-0.5">
      {listing.series.rounds.map((round, index) => {
        const raceable = roundRaceable(listing, round.id);

        return (
          <span
            key={round.id}
            title={raceable
              ? t('championships.round', { number: index + 1 })
              : t('championships.roundMissing', { number: index + 1 })}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              raceable ? 'bg-session-race-foreground/60' : 'bg-muted-foreground/25',
            )}
          />
        );
      })}
    </div>
  );
};
