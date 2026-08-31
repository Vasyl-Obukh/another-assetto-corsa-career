import type { Track, TrackGroup } from '../../../../shared/types';
import { isSafeSegment, trackOutlineUrl, trackPreviewUrl } from '../../../../shared/utils/content-url';

/**
 * Preview URLs for one layout, best first.
 *
 * The URL grammar rejects folder names containing spaces and anything else a
 * path could be smuggled through, so a candidate that could only ever answer
 * 400 is dropped here rather than being requested and failing.
 * @param track The layout to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const layoutImageSources = (track: Track): string[] => {
  if (!isSafeSegment(track.id)) return [];
  if (track.layout !== '' && !isSafeSegment(track.layout)) return [];

  return [trackPreviewUrl(track.id, track.layout), trackOutlineUrl(track.id, track.layout)];
};

/**
 * Map URLs for one layout, outline first.
 *
 * The reverse of layoutImageSources, and the difference is the question being
 * asked. A card illustrating a circuit wants the photograph; someone choosing
 * between seven layouts of the Nordschleife wants the shape, which is the only
 * thing that tells them apart - the photograph is the same pit straight either
 * way.
 * @param track The layout to draw
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const layoutMapSources = (track: Track): string[] => (
  [...layoutImageSources(track)].reverse()
);

/**
 * Preview URLs for a track, best first.
 *
 * Illustrated by its first layout, since AC keeps the photo per layout and any
 * of them shows the circuit.
 * @param group The track to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const trackImageSources = (group: TrackGroup): string[] => {
  const [track] = group.layouts;

  return track === undefined ? [] : layoutImageSources(track);
};

/**
 * Whether a track's real-world position is known, which is what CSP places the
 * sun and the weather against.
 *
 * Any located layout locates the circuit: they are the same place, and mods fill
 * the geotags in per layout, so one of them knowing is enough.
 * @param group The track to check
 * @returns True when some layout knows both coordinates
 */
export const isLocated = (group: TrackGroup): boolean => group.layouts.some(
  (track) => track.geotags.lat !== null && track.geotags.lon !== null,
);

/**
 * The range of grid sizes a track's layouts allow.
 * @param group The track to measure
 * @returns The smallest and largest stated pit box counts, or null when none is
 */
export const pitboxRange = (group: TrackGroup): { from: number; to: number } | null => {
  const known = group.layouts
    .map((track) => track.pitboxes)
    .filter((pitboxes): pitboxes is number => pitboxes !== null);

  if (known.length === 0) return null;

  return { from: Math.min(...known), to: Math.max(...known) };
};

/**
 * The range of lap lengths a track's layouts cover, in metres.
 *
 * A range rather than one figure for the same reason pit boxes are: the
 * Nordschleife ships a 3.8 km sprint and a 25.4 km endurance layout under one
 * folder, and picking either of them to stand for the circuit would be a lie.
 * @param group The track to measure
 * @returns The shortest and longest stated lengths, or null when none is stated
 */
export const lengthRange = (group: TrackGroup): { from: number; to: number } | null => {
  const known = group.layouts
    .map((track) => track.lengthM)
    .filter((length): length is number => length !== null);

  if (known.length === 0) return null;

  return { from: Math.min(...known), to: Math.max(...known) };
};
