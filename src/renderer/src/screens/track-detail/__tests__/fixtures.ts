// Shared fixtures for the track page tests. Only the fields the page reads are
// interesting; everything else defaults out of the way.

import { ContentSource, Discipline } from '../../../../../shared/types';
import type {
  Championship, LadderPosition, SeriesListing, Track, TrackGroup,
} from '../../../../../shared/types';

/**
 * Builds a layout, defaulting everything the test in hand does not need.
 * @param track The fields this layout actually needs
 * @returns A complete Track
 */
export const makeTrack = (track: Pick<Track, 'id'> & Partial<Track>): Track => ({
  layout: '',
  key: track.layout ? `${track.id}/${track.layout}` : track.id,
  name: track.id,
  country: null,
  pitboxes: null,
  lengthM: null,
  widthM: null,
  geotags: { lat: null, lon: null },
  city: null,
  run: null,
  description: null,
  tags: [],
  author: null,
  version: null,
  year: null,
  photos: [],
  logo: false,
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
  ...track,
});

/**
 * Builds a circuit of the given layouts.
 * @param name The circuit's name
 * @param layouts Its layouts
 * @returns A complete TrackGroup
 */
export const makeCircuit = (name: string, layouts: readonly Track[]): TrackGroup => ({
  id: layouts[0]?.id ?? 'circuit',
  name,
  country: null,
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
  layouts: [...layouts],
});

/**
 * A championship listing, built from what the circuit helpers read: its
 * classes' rungs and its rounds' tracks.
 * @param id The championship's id
 * @param ladders One rung per class entry, the first naming its discipline
 * @param rounds Each round's name and the track and layout it runs
 * @returns The listing
 */
export const makeListing = (
  id: string,
  ladders: readonly LadderPosition[],
  rounds: readonly { name: string; track: string; layout?: string }[],
): SeriesListing => ({
  series: {
    id,
    name: `${id} name`,
    entries: ladders.map((ladder, index) => ({ id: `entry-${index}`, ladder, seats: [{ id: `seat-${index}` }] })),
    rounds: rounds.map((round) => ({ name: round.name, track: { id: round.track, layout: round.layout } })),
  } as unknown as Championship,
} as SeriesListing);

/**
 * A rung of the sportscar ladder.
 * @param tier Which rung, 1 being the top
 * @returns The ladder position
 */
export const sportscar = (tier: number): LadderPosition => ({ discipline: Discipline.SPORTSCAR, tier });
