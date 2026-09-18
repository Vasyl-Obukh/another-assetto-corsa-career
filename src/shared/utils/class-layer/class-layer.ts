// The user's layer over the class catalogue: reading it tolerantly off disk, and
// the edits the class store makes to it.
//
// Every edit takes the resolved catalogue beside the layer, because what an
// edit may do depends on both - a spec may belong to a shipped class, and a car
// may drop a spec we ship.

import { CLASS_LAYER_VERSION, EMPTY_CLASS_LAYER } from '../../constants/index.ts';
import { AppError } from '../../errors/index.ts';
import type {
  ClassCatalogue, ClassLayer, SpecId, UserCarClass, UserCarSpec,
} from '../../types/index.ts';
import { carClassName, carSpecName, SHIPPED_CATALOGUE } from '../car-classes/index.ts';
import { isRecord } from '../coerce/index.ts';
import { cleanString } from '../settings/index.ts';

/**
 * Reads a list of entries that each need an id and a name, dropping any that
 * lack either and any reusing an id already read.
 * @param raw The value read from disk
 * @param extra Reads whatever else an entry needs, or null to drop it
 * @returns The usable entries, in file order
 */
const readEntries = <T extends { id: string; name: string }>(
  raw: unknown,
  extra: (entry: Record<string, unknown>, id: string, name: string) => T | null,
): T[] => {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();

  return raw.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = cleanString(entry.id);
    const name = cleanString(entry.name);
    if (!id || !name || seen.has(id)) return [];

    const read = extra(entry, id, name);
    if (!read) return [];
    seen.add(id);

    return [read];
  });
};

/**
 * Reads car-classes.json tolerantly.
 *
 * Never throws: anything malformed is dropped entry by entry, so one bad row
 * does not cost the rest. Whether a spec or class an entry names still exists
 * is left to resolveCatalogue, which skips what does not resolve.
 * @param raw The parsed contents of the file, or anything else
 * @returns A usable layer
 */
export const readClassLayer = (raw: unknown): ClassLayer => {
  if (!isRecord(raw)) return structuredClone(EMPTY_CLASS_LAYER);

  const classes = readEntries<UserCarClass>(raw.classes, (_entry, id, name) => ({ id, name }));
  const specs = readEntries<UserCarSpec>(raw.specs, (entry, id, name) => {
    const carClass = cleanString(entry.class);

    return carClass ? { id, name, class: carClass } : null;
  });

  // fromEntries rather than assignment, so a car keyed __proto__ is just a key.
  const cars = isRecord(raw.cars)
    ? Object.fromEntries(Object.entries(raw.cars)
      .filter((pair): pair is [string, unknown[]] => Array.isArray(pair[1]))
      .map(([car, held]) => [car, [...new Set(held.map(cleanString).filter((spec) => spec !== undefined))]]))
    : {};

  return {
    version: CLASS_LAYER_VERSION, classes, specs, cars,
  };
};

/**
 * Whether two spec lists hold the same specs, in whatever order.
 * @param a One list
 * @param b The other
 * @returns True when they hold the same set
 */
const sameSpecs = (a: readonly SpecId[], b: readonly SpecId[]): boolean => (
  a.length === b.length && a.every((spec) => b.includes(spec))
);

/**
 * Stores a car's specs, or drops the override when they are what we ship.
 *
 * Dropping it is what keeps Revert honest: a car put back by hand reads as
 * shipped rather than as an adjustment that changes nothing.
 * @param cars The layer's car overrides
 * @param car Car folder ID
 * @param specs What it now races in
 * @returns The overrides with that car's entry settled
 */
const settleCar = (
  cars: Readonly<Record<string, SpecId[]>>,
  car: string,
  specs: SpecId[],
): Record<string, SpecId[]> => {
  const { [car]: dropped, ...rest } = cars;
  const shipped = SHIPPED_CATALOGUE.specsByCar.get(car) ?? [];

  return sameSpecs(specs, shipped) ? rest : { ...rest, [car]: specs };
};

/**
 * Restates which specs a car races in.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param car Car folder ID
 * @param specs Every spec it should race in; empty leaves it unclassified
 * @returns The layer with the car's specs replaced
 * @throws When a spec does not resolve, or two of them share a class
 */
export const withCarSpecs = (
  layer: ClassLayer,
  catalogue: ClassCatalogue,
  car: string,
  specs: readonly SpecId[],
): ClassLayer => {
  const kept: SpecId[] = [];
  const classes = new Set<string>();

  [...new Set(specs)].forEach((spec) => {
    const found = catalogue.specById.get(spec);
    if (!found) throw new AppError('classes.car.specUnknown', { car, spec: String(spec) });
    if (classes.has(found.class)) {
      throw new AppError('classes.car.classClash', { car, class: carClassName(found.class, catalogue) });
    }

    classes.add(found.class);
    kept.push(spec);
  });

  return { ...layer, cars: settleCar(layer.cars, car, kept) };
};

