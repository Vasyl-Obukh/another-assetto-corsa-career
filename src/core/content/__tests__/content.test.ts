import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { readFile, stat } from 'node:fs/promises';


import {
  carBadge,
  contentPath,
  contentWatchDirs,
  fileExists,
  isInsideContentDir,
  rescanContent,
  scanCars,
  scanContent,
  scanTracks,
  scanWeather,
  scanWeatherControllers,
  skinPreview,
  trackOutline,
  trackPreview,
} from '../content.ts';
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
 * The read outcome for a file that is not there.
 */
const MISSING = { value: null, salvaged: false, error: 'ENOENT' };

/**
 * Types a readJsonFile stand-in. The real function is generic, so a concrete
 * return type cannot satisfy its signature without this.
 * @param impl Returns the read outcome for a given file path
 * @returns The implementation, typed for the mock
 */
const jsonFor = (impl: (file: string) => unknown) => (
  (async (file: string) => impl(file)) as never
);

/**
 * A clean parse of the given object.
 * @param value What the file parsed to
 * @returns A read outcome saying so
 */
const parsed = (value: unknown) => ({ value, salvaged: false, error: null });

describe('core/content', () => {
  beforeEach(() => {
    listDirsMock.mockResolvedValue([]);
    readJsonFileMock.mockResolvedValue(MISSING);
    // Fingerprinting stats every file it would have read; nothing here is there.
    statMock.mockRejectedValue(new Error('ENOENT'));
  });

  describe('scanCars', () => {
    it('reads name, brand and skins from ui_car.json', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : ['red', 'blue']));
      readJsonFileMock.mockResolvedValue(
        parsed({ name: 'Car A', brand: 'Marque', tags: ['gt3'] }),
      );

      const { entries } = await scanCars('content');
      expect(entries).toEqual([expect.objectContaining({
        id: 'car_a', name: 'Car A', brand: 'Marque', tags: ['gt3'], skins: ['red', 'blue'],
      })]);
    });

    it('parses the specs block into numbers', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : ['red']));
      readJsonFileMock.mockResolvedValue(parsed({
        name: 'Car A',
        class: 'race',
        year: '1998',
        country: 'Italy',
        specs: { bhp: '560bhp', weight: '1,200 kg', topspeed: '300+ km/h' },
      }));

      const [car] = (await scanCars('content')).entries;
      expect(car).toMatchObject({ carClass: 'race', year: 1998, country: 'Italy' });
      expect(car.specs).toMatchObject({
        bhp: 560,
        weightKg: 1200,
        topSpeedKph: 300,
        powerToWeight: 560 / 1.2,
      });
    });

    it('falls back to the folder name when the mod has no ui_car.json', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['nameless_mod'] : ['red']));

      const { entries, issues } = await scanCars('content');
      expect(entries[0]).toMatchObject({ id: 'nameless_mod', name: 'nameless_mod', brand: null });
      // The car is still listed, but the missing metadata is reported rather
      // than silently becoming a folder name the user never chose.
      expect(issues).toEqual([{
        kind: 'car', id: 'nameless_mod', reason: 'uiMissing', detail: 'ENOENT',
      }]);
    });

    it('reports a car with no liveries, which cannot be put on a grid', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : []));
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car A' }));

      const { issues } = await scanCars('content');
      expect(issues).toContainEqual({
        kind: 'car', id: 'car_a', reason: 'noSkins', detail: null,
      });
    });

    it('reports a ui_car.json that only gave up its name', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : ['red']));
      readJsonFileMock.mockResolvedValue({
        value: { name: 'Salvaged' }, salvaged: true, error: null,
      });

      const { entries, issues } = await scanCars('content');
      expect(entries[0].name).toBe('Salvaged');
      expect(issues).toEqual([{
        kind: 'car', id: 'car_a', reason: 'uiSalvaged', detail: null,
      }]);
    });

    it('sorts by display name, not folder name', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['zeta', 'alpha'] : []));
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        file.includes('zeta') ? parsed({ name: 'Aardvark' }) : parsed({ name: 'Zebra' })
      )));

      const names = (await scanCars('content')).entries.map((car) => car.name);
      expect(names).toEqual(['Aardvark', 'Zebra']);
    });

    it('skips hidden folders', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['.git', 'car_a'] : []));

      const { entries } = await scanCars('content');
      expect(entries.map((car) => car.id)).toEqual(['car_a']);
    });

    it('defaults tags to an empty array when the mod writes nonsense', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : []));
      readJsonFileMock.mockResolvedValue(parsed({ name: 'A', tags: 'not-an-array' }));

      expect((await scanCars('content')).entries[0].tags).toEqual([]);
    });

    it('reuses a car whose fingerprint has not moved, without reading it again', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('cars') ? ['car_a'] : ['red']));
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car A' }));

      const first = await scanCars('content');
      readJsonFileMock.mockClear();

      const second = await scanCars('content', {
        entries: first.entries, fingerprints: first.fingerprints, issues: first.issues,
      });

      expect(second.entries).toEqual(first.entries);
      expect(readJsonFileMock).not.toHaveBeenCalled();
    });
  });

  describe('scanTracks', () => {
    it('reads a single-layout track from ui/ui_track.json', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('tracks') ? ['spa'] : []));
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        file.endsWith('ui\\ui_track.json') || file.endsWith('ui/ui_track.json')
          ? parsed({ name: 'Spa', pitboxes: 24 })
          : MISSING
      )));

      const { entries } = await scanTracks('content');
      expect(entries).toEqual([expect.objectContaining({
        id: 'spa', layout: '', key: 'spa', name: 'Spa', pitboxes: 24,
      })]);
    });

    it('produces one entry per layout for a multi-layout track', async () => {
      listDirsMock.mockImplementation(async (dir) => {
        if (dir.endsWith('tracks')) return ['multi'];
        return ['gp', 'club'];
      });
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        /ui[\\/]ui_track\.json$/.test(file)
          ? MISSING
          : parsed({ name: file.includes('gp') ? 'GP' : 'Club' })
      )));

      const { entries } = await scanTracks('content');
      expect(entries.map((track) => track.key).sort()).toEqual(['multi/club', 'multi/gp']);
    });

    // A layout pack dropped into a Kunos track keeps the original selectable, so
    // spa ships vanilla Spa plus 2022 and the two LFM starts. Returning as soon
    // as the root file was found hid 32 installed layouts across 18 tracks.
    it('reads the layouts beside a root ui_track.json as well as the root', async () => {
      listDirsMock.mockImplementation(async (dir) => {
        if (dir.endsWith('tracks')) return ['spa'];
        return ['2022', '2022_lfm_standing'];
      });
      readJsonFileMock.mockImplementation(jsonFor((file) => {
        if (/ui[\\/]ui_track\.json$/.test(file)) return parsed({ name: 'Spa' });
        return parsed({ name: file.includes('standing') ? 'Spa - LFM' : 'Spa 2022' });
      }));

      const { entries } = await scanTracks('content');

      expect(entries.map((track) => track.key).sort())
        .toEqual(['spa', 'spa/2022', 'spa/2022_lfm_standing']);
    });


    it('skips a layout whose ui_track.json cannot be read, and says so', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('tracks') ? ['multi'] : ['broken']));

      const { entries, issues } = await scanTracks('content');
      expect(entries).toEqual([]);
      expect(issues).toContainEqual({
        kind: 'track', id: 'multi/broken', reason: 'uiMissing', detail: 'ENOENT',
      });
      expect(issues).toContainEqual({
        kind: 'track', id: 'multi', reason: 'noLayouts', detail: null,
      });
    });

    it('reports a track folder with no ui metadata at all', async () => {
      listDirsMock.mockImplementation(async (dir) => (dir.endsWith('tracks') ? ['empty'] : []));

      const { issues } = await scanTracks('content');
      expect(issues).toEqual([{
        kind: 'track', id: 'empty', reason: 'uiMissing', detail: 'ENOENT',
      }]);
    });

    // A fresh scan discovers layouts in readdir order, a later one reads them
    // back off entries sorted by display name. Encoding those two orders
    // differently made every multi-layout track look changed on every scan.
    it('reuses a track whose fingerprint has not moved, without listing it again', async () => {
      listDirsMock.mockImplementation(async (dir) => {
        if (dir.endsWith('tracks')) return ['multi'];
        return ['gp', 'club'];
      });
      readJsonFileMock.mockImplementation(jsonFor((file) => (
        /ui[\\/]ui_track\.json$/.test(file)
          ? MISSING
          : parsed({ name: file.includes('gp') ? 'GP' : 'Club' })
      )));
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      const first = await scanTracks('content');
      listDirsMock.mockClear();
      readJsonFileMock.mockClear();

      const second = await scanTracks('content', {
        entries: first.entries, fingerprints: first.fingerprints, issues: first.issues,
      });

      expect(second.entries).toEqual(first.entries);
      expect(readJsonFileMock).not.toHaveBeenCalled();
      // Only the top-level tracks folder, never the ui folder of a track that
      // has not moved - that is what the ui folder's own stamp buys.
      expect(listDirsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('scanWeather', () => {
    it('reads the CSP weather type from the ini rather than a hardcoded table', async () => {
      listDirsMock.mockResolvedValue(['career_rain']);
      readFileMock.mockResolvedValue(
        '[LAUNCHER]\nNAME=Rain\nTEMPERATURE_COEFF=-0.2\n[__LAUNCHER_CM]\nWEATHER_TYPE=7\nAUTHOR=Me',
      );

      const { entries } = await scanWeather('content');
      expect(entries).toEqual([{
        id: 'career_rain', name: 'Rain', type: 7, temperatureCoeff: -0.2, author: 'Me',
      }]);
    });

    it('leaves the type null for a Kunos weather with no __LAUNCHER_CM section', async () => {
      listDirsMock.mockResolvedValue(['3_clear']);
      readFileMock.mockResolvedValue('[LAUNCHER]\nNAME=Clear');

      const [weather] = (await scanWeather('content')).entries;
      expect(weather).toMatchObject({ type: null, author: null, temperatureCoeff: 0 });
    });

    it('skips a preset whose weather.ini cannot be read, and says so', async () => {
      listDirsMock.mockResolvedValue(['broken']);
      readFileMock.mockRejectedValue(new Error('ENOENT'));

      const { entries, issues } = await scanWeather('content');
      expect(entries).toEqual([]);
      expect(issues).toEqual([{
        kind: 'weather', id: 'broken', reason: 'uiMissing', detail: 'ENOENT',
      }]);
    });

    it('sorts by id', async () => {
      listDirsMock.mockResolvedValue(['z_weather', 'a_weather']);
      readFileMock.mockResolvedValue('[LAUNCHER]\nNAME=W');

      const ids = (await scanWeather('content')).entries.map((weather) => weather.id);
      expect(ids).toEqual(['a_weather', 'z_weather']);
    });
  });

  describe('scanWeatherControllers', () => {
    it('reads the manifest', async () => {
      listDirsMock.mockResolvedValue(['pureCtrl static']);
      readFileMock.mockResolvedValue('[ABOUT]\nNAME=Pure Static\nAUTHOR=Peter\nDESCRIPTION=Fixed');

      const { entries } = await scanWeatherControllers('acRoot');
      expect(entries).toEqual([{
        id: 'pureCtrl static', name: 'Pure Static', author: 'Peter', description: 'Fixed',
      }]);
    });

    it('keeps a controller that has no manifest, since the id is what matters', async () => {
      listDirsMock.mockResolvedValue(['bareCtrl']);
      readFileMock.mockRejectedValue(new Error('ENOENT'));

      const { entries, issues } = await scanWeatherControllers('acRoot');
      expect(entries).toEqual([{
        id: 'bareCtrl', name: 'bareCtrl', author: null, description: null,
      }]);
      expect(issues).toEqual([]);
    });
  });

  describe('scanContent', () => {
    it('derives the AC root from the content directory', async () => {
      listDirsMock.mockResolvedValue([]);

      await scanContent('D:\\ac\\content');

      expect(listDirsMock).toHaveBeenCalledWith(expect.stringContaining('D:\\ac\\extension'));
    });

    it('returns all four collections plus anything broken', async () => {
      listDirsMock.mockResolvedValue([]);

      await expect(scanContent('D:\\ac\\content')).resolves.toEqual({
        cars: [], tracks: [], weather: [], controllers: [], issues: [],
      });
    });
  });

  describe('skinPreview', () => {
    it('builds the path to a skin preview image', () => {
      expect(skinPreview('D:\\ac\\content', 'car_a', 'red'))
        .toBe('D:\\ac\\content\\cars\\car_a\\skins\\red\\preview.jpg');
    });
  });

  describe('rescanContent', () => {
    /**
     * Points listDirs at a fixed library, so weather and controllers stay empty
     * and only cars and tracks are under test.
     * @param cars Car folder names
     * @param skins Livery folder names every car has
     */
    const library = (cars: string[], skins: string[] = ['red']): void => {
      listDirsMock.mockImplementation(async (dir) => {
        if (dir.endsWith('cars')) return cars;
        if (dir.endsWith('skins')) return skins;
        return [];
      });
    };

    it('re-reads nothing when no fingerprint moved', async () => {
      library(['car_a', 'car_b']);
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car' }));
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      const first = await rescanContent('D:\\ac\\content', null);
      readJsonFileMock.mockClear();

      const second = await rescanContent('D:\\ac\\content', first);

      expect(second.content.cars).toEqual(first.content.cars);
      expect(readJsonFileMock).not.toHaveBeenCalled();
    });

    it('re-reads only the car whose fingerprint moved', async () => {
      library(['car_a', 'car_b']);
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car' }));
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      const first = await rescanContent('D:\\ac\\content', null);
      readJsonFileMock.mockClear();
      statMock.mockImplementation(async (target) => (
        String(target).includes('car_b') ? { mtimeMs: 2000, size: 42 } : { mtimeMs: 1000, size: 42 }
      ) as never);
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Renamed' }));

      const second = await rescanContent('D:\\ac\\content', first);

      expect(readJsonFileMock).toHaveBeenCalledTimes(1);
      expect(readJsonFileMock).toHaveBeenCalledWith(expect.stringContaining('car_b'));
      expect(second.content.cars.map((car) => car.name).sort()).toEqual(['Car', 'Renamed']);
    });

    it('picks up a car that has appeared', async () => {
      library(['car_a']);
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car A' }));
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      const first = await rescanContent('D:\\ac\\content', null);

      library(['car_a', 'car_b']);
      readJsonFileMock.mockClear();
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car B' }));

      const second = await rescanContent('D:\\ac\\content', first);

      expect(second.content.cars.map((car) => car.id)).toEqual(['car_a', 'car_b']);
      expect(readJsonFileMock).toHaveBeenCalledTimes(1);
    });

    it('drops a car that has gone', async () => {
      library(['car_a', 'car_b']);
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car' }));
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      const first = await rescanContent('D:\\ac\\content', null);
      library(['car_a']);

      const second = await rescanContent('D:\\ac\\content', first);

      expect(second.content.cars.map((car) => car.id)).toEqual(['car_a']);
      expect(second.fingerprints.cars).not.toHaveProperty('car_b');
    });

    // A reused entry keeps its issue, or a broken mod stops being reported the
    // moment nothing about it changes - which is always.
    it('carries a reused entry"s issue forward rather than losing it', async () => {
      library(['broken'], []);
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      const first = await rescanContent('D:\\ac\\content', null);
      expect(first.content.issues).toContainEqual({
        kind: 'car', id: 'broken', reason: 'noSkins', detail: null,
      });

      const second = await rescanContent('D:\\ac\\content', first);
      expect(second.content.issues).toEqual(first.content.issues);
    });

    it('reports how long it took and when it finished', async () => {
      listDirsMock.mockResolvedValue([]);

      const scan = await rescanContent('D:\\ac\\content', null);

      expect(scan.durationMs).toBeGreaterThanOrEqual(0);
      expect(Date.parse(scan.scannedAt)).not.toBeNaN();
    });

    it('reads everything again when handed no previous scan', async () => {
      library(['car_a']);
      readJsonFileMock.mockResolvedValue(parsed({ name: 'Car A' }));
      statMock.mockResolvedValue({ mtimeMs: 1000, size: 42 } as never);

      await rescanContent('D:\\ac\\content', null);
      readJsonFileMock.mockClear();
      await rescanContent('D:\\ac\\content', null);

      expect(readJsonFileMock).toHaveBeenCalled();
    });
  });

  describe('carBadge', () => {
    it('builds the path to a manufacturer badge', () => {
      expect(carBadge('D:\\ac\\content', 'car_a'))
        .toBe('D:\\ac\\content\\cars\\car_a\\ui\\badge.png');
    });
  });

  describe('trackPreview', () => {
    it('builds the path for a single-layout track', () => {
      expect(trackPreview('D:\\ac\\content', 'spa', ''))
        .toBe('D:\\ac\\content\\tracks\\spa\\ui\\preview.png');
    });

    it('puts the layout folder in the path when there is one', () => {
      expect(trackPreview('D:\\ac\\content', 'multi', 'gp'))
        .toBe('D:\\ac\\content\\tracks\\multi\\ui\\gp\\preview.png');
    });
  });

  describe('trackOutline', () => {
    it('builds the path to a map outline', () => {
      expect(trackOutline('D:\\ac\\content', 'multi', 'gp'))
        .toBe('D:\\ac\\content\\tracks\\multi\\ui\\gp\\outline.png');
    });
  });

  describe('contentPath', () => {
    it('resolves every kind of target the protocol can be handed', () => {
      const dir = 'D:\\ac\\content';

      expect(contentPath(dir, { kind: 'carSkin', carId: 'a', skinId: 'red' }))
        .toBe('D:\\ac\\content\\cars\\a\\skins\\red\\preview.jpg');
      expect(contentPath(dir, { kind: 'carBadge', carId: 'a' }))
        .toBe('D:\\ac\\content\\cars\\a\\ui\\badge.png');
      expect(contentPath(dir, { kind: 'trackPreview', trackId: 't', layout: '' }))
        .toBe('D:\\ac\\content\\tracks\\t\\ui\\preview.png');
      expect(contentPath(dir, { kind: 'trackOutline', trackId: 't', layout: 'gp' }))
        .toBe('D:\\ac\\content\\tracks\\t\\ui\\gp\\outline.png');
    });
  });

  describe('contentWatchDirs', () => {
    it('watches the three content collections and the CSP controllers', () => {
      expect(contentWatchDirs('D:\\ac\\content')).toEqual([
        'D:\\ac\\content\\cars',
        'D:\\ac\\content\\tracks',
        'D:\\ac\\content\\weather',
        'D:\\ac\\extension\\weather-controllers',
      ]);
    });
  });

  describe('isInsideContentDir', () => {
    it('accepts a path under the content directory', () => {
      expect(isInsideContentDir('D:\\ac\\content', 'D:\\ac\\content\\cars\\a\\ui\\badge.png'))
        .toBe(true);
    });

    it('refuses a path that walks back out', () => {
      expect(isInsideContentDir('D:\\ac\\content', 'D:\\ac\\content\\..\\..\\windows\\win.ini'))
        .toBe(false);
    });

    it('refuses a path on another drive entirely', () => {
      expect(isInsideContentDir('D:\\ac\\content', 'C:\\windows\\win.ini')).toBe(false);
    });

    // Windows compares drive letters case-insensitively, and treating d:\ as
    // outside D:\ would reject perfectly ordinary paths.
    it('accepts a drive letter written in the other case', () => {
      expect(isInsideContentDir('D:\\ac\\content', 'd:\\ac\\content\\cars\\a\\ui\\badge.png'))
        .toBe(true);
    });

    it('refuses the content directory itself', () => {
      expect(isInsideContentDir('D:\\ac\\content', 'D:\\ac\\content')).toBe(false);
      expect(isInsideContentDir('D:\\ac\\content', 'D:\\ac\\content\\')).toBe(false);
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
