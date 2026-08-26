import type { Skin } from '../../../../shared/types';
import { carBadgeUrl, carSkinUrl, isSafeSegment } from '../../../../shared/utils/content-url';

/**
 * Preview URLs for one livery, best first.
 *
 * The URL grammar rejects folder names carrying a path separator and the other
 * characters a path could be smuggled through, so a candidate that could only
 * ever answer 400 is dropped here rather than being requested and failing.
 * @param carId Folder name of the car the livery belongs to
 * @param skin The livery to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const skinImageSources = (carId: string, skin: Skin): string[] => {
  if (!isSafeSegment(carId)) return [];
  if (!isSafeSegment(skin.id)) return [carBadgeUrl(carId)];

  return [carSkinUrl(carId, skin.id), carBadgeUrl(carId)];
};