/**
 * Puts a car back to whatever the app ships for it.
 * @param layer The user's layer
 * @param car Car folder ID
 * @returns The layer with no override for the car
 */
export const withoutCarSpecs = (layer: ClassLayer, car: string): ClassLayer => {
  const { [car]: dropped, ...cars } = layer.cars;

  return { ...layer, cars };
};

/**
 * Reads a name off a form, refusing a blank one and one already spent.
 * @param name The name offered
 * @param spent Every name already in use, bar the entry's own
 * @returns The trimmed name
 * @throws When it is blank or taken
 */
const freeName = (name: unknown, spent: readonly string[]): string => {
  const clean = cleanString(name);
  if (!clean) throw new AppError('classes.name.empty');

  // Case-insensitive, since the filter lists put every name side by side and
  // "GT3" beside "gt3" reads as one entry listed twice.
  const folded = clean.toLocaleLowerCase();
  if (spent.some((one) => one.toLocaleLowerCase() === folded)) {
    throw new AppError('classes.name.taken', { name: clean });
  }

  return clean;
};

/**
 * Refuses a class that is not one of the user's to change.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param id The class
 * @throws When it ships with the app or the layer lacks it
 */
const assertUserClass = (layer: ClassLayer, catalogue: ClassCatalogue, id: string): void => {
  const found = catalogue.classById.get(id);
  if (found?.origin === 'shipped') throw new AppError('classes.class.shipped', { class: found.name });
  if (!layer.classes.some((one) => one.id === id)) throw new AppError('classes.class.notFound', { class: id });
};

/**
 * Refuses a spec that is not one of the user's to change.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param id The spec
 * @throws When it ships with the app or the layer lacks it
 */
const assertUserSpec = (layer: ClassLayer, catalogue: ClassCatalogue, id: string): void => {
  const found = catalogue.specById.get(id);
  if (found?.origin === 'shipped') throw new AppError('classes.spec.shipped', { spec: found.name });
  if (!layer.specs.some((one) => one.id === id)) throw new AppError('classes.spec.notFound', { spec: id });
};

/**
 * Adds a class of the user's, or renames one.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param draft The class as the form left it; no id means a new one
 * @param fresh The id a new class takes
 * @returns The layer, and the id the class is under
 * @throws When the name is blank or taken, or the id is not a class of the user's
 */
export const withUserClass = (
  layer: ClassLayer,
  catalogue: ClassCatalogue,
  draft: { id?: string; name: string },
  fresh: string,
): { layer: ClassLayer; id: string } => {
  const { id } = draft;
  if (id !== undefined) assertUserClass(layer, catalogue, id);

  const name = freeName(draft.name, catalogue.classes.filter((one) => one.id !== id).map((one) => one.name));

  if (id === undefined) {
    return { layer: { ...layer, classes: [...layer.classes, { id: fresh, name }] }, id: fresh };
  }

  return {
    layer: { ...layer, classes: layer.classes.map((one) => (one.id === id ? { ...one, name } : one)) },
    id,
  };
};

/**
 * Adds a spec of the user's, or renames or moves one.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param draft The spec as the form left it; no id means a new one
 * @param fresh The id a new spec takes
 * @returns The layer, and the id the spec is under
 * @throws When the name is blank or taken, the class does not resolve, the id
 * is not a spec of the user's, or moving it would put a car on two specs of
 * one class
 */
export const withUserSpec = (
  layer: ClassLayer,
  catalogue: ClassCatalogue,
  draft: { id?: string; name: string; class: string },
  fresh: string,
): { layer: ClassLayer; id: string } => {
  const { id } = draft;
  if (id !== undefined) assertUserSpec(layer, catalogue, id);

  const name = freeName(
    draft.name,
    [...catalogue.specById.values()].filter((one) => one.id !== id).map((one) => one.name),
  );
  if (!catalogue.classById.has(draft.class)) {
    throw new AppError('classes.spec.classUnknown', { class: String(draft.class), spec: name });
  }

  if (id === undefined) {
    const spec = { id: fresh, name, class: draft.class };

    return { layer: { ...layer, specs: [...layer.specs, spec] }, id: fresh };
  }

  // Only an override can hold a spec of the user's, so only those can clash.
  Object.entries(layer.cars).forEach(([car, held]) => {
    if (!held.includes(id)) return;
    const clash = held.some((other) => other !== id && catalogue.specById.get(other)?.class === draft.class);
    if (clash) {
      throw new AppError('classes.spec.classClash', {
        spec: name, class: carClassName(draft.class, catalogue), car,
      });
    }
  });

  return {
    layer: {
      ...layer,
      specs: layer.specs.map((one) => (one.id === id ? { ...one, name, class: draft.class } : one)),
    },
    id,
  };
};

/**
 * Deletes a spec of the user's, taking it off every car that raced in it.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param id The spec
 * @param users The names of every championship racing in it
 * @returns The layer without it
 * @throws When it ships with the app, is not the user's, or a championship
 * still races in it
 */
