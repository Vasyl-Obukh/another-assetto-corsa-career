import type { TrackGroup } from '../../../../shared/types';
import { isSafeSegment, trackOutlineUrl, trackPreviewUrl } from '../../../../shared/utils/content-url';

/**
 * Preview URLs for a track, best first.
 *
 * Illustrated by its first layout, since AC keeps the photo per layout and any
 * of them shows the circuit. The URL grammar rejects folder names containing
 * spaces and anything else a path could be smuggled through, so a candidate that
 * could only ever answer 400 is dropped here rather than being requested and
 * failing.
 * @param group The track to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const trackImageSources = (group: TrackGroup): string[] => {
  const [track] = group.layouts;
  if (track === undefined) return [];
  if (!isSafeSegment(track.id)) return [];
  if (track.layout !== '' && !isSafeSegment(track.layout)) return [];

  return [trackPreviewUrl(track.id, track.layout), trackOutlineUrl(track.id, track.layout)];
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
