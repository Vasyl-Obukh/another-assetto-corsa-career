// The class catalogue as a value: what we ship, with the user's layer resolved
// over it. Every lookup is handed the catalogue it answers from, so main and the
// renderer can each resolve the same layer and nothing quietly falls back to the
// shipped half alone.

import { CLASS_NAMES, SPEC_CARS, SPECS } from './constants.ts';
import { EMPTY_CLASS_LAYER } from '../../constants/index.ts';
import type {
  CarClass,
  CarSpec,
  CatalogueClass,
  CatalogueSpec,
  ClassCatalogue,
  ClassId,
  ClassificationOrigin,
  ClassLayer,
  SpecId,
} from '../../types/index.ts';

export { CLASS_NAMES, SPEC_CARS, SPECS } from './constants.ts';

/**
 * Car folder ID to every spec the app ships it in, inverted from SPEC_CARS.
 */
const SHIPPED_SPECS_BY_CAR = ((): ReadonlyMap<string, readonly SpecId[]> => {
  const index = new Map<string, SpecId[]>();

  for (const [spec, cars] of Object.entries(SPEC_CARS) as [CarSpec, readonly string[]][]) {
    for (const car of cars) index.set(car, [...(index.get(car) ?? []), spec]);
  }

  return index;
})();

/**
 * Nothing to hand back for a car or spec the catalogue does not name, shared so
 * the empty case never allocates.
 */
const NONE: readonly never[] = [];

/**
 * Keeps the specs a car may hold out of what the layer says it holds.
 *
 * Unknown specs go, and so does every spec of a class already held - a car on
 * two specs of one class would be two eras of a category at once. The store
 * refuses both; this is the backstop for a hand-edited file.
 * @param held What the layer lists for the car
 * @param specById Every resolved spec
 * @returns The specs it keeps, in the order listed
 */
const keptSpecs = (
  held: readonly SpecId[],
  specById: ReadonlyMap<SpecId, CatalogueSpec>,
): SpecId[] => {
  const classes = new Set<ClassId>();

  return held.filter((spec) => {
    const found = specById.get(spec);
    if (!found || classes.has(found.class)) return false;
    classes.add(found.class);

    return true;
  });
};

/**
 * Resolves the user's layer over the shipped class catalogue.
 *
 * The layer's shape is readClassLayer's to guarantee; what only resolving can
 * tell is handled here. A user class or spec reusing an id already spent - a
 * shipped one included - is skipped, as is a spec of a class that does not
 * resolve. A car's own list replaces the shipped one outright.
 * @param layer The user's layer
 * @returns The catalogue both halves make
 */
export const resolveCatalogue = (layer: Readonly<ClassLayer>): ClassCatalogue => {
  const classes: Omit<CatalogueClass, 'specs'>[] = (Object.entries(CLASS_NAMES) as [CarClass, string][])
    .map(([id, name]) => ({ id, name, origin: 'shipped' }));
  const classIds = new Set<ClassId>(classes.map((one) => one.id));
  layer.classes.forEach((one) => {
    if (classIds.has(one.id)) return;
    classIds.add(one.id);
    classes.push({ id: one.id, name: one.name, origin: 'user' });
  });

  const specs: CatalogueSpec[] = (Object.entries(SPECS) as [CarSpec, { class: CarClass; name: string }][])
    .map(([id, spec]) => ({
      id, name: spec.name, class: spec.class, origin: 'shipped',
    }));
  const specIds = new Set<SpecId>(specs.map((one) => one.id));
  layer.specs.forEach((one) => {
    if (specIds.has(one.id) || !classIds.has(one.class)) return;
    specIds.add(one.id);
    specs.push({
      id: one.id, name: one.name, class: one.class, origin: 'user',
    });
  });

  const specById = new Map(specs.map((one) => [one.id, one]));
  const resolvedClasses: CatalogueClass[] = classes.map((one) => ({
    ...one,
    specs: specs.filter((spec) => spec.class === one.id).map((spec) => spec.id),
  }));

  const specsByCar = new Map<string, readonly SpecId[]>(SHIPPED_SPECS_BY_CAR);
  const overridden = new Set<string>();
  Object.entries(layer.cars).forEach(([car, held]) => {
    overridden.add(car);

    const kept = keptSpecs(held, specById);
    if (kept.length === 0) specsByCar.delete(car);
    else specsByCar.set(car, kept);
  });

  const holds = (car: string, spec: SpecId): boolean => specsByCar.get(car)?.includes(spec) ?? false;
  const carsBySpec = new Map<SpecId, readonly string[]>(specs.map((spec) => {
    const shipped: readonly string[] = spec.origin === 'shipped' ? SPEC_CARS[spec.id as CarSpec] : NONE;
    const kept = shipped.filter((car) => !overridden.has(car) || holds(car, spec.id));
    const added = [...overridden].filter((car) => !shipped.includes(car) && holds(car, spec.id)).sort();

    // The shipped list itself where nothing changed it, since a field draws
    // from it in order and a round must compose the same grid as before.
    return [spec.id, kept.length === shipped.length && added.length === 0 ? shipped : [...kept, ...added]];
  }));

  return {
    classes: resolvedClasses,
    classById: new Map(resolvedClasses.map((one) => [one.id, one])),
    specById,
    carsBySpec,
    specsByCar,
    overridden,
  };
};

