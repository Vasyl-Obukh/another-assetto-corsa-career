import {
  carBadgeUrl, carLiveryUrl, carSkinUrl, isSafeSegment, isServableLayout, trackPhotoUrl, trackPreviewUrl,
} from '../../../../shared/utils/content-url';

// A folder name the URL grammar would refuse is dropped here rather than
// requested and failed.

/**
 * A car's picture, best first: the livery's preview, then the car's badge.
 * @param model Car folder ID
 * @param skin Skin folder ID, when one is known
 * @returns Zero or more accontent:// URLs
 */
export const carPictureSources = (model: string, skin?: string): string[] => {
  if (!isSafeSegment(model)) return [];

  return skin && isSafeSegment(skin) ? [carSkinUrl(model, skin), carBadgeUrl(model)] : [carBadgeUrl(model)];
};

/**
 * A car's small swatch, best first: the livery's own colour swatch, then the
 * car's badge.
 * @param model Car folder ID
 * @param skin Skin folder ID, when one is known
 * @returns Zero or more accontent:// URLs
 */
export const carSwatchSources = (model: string, skin?: string): string[] => {
  if (!isSafeSegment(model)) return [];

  return skin && isSafeSegment(skin) ? [carLiveryUrl(model, skin), carBadgeUrl(model)] : [carBadgeUrl(model)];
};

/**
 * A track's picture, best first: its first loading-screen photograph, then its
 * preview. A track that ships neither falls through to the image's fallback.
 * @param track Which track and layout
 * @param track.id The circuit's folder
 * @param track.layout The layout's folder, absent for a circuit with none
 * @returns Zero or more accontent:// URLs
 */
export const trackPictureSources = (track: { id: string; layout?: string }): string[] => {
  const layout = track.layout ?? '';
  if (!isServableLayout(track.id, layout)) return [];

  return [trackPhotoUrl(track.id, layout, 'bgr00'), trackPreviewUrl(track.id, layout)];
};
