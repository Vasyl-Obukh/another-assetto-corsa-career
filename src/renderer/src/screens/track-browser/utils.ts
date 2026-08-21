import type { Track } from '../../../../shared/types';
import { isSafeSegment, trackOutlineUrl, trackPreviewUrl } from '../../../../shared/utils/content-url';

/**
 * Preview URLs for a track layout, best first.
 *
 * The URL grammar rejects folder names containing spaces and anything else a
 * path could be smuggled through, so a candidate that could only ever answer 400
 * is dropped here rather than being requested and failing.
 * @param track The layout to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const trackImageSources = (track: Track): string[] => {
  if (!isSafeSegment(track.id)) return [];
  if (track.layout !== '' && !isSafeSegment(track.layout)) return [];

  return [trackPreviewUrl(track.id, track.layout), trackOutlineUrl(track.id, track.layout)];
};

/**
 * Whether a layout's real-world position is known, which is what CSP places the
 * sun and the weather against.
 * @param track The layout to check
 * @returns True when both coordinates are known
 */
export const isLocated = (track: Track): boolean => (
  track.geotags.lat !== null && track.geotags.lon !== null
);
