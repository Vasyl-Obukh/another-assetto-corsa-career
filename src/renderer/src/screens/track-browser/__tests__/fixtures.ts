// Shared fixtures for the track card tests. Only the fields the card reads are
// interesting; everything else defaults out of the way.

import type { Track } from '../../../../../shared/types';

/**
 * Builds a track layout, defaulting everything the test in hand does not need.
 * @param track The fields this layout actually needs
 * @returns A complete Track
 */
export const makeTrack = (track: Pick<Track, 'id'> & Partial<Track>): Track => ({
  layout: '',
  key: track.layout ? `${track.id}/${track.layout}` : track.id,
  name: track.id,
  country: null,
  pitboxes: null,
  geotags: { lat: null, lon: null },
  ...track,
});
