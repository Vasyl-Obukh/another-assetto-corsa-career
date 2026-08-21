import type { Car } from '../../../../shared/types';
import { carBadgeUrl, carSkinUrl, isSafeSegment } from '../../../../shared/utils/content-url';

/**
 * How many tags a card shows before the rest become a count.
 */
const TAG_LIMIT = 3;

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

  const skin = car.skins.find((candidate) => isSafeSegment(candidate));

  return skin === undefined
    ? [carBadgeUrl(car.id)]
    : [carSkinUrl(car.id, skin), carBadgeUrl(car.id)];
};

/**
 * The tags a card shows, and how many it left out.
 * @param tags Every tag the mod author wrote
 * @returns The first few tags, and the number beyond them
 */
export const visibleTags = (tags: string[]): { shown: string[]; extra: number } => ({
  shown: tags.slice(0, TAG_LIMIT),
  extra: Math.max(0, tags.length - TAG_LIMIT),
});

/**
 * Rounds a power-to-weight ratio to something readable.
 *
 * formatNumber takes no options, and 312.4571 bhp/t is noise rather than
 * precision - the underlying figures are parsed out of free text.
 * @param ratio The derived ratio
 * @returns The ratio to one decimal place
 */
export const roundRatio = (ratio: number): number => Math.round(ratio * 10) / 10;
