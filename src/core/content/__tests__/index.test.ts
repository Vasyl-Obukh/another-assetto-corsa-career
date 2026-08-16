import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { readFile, stat } from 'node:fs/promises';


import {
  fileExists, scanCars, scanContent, scanTracks, scanWeather, scanWeatherControllers, skinPreview,
} from '../index.ts';
import { listDirs, readJsonFile } from '../utils.ts';

jest.mock('node:fs/promises');
jest.mock('../utils.ts', () => ({
  ...jest.requireActual<typeof import('../utils.ts')>('../utils.ts'),
  listDirs: jest.fn(),
  readJsonFile: jest.fn(),
}));

const listDirsMock = jest.mocked(listDirs);
const readJsonFileMock = jest.mocked(readJsonFile);
const readFileMock = jest.mocked(readFile);
const statMock = jest.mocked(stat);

/**
 * Types a readJsonFile stand-in. The real function is generic, so a concrete
 * return type cannot satisfy its signature without this.
 * @param impl Returns the parsed contents for a given file path
 * @returns The implementation, typed for the mock
 */
const jsonFor = (impl: (file: string) => unknown) => (
  (async (file: string) => impl(file)) as never
);

describe('core/content', () => {
  beforeEach(() => {
    listDirsMock.mockResolvedValue([]);
    readJsonFileMock.mockResolvedValue(null);
  });

  describe('scanCars', () => {
    it('reads name, brand and skins from ui_car.json', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : ['red', 'blue']));
      readJsonFileMock.mockResolvedValue({ name: 'Car A', brand: 'Marque', tags: ['gt3'] });

      await expect(scanCars('content')).resolves.toEqual([{
        id: 'car_a', name: 'Car A', brand: 'Marque', tags: ['gt3'], skins: ['red', 'blue'],
      }]);
    });

    it('falls back to the folder name when the mod has no ui_car.json', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['nameless_mod'] : []));

      const [car] = await scanCars('content');
      expect(car).toMatchObject({ id: 'nameless_mod', name: 'nameless_mod', brand: null });
    });

    it('sorts by display name, not folder name', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['zeta', 'alpha'] : []));
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        file.includes('zeta') ? { name: 'Aardvark' } : { name: 'Zebra' }
      )));

      const names = (await scanCars('content')).map((car) => car.name);
      expect(names).toEqual(['Aardvark', 'Zebra']);
    });

    it('skips hidden folders', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['.git', 'car_a'] : []));

      const cars = await scanCars('content');
      expect(cars.map((car) => car.id)).toEqual(['car_a']);
    });

    it('defaults tags to an empty array when the mod writes nonsense', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : []));
      readJsonFileMock.mockResolvedValue({ name: 'A', tags: 'not-an-array' });

      expect((await scanCars('content'))[0].tags).toEqual([]);
    });
  });

  describe('scanTracks', () => {
    it('reads a single-layout track from ui/ui_track.json', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('tracks') ? ['spa'] : []));
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        file.endsWith('ui\\ui_track.json') || file.endsWith('ui/ui_track.json')
          ? { name: 'Spa', pitboxes: 24 }
          : null
      )));

      await expect(scanTracks('content')).resolves.toEqual([expect.objectContaining({
        id: 'spa', layout: '', key: 'spa', name: 'Spa', pitboxes: 24,
      })]);
    });

    it('produces one entry per layout for a multi-layout track', async () => {
      listDirsMock.mockImplementation(async (dir) => {
        if (dir.endsWith('tracks')) return ['multi'];
        return ['gp', 'club'];
      });
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        /ui[\\/]ui_track\.json$/.test(file) ? null : { name: file.includes('gp') ? 'GP' : 'Club' }
      )));

      const tracks = await scanTracks('content');
      expect(tracks.map((track) => track.key).sort()).toEqual(['multi/club', 'multi/gp']);
    });

    it('skips a layout whose ui_track.json cannot be read at all', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('tracks') ? ['multi'] : ['broken']));
      readJsonFileMock.mockResolvedValue(null);

      await expect(scanTracks('content')).resolves.toEqual([]);
    });
  });

  describe('scanWeather', () => {
    it('reads the CSP weather type from the ini rather than a hardcoded table', async () => {
      listDirsMock.mockResolvedValue(['career_rain']);
      readFileMock.mockResolvedValue(
        '[LAUNCHER]\nNAME=Rain\nTEMPERATURE_COEFF=-0.2\n[__LAUNCHER_CM]\nWEATHER_TYPE=7\nAUTHOR=Me',
      );

      await expect(scanWeather('content')).resolves.toEqual([{
        id: 'career_rain', name: 'Rain', type: 7, temperatureCoeff: -0.2, author: 'Me',
      }]);
    });

    it('leaves the type null for a Kunos weather with no __LAUNCHER_CM section', async () => {
      listDirsMock.mockResolvedValue(['3_clear']);
      readFileMock.mockResolvedValue('[LAUNCHER]\nNAME=Clear');

      const [weather] = await scanWeather('content');
      expect(weather).toMatchObject({ type: null, author: null, temperatureCoeff: 0 });
    });

    it('skips a preset whose weather.ini cannot be read', async () => {
      listDirsMock.mockResolvedValue(['broken']);
      readFileMock.mockRejectedValue(new Error('ENOENT'));

      await expect(scanWeather('content')).resolves.toEqual([]);
    });

    it('sorts by id', async () => {
      listDirsMock.mockResolvedValue(['z_weather', 'a_weather']);
      readFileMock.mockResolvedValue('[LAUNCHER]\nNAME=W');

      const ids = (await scanWeather('content')).map((weather) => weather.id);
      expect(ids).toEqual(['a_weather', 'z_weather']);
    });
  });

  describe('scanWeatherControllers', () => {
    it('reads the manifest', async () => {
      listDirsMock.mockResolvedValue(['pureCtrl static']);
      readFileMock.mockResolvedValue('[ABOUT]\nNAME=Pure Static\nAUTHOR=Peter\nDESCRIPTION=Fixed');

      await expect(scanWeatherControllers('acRoot')).resolves.toEqual([{
        id: 'pureCtrl static', name: 'Pure Static', author: 'Peter', description: 'Fixed',
      }]);
    });

    it('keeps a controller that has no manifest, since the id is what matters', async () => {
      listDirsMock.mockResolvedValue(['bareCtrl']);
      readFileMock.mockRejectedValue(new Error('ENOENT'));

      await expect(scanWeatherControllers('acRoot')).resolves.toEqual([{
        id: 'bareCtrl', name: 'bareCtrl', author: null, description: null,
      }]);
    });
  });

  describe('scanContent', () => {
    it('derives the AC root from the content directory', async () => {
      listDirsMock.mockResolvedValue([]);

      await scanContent('D:\\ac\\content');

      expect(listDirsMock).toHaveBeenCalledWith(expect.stringContaining('D:\\ac\\extension'));
    });

    it('returns all four collections', async () => {
      listDirsMock.mockResolvedValue([]);

      await expect(scanContent('D:\\ac\\content')).resolves.toEqual({
        cars: [], tracks: [], weather: [], controllers: [],
      });
    });
  });

  describe('skinPreview', () => {
    it('builds the path to a skin preview image', () => {
      expect(skinPreview('D:\\ac\\content', 'car_a', 'red'))
        .toBe('D:\\ac\\content\\cars\\car_a\\skins\\red\\preview.jpg');
    });
  });

  describe('fileExists', () => {
    it('is true when the path is there', async () => {
      statMock.mockResolvedValue({} as never);
      await expect(fileExists('D:\\ac')).resolves.toBe(true);
    });

    it('is false rather than throwing when it is not', async () => {
      statMock.mockRejectedValue(new Error('ENOENT'));
      await expect(fileExists('D:\\nope')).resolves.toBe(false);
    });
  });
});
