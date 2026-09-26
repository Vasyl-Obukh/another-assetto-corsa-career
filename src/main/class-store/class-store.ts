// The user's layer over the shipped class catalogue: read once at startup,
// answered from memory, and written back whole after every command.
//
// The edits themselves live in src/shared/utils/class-layer/, pure, so this
// store is only the disk half - what to do with a file that will not read, and
// making sure two commands never write at once.

import { randomUUID } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { CLASSES_FILE } from './constants.ts';
import type { ClassStore } from './types.ts';
import { EMPTY_CLASS_LAYER } from '../../shared/constants/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { ClassCommandResult, ClassLayer } from '../../shared/types/index.ts';
import { resolveCatalogue } from '../../shared/utils/car-classes/index.ts';
import {
  readClassLayer,
  withCarSpecs,
  withClassCopy,
  withoutCarSpecs,
  withoutUserClass,
  withoutUserSpec,
  withSpecCars,
  withUserClass,
  withUserSpec,
} from '../../shared/utils/class-layer/index.ts';
import { quarantine } from '../settings-store/index.ts';

export type { ClassStore } from './types.ts';

/**
 * A fresh layer that adds nothing.
 * @returns An empty layer the store may change
 */
const emptyLayer = (): ClassLayer => structuredClone(EMPTY_CLASS_LAYER);

/**
 * Reads the user's layer, never refusing to start over it.
 *
 * A missing file is a user who has classified nothing. Any other failure moves
 * the file aside rather than leaving it where the next command would write over
 * it - it is the user's own work, the way settings.json is.
 * @param file Absolute path to car-classes.json
 * @returns The layer to start from
 */
const loadLayer = async (file: string): Promise<ClassLayer> => {
  try {
    return readClassLayer(JSON.parse(await readFile(file, 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      const moved = await quarantine(file);
      console.warn(`Class catalogue was unreadable; ${moved ? `moved to ${moved}` : 'ignoring it'}.`, error);
    }

    return emptyLayer();
  }
};

/**
 * Loads the user's class layer and returns a store over it.
 * @param userDataDir Folder car-classes.json lives in
 * @returns A store holding the loaded layer
 */
export const createClassStore = async (userDataDir: string): Promise<ClassStore> => {
  const file = path.join(userDataDir, CLASSES_FILE);
  const tmp = `${file}.tmp`;

  let layer = await loadLayer(file);
  let catalogue = resolveCatalogue(layer);

  const listeners = new Set<(next: ClassLayer) => void>();
  // Commands run one after another, so two quick clicks never share the .tmp.
  let queue: Promise<unknown> = Promise.resolve();

  /**
   * Runs one edit against the layer as it stands once earlier commands finish,
   * writes the result and tells everyone.
   * @param edit Builds the next layer from the current one, throwing to refuse
   * @returns What the command answers with
   */
  const commit = (
    edit: (current: ClassLayer) => { layer: ClassLayer; id: string | null },
  ): Promise<ClassCommandResult> => {
    const run = queue.then(async () => {
      const next = edit(layer);

      try {
        await writeFile(tmp, JSON.stringify(next.layer, null, 2), 'utf8');
        await rename(tmp, file);
      } catch (error) {
        throw new AppError('classes.writeFailed', { reason: (error as Error).message });
      }

      layer = next.layer;
      catalogue = resolveCatalogue(layer);
      listeners.forEach((listener) => listener(layer));

      return { layer, id: next.id };
    });
    queue = run.catch(() => undefined);

    return run;
  };

  return {
    layer: () => layer,
    catalogue: () => catalogue,

    assignCar: (car, specs) => commit((current) => ({
      layer: withCarSpecs(current, catalogue, car, specs), id: car,
    })),

    revertCar: (car) => commit((current) => ({ layer: withoutCarSpecs(current, car), id: car })),

    saveClass: (draft) => commit((current) => withUserClass(current, catalogue, draft, randomUUID())),

    deleteClass: (id, usersOf) => commit((current) => ({
      layer: withoutUserClass(current, catalogue, id, usersOf), id: null,
    })),

    copyClass: (id, name) => commit((current) => withClassCopy(current, catalogue, id, name, randomUUID)),

    saveSpec: (draft) => commit((current) => withUserSpec(current, catalogue, draft, randomUUID())),

    saveSpecCars: (spec, cars) => commit((current) => {
      // A spec the app ships keeps its name, so only its cars are restated.
      const { id } = spec;
      const named = id !== undefined && catalogue.specById.get(id)?.origin === 'shipped'
        ? { layer: current, id }
        : withUserSpec(current, catalogue, spec, randomUUID());

      return { layer: withSpecCars(named.layer, resolveCatalogue(named.layer), named.id, cars), id: named.id };
    }),

    deleteSpec: (id, users) => commit((current) => ({
      layer: withoutUserSpec(current, catalogue, id, users), id: null,
    })),

    onChange(listener) {
      listeners.add(listener);

      return () => { listeners.delete(listener); };
    },
  };
};
