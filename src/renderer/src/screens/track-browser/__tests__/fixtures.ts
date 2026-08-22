// Shared fixtures for the track card tests. Only the fields the card reads are
// interesting; everything else defaults out of the way.

import { ContentSource } from '../../../../../shared/types';
import type { Geotags, Track, TrackGroup } from '../../../../../shared/types';

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
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
  ...track,
});

/**
 * Builds a track holding a single layout, which is all these helpers read.
 * @param track The fields that layout actually needs
 * @returns A complete TrackGroup wrapping it
 */
export const makeGroup = (track: Pick<Track, 'id'> & Partial<Track>): TrackGroup => {
  const layout = makeTrack(track);

  return {
    id: layout.id,
    name: layout.name,
    country: layout.country,
    provenance: layout.provenance,
    layouts: [layout],
  };
};

/**
 * Builds a track of several layouts, which is where these helpers stop agreeing
 * with the single-layout case.
 * @param id Track folder name
 * @param pitboxes One grid size per layout, null where the layout states none
 * @param geotags Coordinates per layout, defaulting to none
 * @returns A complete TrackGroup
 */
export const makeGroupOf = (
  id: string,
  pitboxes: readonly (number | null)[],
  geotags: readonly Geotags[] = [],
): TrackGroup => {
  const layouts = pitboxes.map((count, index) => makeTrack({
    id,
    layout: `l${index}`,
    name: `${id} ${index}`,
    pitboxes: count,
    geotags: geotags[index] ?? { lat: null, lon: null },
  }));

  return { ...makeGroup({ id }), layouts };
};
