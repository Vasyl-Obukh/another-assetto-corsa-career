import type { Car } from '../../../../shared/types';
import { carBadgeUrl, carSkinUrl, isSafeSegment } from '../../../../shared/utils/content-url';

/**
 * Preview URLs for a car, best first.
 *
 * The URL grammar rejects folder names containing spaces and the other
 * characters a path could be smuggled through, so a candidate that could only
 * ever answer 400 is dropped here rather than being requested and failing.
 * @param car The car to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const carImageSources = (car: Car): string[] => {
  if (!isSafeSegment(car.id)) return [];

  const skin = car.skins.find((candidate) => isSafeSegment(candidate.id));

  return skin === undefined
    ? [carBadgeUrl(car.id)]
    : [carSkinUrl(car.id, skin.id), carBadgeUrl(car.id)];
};