export const withoutUserSpec = (
  layer: ClassLayer,
  catalogue: ClassCatalogue,
  id: string,
  users: readonly string[],
): ClassLayer => {
  assertUserSpec(layer, catalogue, id);

  // Refused rather than cascaded: a championship naming a spec that is gone is
  // one nobody can race, and the user is better told which before than after.
  if (users.length > 0) {
    throw new AppError('classes.spec.inUse', { spec: carSpecName(id, catalogue), series: users.join(', ') });
  }

  const cars = Object.entries(layer.cars).reduce<Record<string, SpecId[]>>(
    (settled, [car, held]) => (held.includes(id)
      ? settleCar(settled, car, held.filter((spec) => spec !== id))
      : { ...settled, [car]: held }),
    {},
  );

  return { ...layer, specs: layer.specs.filter((one) => one.id !== id), cars };
};

/**
 * Deletes a class of the user's, and every spec in it with it.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param id The class
 * @param usersOf The names of every championship racing in a spec
 * @returns The layer without the class or its specs
 * @throws When it ships with the app, is not the user's, or a championship
 * still races in one of its specs
 */
export const withoutUserClass = (
  layer: ClassLayer,
  catalogue: ClassCatalogue,
  id: string,
  usersOf: (spec: SpecId) => readonly string[],
): ClassLayer => {
  assertUserClass(layer, catalogue, id);

  // Each spec goes the way deleting it alone would, so one a championship
  // still races in refuses the whole delete.
  const emptied = layer.specs
    .filter((spec) => spec.class === id)
    .reduce((current, spec) => withoutUserSpec(current, catalogue, spec.id, usersOf(spec.id)), layer);

  return { ...emptied, classes: emptied.classes.filter((one) => one.id !== id) };
};

/**
 * The first of `base`, `base 2`, `base 3` and so on that nothing has spent.
 * @param base The name wanted
 * @param spent Every name in use, folded to lower case
 * @returns A name free to take
 */
const unspentName = (base: string, spent: ReadonlySet<string>): string => {
  let name = base;
  let n = 1;
  while (spent.has(name.toLocaleLowerCase())) {
    n += 1;
    name = `${base} ${n}`;
  }

  return name;
};

/**
 * Copies a class, shipped or the user's, into a new class of the user's.
 *
 * Every spec comes along as a spec of the user's, renamed after the new class
 * since spec names are unique across the catalogue, and every car racing in one
 * races in its copy too - a copy with empty grids is a template, not a copy.
 * @param layer The user's layer
 * @param catalogue The catalogue resolved from it
 * @param from The class to copy
 * @param draftName What to call the copy
 * @param fresh Mints an id, once for the class and once per spec
 * @returns The layer, and the id of the new class
 * @throws When the class does not resolve, or the name is blank or taken
 */
export const withClassCopy = (
  layer: ClassLayer,
  catalogue: ClassCatalogue,
  from: string,
  draftName: string,
  fresh: () => string,
): { layer: ClassLayer; id: string } => {
  const copied = catalogue.classById.get(from);
  if (!copied) throw new AppError('classes.class.notFound', { class: from });

  const name = freeName(draftName, catalogue.classes.map((one) => one.name));
  const id = fresh();

  const spent = new Set([...catalogue.specById.values()].map((one) => one.name.toLocaleLowerCase()));
  const copies = new Map<SpecId, UserCarSpec>();
  copied.specs.forEach((spec) => {
    // "Formula 1 1954" copied into "F1 Mods" reads "F1 Mods 1954"; a spec not
    // named after its class keeps its name and says where it came from.
    const original = carSpecName(spec, catalogue);
    const renamed = original.startsWith(`${copied.name} `)
      ? `${name}${original.slice(copied.name.length)}`
      : `${original} (${name})`;
    const specName = unspentName(renamed, spent);
    spent.add(specName.toLocaleLowerCase());
    copies.set(spec, { id: fresh(), name: specName, class: id });
  });

  // No clash to check: a car holds at most one spec of the original, so it
  // gains at most one of the copy. Added to what the car stores rather than to
  // what resolves, so a spec that does not resolve today is not lost.
  const cars = [...catalogue.specsByCar].reduce<Record<string, SpecId[]>>((settled, [car, held]) => {
    const gained = held.flatMap((spec) => {
      const copy = copies.get(spec);

      return copy ? [copy.id] : [];
    });
    if (gained.length === 0) return settled;

    const stored = layer.cars[car] ?? SHIPPED_CATALOGUE.specsByCar.get(car) ?? [];

    return settleCar(settled, car, [...stored, ...gained]);
  }, layer.cars);

  return {
    layer: {
      ...layer,
      classes: [...layer.classes, { id, name }],
      specs: [...layer.specs, ...copies.values()],
      cars,
    },
    id,
  };
};
