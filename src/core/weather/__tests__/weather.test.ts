import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  mkdir, readdir, readFile, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { CAREER_WEATHERS, RAIN_FX_FILE, WEATHER_FX_FILE } from '../constants.ts';
import {
  installCareerWeathers, readWeatherFx, readWeatherFxController, removeCareerWeathers,
} from '../weather.ts';

jest.mock('node:fs/promises');

const mkdirMock = jest.mocked(mkdir);
const writeFileMock = jest.mocked(writeFile);
const readdirMock = jest.mocked(readdir);
const readFileMock = jest.mocked(readFile);
const rmMock = jest.mocked(rm);

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
  beforeEach(() => {
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    rmMock.mockResolvedValue(undefined);
  });

  describe('installCareerWeathers', () => {
    it('writes one weather.ini per preset', async () => {
      await installCareerWeathers('D:\\ac\\content');

      expect(writeFileMock).toHaveBeenCalledTimes(CAREER_WEATHERS.length);
      expect(writeFileMock).toHaveBeenCalledWith(
        expect.stringContaining('career_heavy_rain\\weather.ini'),
        expect.stringContaining('[RAINFX]'),
      );
    });

    it('creates each folder first, and does not mind it existing already', async () => {
      await installCareerWeathers('D:\\ac\\content');

      expect(mkdirMock).toHaveBeenCalledWith(
        expect.stringContaining('career_clear'),
        { recursive: true },
      );
    });

    it('installs into content/weather beside the user\'s own presets', async () => {
      await installCareerWeathers('D:\\ac\\content');

      expect(mkdirMock).toHaveBeenCalledWith(
        expect.stringContaining('D:\\ac\\content\\weather'),
        expect.anything(),
      );
    });

    it('returns the ids it installed', async () => {
      await expect(installCareerWeathers('D:\\ac\\content')).resolves
        .toEqual(CAREER_WEATHERS.map((preset) => preset.id));
    });
  });

  describe('removeCareerWeathers', () => {
    it('removes only the folders this app created', async () => {
      readdirMock.mockResolvedValue(['career_clear', '3_clear', 'career_rain'] as never);

      await expect(removeCareerWeathers('D:\\ac\\content')).resolves
        .toEqual(['career_clear', 'career_rain']);
      expect(rmMock).toHaveBeenCalledTimes(2);
      expect(rmMock).not.toHaveBeenCalledWith(expect.stringContaining('3_clear'), expect.anything());
    });

    it('reports nothing when none are installed', async () => {
      readdirMock.mockResolvedValue(['3_clear'] as never);

      await expect(removeCareerWeathers('D:\\ac\\content')).resolves.toEqual([]);
      expect(rmMock).not.toHaveBeenCalled();
    });
  });

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