/**
 * The catalogue exactly as the app ships it, for anything with no user layer to
 * hand - a core entry point, and the tests.
 */
export const SHIPPED_CATALOGUE: ClassCatalogue = resolveCatalogue(EMPTY_CLASS_LAYER);

/**
 * Finds every grid a car races on.
 *
 * More than one is normal: a Lotus 2-Eleven runs in Lotus Cup and again as a
 * track special. Empty for a car nobody has classified, and for a car that
 * exists only for one-make racing - those a championship names directly.
 * @param carId Folder name under content/cars
 * @param catalogue The catalogue to answer from
 * @returns Its specs, in catalogue order
 */
export const carSpecsOf = (carId: string, catalogue: ClassCatalogue): readonly SpecId[] => (
  catalogue.specsByCar.get(carId) ?? NONE
);

/**
 * Reads which class a spec belongs to.
 * @param spec The spec to place
 * @param catalogue The catalogue to answer from
 * @returns The class it is part of, or null for a spec the catalogue lacks
 */
export const classOfSpec = (spec: SpecId, catalogue: ClassCatalogue): ClassId | null => (
  catalogue.specById.get(spec)?.class ?? null
);

/**
 * Finds every class a car belongs to, through the specs it holds.
 * @param carId Folder name under content/cars
 * @param catalogue The catalogue to answer from
 * @returns Its classes, in catalogue order
 */
export const carClassesOf = (carId: string, catalogue: ClassCatalogue): readonly ClassId[] => {
  const specs = carSpecsOf(carId, catalogue);
  if (specs.length === 0) return NONE;

  return [...new Set(specs.map((spec) => classOfSpec(spec, catalogue)))]
    .filter((one): one is ClassId => one !== null);
};

/**
 * Reads a spec's display name.
 * @param spec The spec to name
 * @param catalogue The catalogue to answer from
 * @returns Its display text, or its id for a spec the catalogue lacks
 */
export const carSpecName = (spec: SpecId, catalogue: ClassCatalogue): string => (
  catalogue.specById.get(spec)?.name ?? spec
);

/**
 * Reads a class's display name.
 * @param carClass The class to name
 * @param catalogue The catalogue to answer from
 * @returns Its display text, or its id for a class the catalogue lacks
 */
export const carClassName = (carClass: ClassId, catalogue: ClassCatalogue): string => (
  catalogue.classById.get(carClass)?.name ?? carClass
);

/**
 * Every car racing in one spec.
 * @param spec The spec
 * @param catalogue The catalogue to answer from
 * @returns Car folder IDs in the order a field draws from them, empty for a spec
 * the catalogue lacks
 */
export const specCars = (spec: SpecId, catalogue: ClassCatalogue): readonly string[] => (
  catalogue.carsBySpec.get(spec) ?? NONE
);

/**
 * Whether the catalogue holds a spec at all.
 * @param spec The spec
 * @param catalogue The catalogue to answer from
 * @returns True when it resolves
 */
export const isKnownSpec = (spec: SpecId, catalogue: ClassCatalogue): boolean => (
  catalogue.specById.has(spec)
);

/**
 * Says where a car's specs came from.
 * @param carId Folder name under content/cars
 * @param catalogue The catalogue to answer from
 * @returns `shipped` unless the user restated them - `adjusted` over a car the
 * app classifies, `user` over one it does not
 */
export const classificationOf = (carId: string, catalogue: ClassCatalogue): ClassificationOrigin => {
  if (!catalogue.overridden.has(carId)) return 'shipped';

  return SHIPPED_SPECS_BY_CAR.has(carId) ? 'adjusted' : 'user';
};
