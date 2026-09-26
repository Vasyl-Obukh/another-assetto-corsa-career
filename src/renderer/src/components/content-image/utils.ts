import {
  carBadgeUrl, carLiveryUrl, carSkinUrl, isSafeSegment,
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
