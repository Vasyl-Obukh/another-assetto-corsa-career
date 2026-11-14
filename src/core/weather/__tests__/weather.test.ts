import { describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { RAIN_FX_FILE, WEATHER_FX_FILE } from '../constants.ts';
import { readWeatherFx, readWeatherFxController } from '../weather.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);

const AC_ROOT = 'D:\\ac';
const DOCUMENTS = 'D:\\docs\\Assetto Corsa';

/**
 * Stands the mocked reads up over a map of files, everything else being absent.
 * @param files The files that exist, keyed by absolute path
 * @returns Nothing; the mock is installed as a side effect
 */
const withFiles = (files: Record<string, string>): void => {
  // Cast because readFile's buffer overload is the one an implementation is
  // matched against, and every read under test asks for utf8.
  readFileMock.mockImplementation((async (file: string) => {
    const found = files[String(file)];
    if (found === undefined) throw Object.assign(new Error('missing'), { code: 'ENOENT' });

    return found;
  }) as never);
};

describe('core/weather', () => {
  describe('readWeatherFxController', () => {
    it('names the controller the user\'s own settings run', async () => {
      withFiles({
        [path.join(DOCUMENTS, WEATHER_FX_FILE)]: '[BASIC]\nENABLED=1\nCONTROLLER=sol2\n',
      });

      await expect(readWeatherFxController(DOCUMENTS)).resolves.toBe('sol2');
    });

    // CSP quotes a controller whose folder has a space in it, and the INI
    // reader keeps the quotes because AC's own files never use them.
    it('strips the quotes CSP writes round a name with a space', async () => {
      withFiles({
        [path.join(DOCUMENTS, WEATHER_FX_FILE)]: "[BASIC]\nCONTROLLER='pureCtrl static'\n",
      });

      await expect(readWeatherFxController(DOCUMENTS)).resolves.toBe('pureCtrl static');
    });

    it('says it does not know rather than guessing, when there is no file', async () => {
      withFiles({});

      await expect(readWeatherFxController(DOCUMENTS)).resolves.toBeNull();
    });

    it('says it does not know when the key is there but empty', async () => {
      withFiles({ [path.join(DOCUMENTS, WEATHER_FX_FILE)]: '[BASIC]\nCONTROLLER=\n' });

      await expect(readWeatherFxController(DOCUMENTS)).resolves.toBeNull();
    });
  });

  describe('readWeatherFx', () => {
    // Neither module reports itself anywhere, and either being off makes a race
    // run in weather nobody asked for, so both are read rather than assumed.
    it('reads both modules as the user has them', async () => {
      withFiles({
        [path.join(DOCUMENTS, WEATHER_FX_FILE)]: '[BASIC]\nENABLED=0\n',
        [path.join(DOCUMENTS, RAIN_FX_FILE)]: '[BASIC]\nENABLED=1\n',
      });

      await expect(readWeatherFx(AC_ROOT, DOCUMENTS))
        .resolves.toEqual({ weatherFx: false, rainFx: true });
    });

    it('lets the user\'s own copy win over the shipped default', async () => {
      withFiles({
        [path.join(AC_ROOT, 'extension', 'config', 'rain_fx.ini')]: '[BASIC]\nENABLED=0\n',
        [path.join(DOCUMENTS, RAIN_FX_FILE)]: '[BASIC]\nENABLED=1\n',
      });

      await expect(readWeatherFx(AC_ROOT, DOCUMENTS)).resolves.toMatchObject({ rainFx: true });
    });

    it('falls back to the shipped default when the user has overridden nothing', async () => {
      withFiles({
        [path.join(AC_ROOT, 'extension', 'config', 'weather_fx.ini')]: '[BASIC]\nENABLED=0\n',
      });

      await expect(readWeatherFx(AC_ROOT, DOCUMENTS)).resolves.toMatchObject({ weatherFx: false });
    });

    // Enabled is the shipped default, so guessing the other way would hide
    // options that work on an install whose config files were never written.
    it('reads an install with no config files at all as enabled', async () => {
      withFiles({});

      await expect(readWeatherFx(AC_ROOT, DOCUMENTS))
        .resolves.toEqual({ weatherFx: true, rainFx: true });
    });
  });
});
