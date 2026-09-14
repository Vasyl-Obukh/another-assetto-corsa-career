import type { ClassPicks } from './types.ts';
import type {
  ClassCatalogue, ClassId, Skin, SpecId,
} from '../../../../shared/types';
import { carSpecsOf, classOfSpec } from '../../../../shared/utils/car-classes';
import { carBadgeUrl, carSkinUrl, isSafeSegment } from '../../../../shared/utils/content-url';

/**
 * What the classify form opens on: the car's specs as they stand.
 * @param carId Folder name of the car
 * @param catalogue The catalogue to read it from
 * @returns Its classes and the spec it holds in each
 */
export const seedPicks = (carId: string, catalogue: ClassCatalogue): ClassPicks => {
  const specs: Partial<Record<ClassId, SpecId>> = {};
  carSpecsOf(carId, catalogue).forEach((spec) => {
    const carClass = classOfSpec(spec, catalogue);
    if (carClass !== null) specs[carClass] = spec;
  });

  return { classes: catalogue.classes.map((one) => one.id).filter((id) => id in specs), specs };
};

/**
 * Ticks or unticks one class, keeping the list in catalogue order.
 *
 * A class with a single spec has it chosen at once, since the second step would
 * otherwise ask a question with one answer.
 * @param picks What the form holds
 * @param carClass The class to switch
 * @param catalogue The catalogue the classes come from
 * @returns What the form holds after
 */
export const togglePick = (picks: ClassPicks, carClass: ClassId, catalogue: ClassCatalogue): ClassPicks => {
  const on = !picks.classes.includes(carClass);
  const wanted = new Set(picks.classes);
  if (on) wanted.add(carClass);
  else wanted.delete(carClass);

  const specs = catalogue.classById.get(carClass)?.specs ?? [];

  return {
    classes: catalogue.classes.map((one) => one.id).filter((id) => wanted.has(id)),
    specs: on && specs.length === 1 && picks.specs[carClass] === undefined
      ? { ...picks.specs, [carClass]: specs[0] }
      : picks.specs,
  };
};

/**
 * The specs the form would save.
 * @param picks What the form holds
 * @returns One spec per chosen class, or null while any chosen class lacks one
 */
export const pickedSpecs = (picks: ClassPicks): SpecId[] | null => {
  const specs = picks.classes.map((carClass) => picks.specs[carClass]);

  return specs.every((spec) => spec !== undefined) ? specs : null;
};

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
