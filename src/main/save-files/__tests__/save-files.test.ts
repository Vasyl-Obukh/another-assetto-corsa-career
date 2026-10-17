import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  copyFile, mkdir, readdir, readFile, rename, rm, unlink, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  listSaves, readSave, removeSave, writeSave,
} from '../save-files.ts';
import type { SaveFile } from '../save-files.ts';

jest.mock('node:fs/promises');

/**
 * The saves folder every test reads.
 */
const DIR = path.join('D:\\careers', 'one', 'saves');

/**
 * A named save's id.
 */
const NAMED_ID = '00000000-0000-4000-8000-0000000000aa';

/**
 * Reads a state that is any object.
 * @param state The value off disk
 * @returns It, or null when it is not an object
 */
const readAny = (state: unknown): { day: number } | null => (
  typeof state === 'object' && state !== null ? state as { day: number } : null
);

/**
 * A save as its file holds it.
 * @param id Its id
 * @param savedAt When it was taken
 * @returns The save
 */
const save = (id: string, savedAt = '2027-03-01T10:00:00.000Z'): SaveFile<{ day: number }> => ({
  version: 1,
  id,
  kind: id === 'quicksave' ? 'quick' : 'named',
  name: id === 'quicksave' ? null : 'Before Spa',
  savedAt,
  date: '2027-03-01',
  moment: null,
  state: { day: 1 },
});

/**
 * An error carrying one of Node's codes.
 * @param code The errno code
 * @returns The error
 */
const errno = (code: string): NodeJS.ErrnoException => Object.assign(new Error(code), { code });

/**
 * Serves files out of the saves folder.
 * @param files What each file name holds
 */
const onDisk = (files: Record<string, string>): void => {
  jest.mocked(readdir).mockResolvedValue(Object.keys(files) as never);
  jest.mocked(readFile).mockImplementation((async (file: unknown) => {
    const held = files[path.basename(String(file))];
    if (held === undefined) throw errno('ENOENT');

    return held;
  }) as typeof readFile);
};

describe('main/save-files/save-files', () => {
  beforeEach(() => {
    jest.mocked(readdir).mockResolvedValue([]);
    jest.mocked(readFile).mockRejectedValue(errno('ENOENT'));
    jest.mocked(writeFile).mockResolvedValue(undefined);
    jest.mocked(rename).mockResolvedValue(undefined);
    jest.mocked(mkdir).mockResolvedValue(undefined);
    jest.mocked(rm).mockResolvedValue(undefined);
    jest.mocked(copyFile).mockResolvedValue(undefined);
    jest.mocked(unlink).mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('listSaves', () => {
    it('lists every save, newest first, without what they hold', async () => {
      onDisk({
        'quicksave.json': JSON.stringify(save('quicksave', '2027-03-01T10:00:00.000Z')),
        [`${NAMED_ID}.json`]: JSON.stringify(save(NAMED_ID, '2027-03-02T10:00:00.000Z')),
      });
      const saves = await listSaves(DIR, readAny);

      expect(saves.map((one) => one.id)).toEqual([NAMED_ID, 'quicksave']);
      expect(saves[0]).not.toHaveProperty('state');
    });

    it('leaves out a save that does not read, and leaves it where it is', async () => {
      onDisk({
        'quicksave.json': '{ not json',
        [`${NAMED_ID}.json`]: JSON.stringify(save(NAMED_ID)),
      });

      expect((await listSaves(DIR, readAny)).map((one) => one.id)).toEqual([NAMED_ID]);
      expect(copyFile).not.toHaveBeenCalled();
    });

    it('passes over files that are no save, a write left half done among them', async () => {
      onDisk({
        'notes.json': JSON.stringify(save(NAMED_ID)),
        'quicksave.json.tmp': JSON.stringify(save('quicksave')),
        'autosave-1.txt': 'x',
      });

      expect(await listSaves(DIR, readAny)).toEqual([]);
    });

    it('answers nothing for a slot with no saves folder yet', async () => {
      jest.mocked(readdir).mockRejectedValue(errno('ENOENT'));

      expect(await listSaves(DIR, readAny)).toEqual([]);
    });
  });

  describe('readSave', () => {
    it('reads a save with what it holds', async () => {
      onDisk({ [`${NAMED_ID}.json`]: JSON.stringify(save(NAMED_ID)) });

      expect(await readSave(DIR, NAMED_ID, readAny)).toEqual(save(NAMED_ID));
    });

    it('refuses a save that is not there', async () => {
      await expect(readSave(DIR, 'quicksave', readAny)).rejects.toMatchObject({ code: 'save.notFound' });
    });

    // The id names a file, so anything but a save's id could reach outside the
    // saves folder.
    it("refuses an id that is no save's, without reading anything", async () => {
      await expect(readSave(DIR, '..\\..\\career', readAny)).rejects.toMatchObject({ code: 'save.notFound' });
      expect(readFile).not.toHaveBeenCalled();
    });

    it('sets a save that does not read aside rather than loading it', async () => {
      onDisk({ 'quicksave.json': '{ not json' });

      await expect(readSave(DIR, 'quicksave', readAny)).rejects.toMatchObject({ code: 'save.unreadable' });
      expect(copyFile).toHaveBeenCalledWith(
        path.join(DIR, 'quicksave.json'),
        path.join(DIR, 'quicksave.corrupt-1.json'),
        expect.any(Number),
      );
    });
  });

  describe('writeSave', () => {
    it('writes the save whole beside its file, then puts it in place', async () => {
      await writeSave(DIR, save(NAMED_ID));
      const file = path.join(DIR, `${NAMED_ID}.json`);

      expect(mkdir).toHaveBeenCalledWith(DIR, { recursive: true });
      expect(JSON.parse(String(jest.mocked(writeFile).mock.calls[0][1]))).toEqual(save(NAMED_ID));
      expect(writeFile).toHaveBeenCalledWith(`${file}.tmp`, expect.any(String), 'utf8');
      expect(rename).toHaveBeenCalledWith(`${file}.tmp`, file);
    });

    it("refuses an id that is no save's", async () => {
      await expect(writeSave(DIR, save('../escape'))).rejects.toMatchObject({ code: 'save.notFound' });
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('removeSave', () => {
    it("deletes the save's file", async () => {
      await removeSave(DIR, NAMED_ID);

      expect(rm).toHaveBeenCalledWith(path.join(DIR, `${NAMED_ID}.json`));
    });

    it('refuses a save that is not there', async () => {
      jest.mocked(rm).mockRejectedValue(errno('ENOENT'));

      await expect(removeSave(DIR, NAMED_ID)).rejects.toMatchObject({ code: 'save.notFound' });
    });
  });
});
