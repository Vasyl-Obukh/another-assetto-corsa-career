import { useTranslation } from 'react-i18next';

import type { SeriesListing } from '../../../../shared/types';
import { useUnits } from '@/hooks';
import { raceLength } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { LayoutMap } from '@/screens/track-browser';

interface HistoricTrackProps {
  /**
   * The historic event and what the install can race of it.
   */
  listing: SeriesListing;
  /**
   * Classes for the outline's frame, which a table row draws smaller.
   */
  className?: string;
}

// Where a historic event runs and how long its race is: the layout's outline
// beside the race's length, which is what tells two events apart at a glance.
export const HistoricTrack = ({ listing, className }: HistoricTrackProps) => {
  const { t } = useTranslation();
  const units = useUnits();
  const round = listing.series.rounds[0];
  const races = listing.availability.rounds[0]?.races ?? [];

  if (!round) return null;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className={cn('relative block aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md bg-muted', className)}>
        <LayoutMap track={round.track} alt={round.name} className="p-1" />
      </span>
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {races.map((race) => raceLength(race, t, units)).join(' · ')}
      </span>
    </div>
  );
};
