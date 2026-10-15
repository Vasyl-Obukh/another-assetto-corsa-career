import type { SeriesListing } from '../../../../shared/types';
import { AvailabilityBadge, availabilityState, OriginBadge } from '@/screens/championships';

interface HistoricStateProps {
  /**
   * The historic event and what the install can race of it.
   */
  listing: SeriesListing;
}

// Whose a historic event is, and whether it can be raced. Nothing for one of
// ours, since the pool lists ours only where they can be.
export const HistoricState = ({ listing }: HistoricStateProps) => {
  const state = availabilityState(listing.availability);

  if (listing.origin === 'shipped' && state === 'available') return null;

  return (
    <div className="flex flex-wrap gap-1">
      <OriginBadge origin={listing.origin} />
      {state === 'available' ? null : <AvailabilityBadge availability={listing.availability} />}
    </div>
  );
};
