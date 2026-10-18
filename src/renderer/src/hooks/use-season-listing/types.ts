import type { SeriesAvailability, SeriesListing } from '../../../../shared/types';

/**
 * What the install can race of a season's copy, and which copy that answers.
 */
export interface SeasonAvailability {
  /**
   * The copy it answers, as JSON, so a late answer for another is never shown.
   */
  copy: string;
  /**
   * What the install can race of it, or null when it could not be read.
   */
  availability: SeriesAvailability | null;
}

/**
 * The championship a championship's page shows.
 */
export interface SeasonListingState {
  /**
   * The listing, or null while it is read or when there is none.
   */
  listing: SeriesListing | null;
  /**
   * Whether the season's copy is still being read.
   */
  loading: boolean;
}
