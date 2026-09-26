import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  copyFile, readFile, rename, unlink, writeFile,
} from 'node:fs/promises';

import { EMPTY_CLASS_LAYER } from '../../../shared/constants/index.ts';
import { SHIPPED_CATALOGUE } from '../../../shared/utils/car-classes/index.ts';
import { createClassStore } from '../class-store.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const renameMock = jest.mocked(rename);
const copyFileMock = jest.mocked(copyFile);

/**
 * An error carrying one of Node's codes.
 * @param code The errno code
 * @returns The error
 */
const errno = (code: string): NodeJS.ErrnoException => Object.assign(new Error(code), { code });

/**
 * A car the app ships a classification for.
 * @returns Its folder ID
 */
const shippedCar = (): string => {
  const [first] = SHIPPED_CATALOGUE.specsByCar.keys();
  if (first === undefined) throw new Error('the catalogue classifies no cars at all');

  return first;
};

describe('main/class-store', () => {
  beforeEach(() => {
    readFileMock.mockRejectedValue(errno('ENOENT'));
    writeFileMock.mockResolvedValue(undefined);
    renameMock.mockResolvedValue(undefined);
    copyFileMock.mockResolvedValue(undefined);
    jest.mocked(unlink).mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('createClassStore', () => {
    it('starts from what the app ships when there is no file yet, quarantining nothing', async () => {
      const store = await createClassStore('D:\\userData');

      expect(store.layer()).toEqual(EMPTY_CLASS_LAYER);
      expect(store.catalogue().classes).toHaveLength(SHIPPED_CATALOGUE.classes.length);
      expect(copyFileMock).not.toHaveBeenCalled();
    });

    it('loads the file through the tolerant reader', async () => {
      readFileMock.mockResolvedValue(JSON.stringify({
        classes: [{ id: 'mine', name: 'Hillclimb' }, { name: 'No id' }],
      }));

      const store = await createClassStore('D:\\userData');

      expect(store.layer().classes).toEqual([{ id: 'mine', name: 'Hillclimb' }]);
      expect(store.catalogue().classById.get('mine')?.origin).toBe('user');
    });

    it('quarantines a file that is not JSON and starts from what the app ships', async () => {
      readFileMock.mockResolvedValue('{ not json');

      const store = await createClassStore('D:\\userData');

      expect(copyFileMock).toHaveBeenCalledWith(
        expect.stringContaining('car-classes.json'),
        expect.stringContaining('car-classes.corrupt-1.json'),
        expect.any(Number),
      );
      expect(store.layer()).toEqual(EMPTY_CLASS_LAYER);
    });

    // A file locked by an editor or a sync client used to be left in place and
    // started over empty, so the next command wrote the user's work away.
    it('quarantines a file it could not read, rather than writing over it later', async () => {
      readFileMock.mockRejectedValue(errno('EBUSY'));

      await createClassStore('D:\\userData');

      expect(copyFileMock).toHaveBeenCalledWith(
        expect.stringContaining('car-classes.json'),
        expect.stringContaining('car-classes.corrupt-1.json'),
        expect.any(Number),
      );
    });

    it('writes through a temp file and renames, answering with the layer and what it made', async () => {
      const store = await createClassStore('D:\\userData');
      const answer = await store.saveClass({ name: 'Hillclimb' });

      const [tmp, written] = writeFileMock.mock.calls[0];
      expect(String(tmp)).toMatch(/car-classes\.json\.tmp$/);
      expect(renameMock).toHaveBeenCalledWith(String(tmp), expect.stringMatching(/car-classes\.json$/));
      expect(JSON.parse(written as string)).toEqual(answer.layer);
      expect(answer.layer.classes).toEqual([{ id: answer.id, name: 'Hillclimb' }]);
    });

    it('resolves the catalogue again and tells every listener', async () => {
      const store = await createClassStore('D:\\userData');
      const listener = jest.fn();
      store.onChange(listener);

      const { id, layer } = await store.saveClass({ name: 'Hillclimb' });

      expect(listener).toHaveBeenCalledWith(layer);
      expect(store.catalogue().classById.get(id ?? '')?.name).toBe('Hillclimb');
    });

    it('stops telling a listener once it unsubscribes', async () => {
      const store = await createClassStore('D:\\userData');
      const listener = jest.fn();
      const off = store.onChange(listener);

      await store.saveClass({ name: 'Hillclimb' });
      off();
      await store.saveClass({ name: 'Rallycross' });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('restates a car and reverts it again', async () => {
      const car = shippedCar();
      const store = await createClassStore('D:\\userData');

      await store.assignCar(car, []);
      expect(store.catalogue().overridden.has(car)).toBe(true);

      await store.revertCar(car);
      expect(store.layer().cars).toEqual({});
    });

    it('refuses an edit without writing anything or changing the layer', async () => {
      const store = await createClassStore('D:\\userData');

      await expect(store.deleteClass(SHIPPED_CATALOGUE.classes[0].id, () => []))
        .rejects.toMatchObject({ code: 'classes.class.shipped' });
      expect(writeFileMock).not.toHaveBeenCalled();
      expect(store.layer()).toEqual(EMPTY_CLASS_LAYER);
    });

    it('reports a failed write and keeps the layer it had', async () => {
      writeFileMock.mockRejectedValue(errno('EPERM'));
      const store = await createClassStore('D:\\userData');
      const listener = jest.fn();
      store.onChange(listener);

      await expect(store.saveClass({ name: 'Hillclimb' })).rejects.toMatchObject({ code: 'classes.writeFailed' });
      expect(store.layer()).toEqual(EMPTY_CLASS_LAYER);
      expect(listener).not.toHaveBeenCalled();
    });

    // Sent together, the second has to see what the first wrote, or two quick
    // clicks would both claim the name and share the .tmp.
    it('runs commands one after another, each over the layer the last one left', async () => {
      const store = await createClassStore('D:\\userData');

      const first = store.saveClass({ name: 'Hillclimb' });
      const second = store.saveClass({ name: 'hillclimb' });

      await expect(first).resolves.toBeDefined();
      await expect(second).rejects.toMatchObject({ code: 'classes.name.taken' });
    });

    it('carries on after a refused command', async () => {
      const store = await createClassStore('D:\\userData');

      await expect(store.saveClass({ name: '' })).rejects.toMatchObject({ code: 'classes.name.empty' });
      await expect(store.saveClass({ name: 'Hillclimb' })).resolves.toMatchObject({ id: expect.any(String) });
    });

    it('deletes a spec only once no championship races in it', async () => {
      const store = await createClassStore('D:\\userData');
      const carClass = SHIPPED_CATALOGUE.classes[0].id;
      const { id } = await store.saveSpec({ name: 'Another era', class: carClass });

      await expect(store.deleteSpec(id ?? '', ['Hill Cup'])).rejects.toMatchObject({ code: 'classes.spec.inUse' });
      await store.deleteSpec(id ?? '', []);
      expect(store.layer().specs).toEqual([]);
    });

    it('copies a class, answering with the copy', async () => {
      const store = await createClassStore('D:\\userData');
      const original = SHIPPED_CATALOGUE.classes[0];
      const { id } = await store.copyClass(original.id, 'Mine');

      expect(store.catalogue().classById.get(id ?? '')).toMatchObject({ name: 'Mine', origin: 'user' });
      expect(store.catalogue().classById.get(id ?? '')?.specs).toHaveLength(original.specs.length);
    });

    it('deletes a class with its specs, asking which championships race each', async () => {
      const store = await createClassStore('D:\\userData');
      const { id: carClass } = await store.saveClass({ name: 'Hillclimb' });
      const { id: spec } = await store.saveSpec({ name: 'Hillclimb (2020s)', class: carClass ?? '' });
      const usersOf = jest.fn((_spec: string): string[] => []);

      await store.deleteClass(carClass ?? '', usersOf);

      expect(usersOf).toHaveBeenCalledWith(spec ?? '');
      expect(store.layer()).toMatchObject({ classes: [], specs: [] });
    });

    it('makes a spec and its cars in one write, answering with its id', async () => {
      const store = await createClassStore('D:\\userData');
      const { id: carClass } = await store.saveClass({ name: 'Hillclimb' });
      writeFileMock.mockClear();

      const { id } = await store.saveSpecCars({ name: 'Hillclimb (2020s)', class: carClass ?? '' }, ['my_mod']);

      expect(writeFileMock).toHaveBeenCalledTimes(1);
      expect(store.catalogue().specById.get(id ?? '')).toMatchObject({ name: 'Hillclimb (2020s)', origin: 'user' });
      expect(store.catalogue().carsBySpec.get(id ?? '')).toEqual(['my_mod']);
    });

    it('restates the cars of a spec the app ships without renaming it', async () => {
      const store = await createClassStore('D:\\userData');
      const carClass = SHIPPED_CATALOGUE.classes[0];
      const [spec] = carClass.specs;
      const shipped = SHIPPED_CATALOGUE.carsBySpec.get(spec) ?? [];

      const { id } = await store.saveSpecCars({ id: spec, name: 'Renamed', class: carClass.id }, [...shipped, 'my_mod']);

      expect(id).toBe(spec);
      expect(store.catalogue().specById.get(spec)?.name).toBe(SHIPPED_CATALOGUE.specById.get(spec)?.name);
      expect(store.catalogue().carsBySpec.get(spec)).toContain('my_mod');
      expect(store.layer().specs).toEqual([]);
    });
  });
});
