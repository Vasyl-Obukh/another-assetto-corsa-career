import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  copyFile, readFile, rename, unlink, writeFile,
} from 'node:fs/promises';


import { DEFAULT_SETTINGS } from '../../../shared/constants/index.ts';
import { createSettingsStore } from '../settings-store.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const renameMock = jest.mocked(rename);
const copyFileMock = jest.mocked(copyFile);

/**
 * The error Node raises for a file that is not there.
 * @returns An error carrying code ENOENT
 */
const enoent = (): NodeJS.ErrnoException => (
  Object.assign(new Error('missing'), { code: 'ENOENT' })
);

describe('main/settings-store', () => {
  beforeEach(() => {
    writeFileMock.mockResolvedValue(undefined);
    renameMock.mockResolvedValue(undefined);
    copyFileMock.mockResolvedValue(undefined);
    jest.mocked(unlink).mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createSettingsStore', () => {
    it('starts from the defaults when there is no file yet', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      expect(store.get()).toEqual(DEFAULT_SETTINGS);
    });

    it('starts a fresh install on the units the machine reads', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData', async () => 'us');
      expect(store.get().units).toBe('us');
    });

    it('asks the machine for the units a file has not chosen', async () => {
      readFileMock.mockResolvedValue('{"theme":"dark","units":"imperial"}');

      const store = await createSettingsStore('D:\\userData', async () => 'uk');
      expect(store.get()).toMatchObject({ theme: 'dark', units: 'uk' });
    });

    // Reading the region spawns reg.exe, which a file that already chose is spared.
    it('does not ask the machine once the file has chosen its units', async () => {
      readFileMock.mockResolvedValue('{"units":"metric"}');
      const machineUnits = jest.fn(async () => 'us' as const);

      const store = await createSettingsStore('D:\\userData', machineUnits);
      expect(store.get().units).toBe('metric');
      expect(machineUnits).not.toHaveBeenCalled();
    });

    it('does not quarantine a file that simply does not exist', async () => {
      readFileMock.mockRejectedValue(enoent());

      await createSettingsStore('D:\\userData');
      expect(renameMock).not.toHaveBeenCalled();
    });

    it('loads an existing file, coercing what it holds', async () => {
      readFileMock.mockResolvedValue('{"theme":"dark","language":"uk"}');

      const store = await createSettingsStore('D:\\userData');
      expect(store.get()).toMatchObject({ theme: 'dark', language: 'uk', version: 1 });
    });

    it('quarantines a corrupt file and carries on with the defaults', async () => {
      readFileMock.mockResolvedValue('{ not json');

      const store = await createSettingsStore('D:\\userData');

      expect(copyFileMock).toHaveBeenCalledWith(
        expect.stringContaining('settings.json'),
        expect.stringContaining('settings.corrupt-1.json'),
        expect.any(Number),
      );
      expect(store.get()).toEqual(DEFAULT_SETTINGS);
    });

    it('applies a patch immediately in memory', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      expect(store.patch({ theme: 'dark' }).theme).toBe('dark');
      expect(store.get().theme).toBe('dark');
    });

    it('re-validates a patch rather than trusting it', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      expect(store.patch({ language: 'martian' } as never).language).toBe('en');
    });

    it('writes through a temp file and renames, so a write is never half-applied', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      store.patch({ theme: 'dark' });
      await store.flush();

      const tmpPath = String(writeFileMock.mock.calls[0][0]);
      expect(tmpPath).toMatch(/settings\.json\.tmp$/);
      expect(renameMock).toHaveBeenCalledWith(tmpPath, expect.stringMatching(/settings\.json$/));
    });

    it('coalesces rapid patches into one write', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      store.patch({ theme: 'dark' });
      store.patch({ theme: 'light' });
      store.patch({ language: 'uk' });
      await store.flush();

      expect(writeFileMock).toHaveBeenCalledTimes(1);
    });

    it('writes the settings as they finally stood', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      store.patch({ theme: 'dark' });
      store.patch({ theme: 'light' });
      await store.flush();

      expect(JSON.parse(writeFileMock.mock.calls[0][1] as string).theme).toBe('light');
    });

    it('notifies listeners on every patch', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      const seen: string[] = [];
      store.onChange((settings) => seen.push(settings.theme));

      store.patch({ theme: 'dark' });
      store.patch({ theme: 'light' });

      expect(seen).toEqual(['dark', 'light']);
    });

    it('stops notifying once a listener unsubscribes', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      const listener = jest.fn();
      const off = store.onChange(listener);

      store.patch({ theme: 'dark' });
      off();
      store.patch({ theme: 'light' });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('survives a failed write rather than crashing the app', async () => {
      readFileMock.mockRejectedValue(enoent());
      writeFileMock.mockRejectedValue(new Error('EPERM'));

      const store = await createSettingsStore('D:\\userData');
      store.patch({ theme: 'dark' });

      await expect(store.flush()).resolves.toBeUndefined();
    });

    it('flushes cleanly when there is nothing pending', async () => {
      readFileMock.mockRejectedValue(enoent());

      const store = await createSettingsStore('D:\\userData');
      await expect(store.flush()).resolves.toBeUndefined();
      expect(writeFileMock).not.toHaveBeenCalled();
    });
  });
});
