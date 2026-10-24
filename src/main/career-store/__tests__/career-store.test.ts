import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  access, copyFile, mkdir, readdir, readFile, rename, rm, unlink, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  CAREER_ID, makeAvailability, makeCar, makeCareer, makeChampionship, makeClassEntry, makeEntry, makeEvent, makeListing,
  makePlan, makeRound, makeSeason,
} from './fixtures.ts';
import { DEFAULT_CAREER_SETTINGS } from '../../../shared/constants/index.ts';
import { ContentSource } from '../../../shared/types/index.ts';
import type {
  Car,
  Career,
  CareerSeason,
  CareerSettings,
  DrivingAids,
  LaunchRecord,
  MissingTrack,
  NewCareerRequest,
  NewChampionshipRequest,
  RacePlace,
  RaceSetup,
  SeasonEntry,
  SeriesListing,
  SeriesRequirements,
  Settings,
} from '../../../shared/types/index.ts';
import { weekdayOf } from '../../../shared/utils/calendar-days/index.ts';
import { standaloneStanding } from '../../../shared/utils/standalone/index.ts';
import {
  fakeContentStore, fakeRaceStore, fakeSeriesStore, fakeSettingsStore, raceSetup,
} from '../../__tests__/fakes/index.ts';
import type { FakeRaceStore, FakeSeriesStore } from '../../__tests__/fakes/index.ts';
import { packZip, unpackZip } from '../../zip-archive/index.ts';
import { createCareerStore } from '../career-store.ts';
import type { CareerStore } from '../career-store.ts';
import { profileOf, stateOf } from '../utils.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);

/**
 * The moment every test runs at: early in a season, so the whole year is ahead.
 */
const NOW = new Date('2027-01-01T09:00:00.000Z');

/**
 * Everything a test builds a store over.
 */
interface Harness {
  /**
   * The store under test.
   */
  store: CareerStore;
  /**
   * The championship library it reads.
   */
  series: FakeSeriesStore;
  /**
   * The historic event library it draws from.
   */
  historic: FakeSeriesStore;
  /**
   * The race store it runs events through.
   */
  race: FakeRaceStore;
}

/**
 * What a test wants the store built over.
 */
interface HarnessOptions {
  /**
   * The championships the library holds.
   */
  listings?: readonly SeriesListing[];
  /**
   * The historic events the pool holds.
   */
  historic?: readonly SeriesListing[];
  /**
   * Settings beyond the defaults.
   */
  settings?: Partial<Settings>;
  /**
   * The career's own settings beyond the defaults, for the career it starts
   * or opens. Historic events are off unless a test turns them on, so a season
   * holds only what the test entered.
   */
  careerSettings?: Partial<CareerSettings>;
  /**
   * A career already on disk, which the harness opens - or, absent, the one it
   * starts as New career would.
   */
  career?: Career;
  /**
   * Leaves every career closed, as the start screen does.
   */
  closed?: boolean;
  /**
   * The cars installed, which are the whole library.
   */
  cars?: readonly Car[];
  /**
   * What each installed car costs, by folder ID.
   */
  prices?: Readonly<Record<string, number>>;
}

/**
 * The career a test starts when it has none on disk: the year the clock is in,
 * on the rung the cup's class sits.
 */
const NEW_CAREER: NewCareerRequest = {
  driver: { name: 'Test Driver', nation: 'GBR' },
  year: 2027,
  level: 4,
  money: 100_000,
  settings: { historicFrequency: 'off' },
};

/**
 * What New championship asks for: the cup's one class in its one car, raced in
 * a year of its own.
 */
const NEW_CHAMPIONSHIP: NewChampionshipRequest = {
  driver: { name: ' Oksana ', nation: 'UKR' },
  year: 2030,
  series: 'test-cup',
  entry: 'main',
  car: { model: 'test_car' },
};

/**
 * New career's request, with the career's own settings a test asks for.
 * @param settings The settings beyond the defaults
 * @returns The request
 */
const newCareer = (settings: Partial<CareerSettings>): NewCareerRequest => ({
  ...NEW_CAREER,
  settings: { ...NEW_CAREER.settings, ...settings },
});

/**
 * The championship most tests race: two rounds, one class at the bottom rung.
 */
const CUP = makeChampionship();

/**
 * The cup with its second round out of reach, its track not installed.
 */
const UNRACEABLE_TWO = makeListing(CUP, {
  availability: makeAvailability(CUP, {
    rounds: makeAvailability(CUP).rounds.map((one) => (one.round === 'two'
      ? { ...one, track: { key: 'track_two', id: 'track_two', layout: '' } as MissingTrack }
      : one)),
  }),
});

/**
 * What a championship racing the base game alone needs, which the draw asks
 * the content sources about.
 */
const BASE_ONLY: SeriesRequirements = {
  sources: [ContentSource.BASE],
  packs: [],
  makers: [],
  distributors: [],
  pools: [],
  rounds: { packs: [], makers: [], distributors: [] },
  widenedBy: { packs: [], makers: [], distributors: [] },
};

/**
 * An error carrying one of Node's codes.
 * @param code The errno code
 * @returns The error
 */
const errno = (code: string): NodeJS.ErrnoException => Object.assign(new Error(code), { code });

/**
 * Builds a career store over fakes.
 * @param options What it is built over
 * @returns The store and the fakes it was handed
 */
const harness = async (options: HarnessOptions = {}): Promise<Harness> => {
  const own = options.careerSettings ?? {};
  const career = options.career && { ...options.career, settings: { ...options.career.settings, ...own } };
  if (career) readFileMock.mockResolvedValue(JSON.stringify(career));

  const series = fakeSeriesStore(options.listings ?? [makeListing(CUP)]);
  const historic = fakeSeriesStore(options.historic ?? []);
  const race = fakeRaceStore();
  const store = await createCareerStore(
    'D:\\userData',
    series,
    historic,
    race,
    fakeContentStore({ cars: [...options.cars ?? []] }, options.prices),
    fakeSettingsStore(options.settings),
  );
  if (career) await store.open(career.id);
  else if (!options.closed) await store.create(newCareer(own));

  return {
    store, series, historic, race,
  };
};

/**
 * A historic event of one round: one class, prize money and no points.
 * @param id Its id
 * @returns Its listing
 */
const historicListing = (id: string): SeriesListing => {
  const event = makeChampionship({
    id,
    name: `Historic ${id}`,
    rounds: [makeRound('only')],
    pointsSystems: [{ id: 'standard', name: 'None', positions: [] }],
  });

  return makeListing(event, { availability: makeAvailability(event, { requires: BASE_ONLY }) });
};

/**
 * A season holding a career on disk, with the clock standing where the test
 * puts it.
 * @param season The season
 * @param date Where the clock stands
 * @returns The career
 */
const careerWith = (season: Partial<CareerSeason>, date = '2027-01-01'): Career => makeCareer({
  startDate: '2027-01-01',
  date,
  seasons: [makeSeason({
    startDate: '2027-01-01', endDate: '2027-12-31', historicDrawn: true, ...season,
  })],
});

/**
 * The season entry a career holds for a championship.
 * @param career The career
 * @param series The championship's id
 * @returns The entry
 */
const entryOf = (career: Career | null, series = CUP.id) => {
  const entry = career?.seasons.at(-1)?.entries.find((one) => one.series === series);
  if (!entry) throw new Error(`no entry for ${series}`);

  return entry;
};

/**
 * The cup's car, installed in two liveries.
 */
const TEST_CAR = makeCar('test_car');

/**
 * What the cup's car costs, which rents at 800 a round and repaints for 600.
 */
const PRICES = { test_car: 40_000 };

/**
 * A career holding the cup's car, bought a year before the clock in blue, with
 * a season entered in it as given.
 * @param entries The season's entries
 * @param money What the career holds
 * @returns The career
 */
const garaged = (entries: SeasonEntry[] = [], money = 100_000): Career => makeCareer({
  ...careerWith({ entries }),
  money,
  garage: [{
    model: 'test_car', skin: 'blue', paid: 40_000, bought: '2026-01-01',
  }],
});

/**
 * A record of one launch that has run.
 * @param index Which launch of the event
 * @returns The record
 */
const record = (index: number): LaunchRecord => ({
  index, completedAt: '2027-01-02T10:00:00.000Z', archive: `launch-${index}.json`, gridOrder: [], classification: null,
});

/**
 * What was last written to one of a career's files, as the disk would hold it.
 * @param name The file's name - career.json or state.json
 * @returns What it holds, or undefined when nothing was written to it
 */
const lastWritten = (name: string): unknown => {
  const call = writeFileMock.mock.calls.filter(([file]) => String(file).endsWith(`${name}.tmp`)).at(-1);

  return call ? JSON.parse(String(call[1])) : undefined;
};

/**
 * A second career's id, for the tests that hold more than one.
 */
const OTHER_ID = '00000000-0000-4000-8000-000000000002';

/**
 * Serves career files off a fake disk, one per career folder.
 * @param careers The careers on disk, each written under its own folder
 * @param names The folders readdir lists, the careers' own by default
 */
const onDisk = (careers: readonly Career[], names: readonly string[] = careers.map((one) => one.id)): void => {
  jest.mocked(readdir).mockResolvedValue(names as never);
  readFileMock.mockImplementation((async (file: unknown) => {
    const held = careers.find((one) => String(file).includes(one.id));
    if (!held) throw errno('ENOENT');

    return JSON.stringify(held);
  }) as typeof readFile);
};

/**
 * Lets queued work run, as a push from the race store is handled after it
 * returns.
 * @returns Resolves on a later turn of the event loop
 */
const settled = (): Promise<void> => new Promise((resolve) => { setImmediate(resolve); });

/**
 * The folder a career is kept in, as the store names it.
 * @param id The career's id
 * @returns The folder
 */
const folderOf = (id = CAREER_ID): string => path.join('D:\\userData', 'careers', id);

/**
 * The folder a standalone championship is kept in, as the store names it.
 * @param id Its id
 * @returns The folder
 */
const standaloneFolderOf = (id: string): string => path.join('D:\\userData', 'championships', id);

/**
 * Puts a standalone championship's two files on a disk held in memory.
 * @param files The disk
 * @param career The standalone championship
 * @param profile What its career.json holds, its own profile by default
 */
const putStandalone = (files: Map<string, string>, career: Career, profile: object = profileOf(career)): void => {
  files.set(path.join(standaloneFolderOf(career.id), 'career.json'), JSON.stringify(profile));
  files.set(path.join(standaloneFolderOf(career.id), 'state.json'), JSON.stringify(stateOf(career)));
};

/**
 * The file one of a career's saves is kept in.
 * @param id The save's id
 * @returns The file
 */
const saveFile = (id: string): string => path.join(folderOf(), 'saves', `${id}.json`);

/**
 * A named save's id.
 */
const NAMED_ID = '00000000-0000-4000-8000-0000000000aa';

/**
 * Holds files in memory for the commands that read back what they wrote:
 * every write lands in it, and reads, listings and deletes are served from it.
 * @param careers The careers on disk to start with, each as its two files
 * @returns The files, by path
 */
const memoryDisk = (careers: readonly Career[] = []): Map<string, string> => {
  const files = new Map<string, string>();
  for (const career of careers) {
    files.set(path.join(folderOf(career.id), 'career.json'), JSON.stringify(profileOf(career)));
    files.set(path.join(folderOf(career.id), 'state.json'), JSON.stringify(stateOf(career)));
  }
  writeFileMock.mockImplementation((async (file: unknown, data: unknown) => {
    files.set(String(file), String(data));
  }) as typeof writeFile);
  jest.mocked(rename).mockImplementation(async (from: unknown, to: unknown) => {
    const held = files.get(String(from));
    if (held === undefined) throw errno('ENOENT');
    files.delete(String(from));
    files.set(String(to), held);
  });
  readFileMock.mockImplementation((async (file: unknown) => {
    const held = files.get(String(file));
    if (held === undefined) throw errno('ENOENT');

    return held;
  }) as typeof readFile);
  // Each file or folder directly inside, so the careers folder lists careers.
  jest.mocked(readdir).mockImplementation((async (dir: unknown) => [...new Set([...files.keys()]
    .filter((file) => file.startsWith(`${String(dir)}${path.sep}`))
    .map((file) => file.slice(String(dir).length + 1).split(path.sep)[0]))]) as typeof readdir);
  jest.mocked(rm).mockImplementation(async (file: unknown) => {
    if (!files.delete(String(file))) throw errno('ENOENT');
  });

  return files;
};

/**
 * Puts a save of a career's state on the disk, as a save taken earlier would
 * have left it.
 * @param files The disk
 * @param id The save's id
 * @param career The career as the save holds it
 */
const putSave = (files: Map<string, string>, id: string, career: Career): void => {
  files.set(saveFile(id), JSON.stringify({
    version: 1,
    id,
    kind: id === 'quicksave' ? 'quick' : 'named',
    name: id === 'quicksave' ? null : 'Earlier',
    savedAt: '2026-12-31T10:00:00.000Z',
    date: career.date,
    moment: null,
    state: stateOf(career),
  }));
};

/**
 * Holds a career's folder in memory the way a backup and a restore use it:
 * `memoryDisk`'s files, plus the zips written beside them as bytes, and
 * folders renamed, removed and checked for whole.
 * @param careers The careers on disk to start with, each as its two files
 * @returns The files, by path, and the zips, by path
 */
const folderDisk = (careers: readonly Career[] = []): { files: Map<string, string>; zips: Map<string, Buffer> } => {
  const files = memoryDisk(careers);
  const zips = new Map<string, Buffer>();
  const inside = (folder: string): string[] => [...files.keys()]
    .filter((file) => file === folder || file.startsWith(`${folder}${path.sep}`));

  writeFileMock.mockImplementation((async (file: unknown, data: unknown) => {
    if (String(file).endsWith('.zip')) zips.set(String(file), data as Buffer);
    else files.set(String(file), Buffer.isBuffer(data) ? data.toString() : String(data));
  }) as typeof writeFile);
  // Bytes when asked for no encoding, as a backup reads its files.
  readFileMock.mockImplementation((async (file: unknown, encoding?: unknown) => {
    const zip = zips.get(String(file));
    if (zip) return zip;
    const held = files.get(String(file));
    if (held === undefined) throw errno('ENOENT');

    return encoding ? held : Buffer.from(held);
  }) as typeof readFile);
  jest.mocked(rename).mockImplementation(async (from: unknown, to: unknown) => {
    const moved = inside(String(from));
    if (moved.length === 0) throw errno('ENOENT');
    for (const file of moved) {
      const held = files.get(file) ?? '';
      files.delete(file);
      files.set(`${String(to)}${file.slice(String(from).length)}`, held);
    }
  });
  jest.mocked(rm).mockImplementation(async (target: unknown, options?: unknown) => {
    const gone = inside(String(target));
    if (gone.length === 0 && !(options as { force?: boolean } | undefined)?.force) throw errno('ENOENT');
    for (const file of gone) files.delete(file);
  });
  jest.mocked(access).mockImplementation(async (target: unknown) => {
    if (inside(String(target)).length === 0) throw errno('ENOENT');
  });

  return { files, zips };
};

/**
 * A career's backup, as Back up writes one.
 * @param career The career it holds
 * @param over Files to add, or to put in place of the career's own, by path
 * @returns The zip
 */
const backupOf = (career: Career, over: Record<string, string> = {}): Promise<Buffer> => {
  const held: Record<string, string> = {
    'backup.json': JSON.stringify({ version: 1, kind: 'career', backedUpAt: '2027-06-14T21:40:00.000Z' }),
    'career.json': JSON.stringify(profileOf(career)),
    'state.json': JSON.stringify(stateOf(career)),
    'results/2027-03-07T10-00-00.json': '{}',
    ...over,
  };

  return packZip(Object.entries(held).map(([name, data]) => ({ name, data: Buffer.from(data) })));
};

/**
 * Where a backup a test restores is kept.
 */
const BACKUP_FILE = 'D:\\backups\\career.zip';

describe('main/career-store', () => {
  let open: CareerStore | null = null;

  beforeEach(() => {
    // The clock alone is faked: the store's own write debounce and the event
    // loop run as they do in the app.
    jest.useFakeTimers({
      now: NOW,
      doNotFake: [
        'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate',
        'nextTick', 'queueMicrotask', 'hrtime', 'performance',
      ],
    });
    readFileMock.mockRejectedValue(errno('ENOENT'));
    jest.mocked(readdir).mockResolvedValue([]);
    writeFileMock.mockResolvedValue(undefined);
    jest.mocked(rename).mockResolvedValue(undefined);
    jest.mocked(copyFile).mockResolvedValue(undefined);
    jest.mocked(unlink).mockResolvedValue(undefined);
    // Set again each time, since a test serving files from memory replaces them.
    jest.mocked(rm).mockResolvedValue(undefined);
    jest.mocked(access).mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    // A pending debounced write would otherwise outlive the test.
    await open?.flush();
    open = null;
    jest.useRealTimers();
  });

  /**
   * Builds a store and remembers it, so the test's pending write is flushed.
   * @param options What it is built over
   * @returns The store and its fakes
   */
  const build = async (options: HarnessOptions = {}): Promise<Harness> => {
    const built = await harness(options);
    open = built.store;

    return built;
  };

  describe('createCareerStore', () => {
    it('has no career open until one is opened', async () => {
      const { store } = await build({ closed: true });

      expect(store.get()).toBeNull();
    });

    it('opens the career on disk as it was written', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-03-07')] })] });
      const { store } = await build({ career });

      expect(store.get()?.id).toBe(career.id);
      expect(entryOf(store.get()).events[0].date).toBe('2027-03-07');
    });

    it('sets a career file that is not JSON aside rather than opening it', async () => {
      readFileMock.mockResolvedValue('{ not json');
      const { store } = await build({ closed: true });

      await expect(store.open(CAREER_ID)).rejects.toMatchObject({ code: 'career.unreadable' });
      expect(copyFile).toHaveBeenCalledWith(
        expect.stringContaining('career.json'),
        expect.stringContaining('career.corrupt-1.json'),
        expect.any(Number),
      );
      expect(store.get()).toBeNull();
    });

    it('races the rounds the clock passed without the player as soon as it opens', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07', { status: 'missed' })] })],
      }, '2027-04-01');
      const { store } = await build({ career });

      expect(entryOf(store.get()).events[0].simulated).toBe(true);
    });
  });

  describe('list', () => {
    it('lists every career on disk, played most recently first', async () => {
      onDisk([
        makeCareer({ playedAt: '2026-12-01T10:00:00.000Z', driver: { name: 'Older', nation: null } }),
        makeCareer({ id: OTHER_ID, playedAt: '2026-12-20T10:00:00.000Z', driver: { name: 'Newer', nation: 'UKR' } }),
      ]);
      const { store } = await build({ closed: true });

      expect((await store.list('career')).map((one) => one.driver?.name)).toEqual(['Newer', 'Older']);
    });

    it('passes over a folder that is not named by a career id', async () => {
      onDisk([makeCareer()], [CAREER_ID, 'notes', '..']);
      const { store } = await build({ closed: true });

      expect((await store.list('career')).map((one) => one.id)).toEqual([CAREER_ID]);
    });

    it('lists only the careers of the kind asked for', async () => {
      const { store } = await build({ closed: true });
      const files = memoryDisk([makeCareer()]);
      putStandalone(files, makeCareer({ id: OTHER_ID, kind: 'championship' }));

      expect((await store.list('career')).map((one) => one.id)).toEqual([CAREER_ID]);
      expect((await store.list('championship')).map((one) => one.id)).toEqual([OTHER_ID]);
    });

    // A career left out of the list could never be deleted from the app.
    it('lists a career it cannot read, or whose file names another career, as unreadable', async () => {
      onDisk([makeCareer({ id: OTHER_ID })], [CAREER_ID, OTHER_ID]);
      readFileMock.mockImplementation((async (file: unknown) => {
        if (String(file).includes(CAREER_ID)) return '{ not json';

        return JSON.stringify(makeCareer({ id: CAREER_ID }));
      }) as typeof readFile);
      const { store } = await build({ closed: true });

      expect(await store.list('career')).toEqual([
        {
          id: CAREER_ID, unreadable: true, driver: null, playedAt: null,
        },
        {
          id: OTHER_ID, unreadable: true, driver: null, playedAt: null,
        },
      ]);
    });

    it('lists a career whose state.json does not read as its newest save holds it', async () => {
      const career = careerWith({}, '2027-03-01');
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      files.set(path.join(folderOf(), 'state.json'), '{ not json');
      putSave(files, 'autosave-1', { ...career, date: '2027-02-01' });

      expect(await store.list('career')).toEqual([expect.objectContaining({ id: CAREER_ID, date: '2027-02-01' })]);
    });

    it('lists a career with nothing of its state to read as unreadable, naming its driver', async () => {
      const career = careerWith({});
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      files.delete(path.join(folderOf(), 'state.json'));

      expect(await store.list('career')).toEqual([{
        id: CAREER_ID, unreadable: true, driver: career.driver, playedAt: career.playedAt,
      }]);
    });

    it('lists an unreadable career with nothing to date it after every other', async () => {
      const career = makeCareer({ id: OTHER_ID, playedAt: '2020-01-01T00:00:00.000Z' });
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      files.set(path.join(folderOf(), 'career.json'), '{ not json');

      expect((await store.list('career')).map((one) => one.id)).toEqual([OTHER_ID, CAREER_ID]);
    });

    it('lists the career just started before it has been written', async () => {
      const { store } = await build();

      expect((await store.list('career')).map((one) => one.id)).toEqual([store.get()?.id]);
    });

    it('answers for the open career from memory, which is ahead of its file', async () => {
      const career = careerWith({});
      const { store } = await build({ career });
      await store.setDriver({ name: 'Renamed', nation: null });

      expect((await store.list('career'))[0].driver?.name).toBe('Renamed');
    });
  });

  describe('create', () => {
    it('takes an autosave as its first season opens, so it always has a save to carry on from', async () => {
      const { store } = await build({ closed: true });
      const files = memoryDisk();
      await store.create({ ...NEW_CAREER, year: 2030 });
      const id = store.get()?.id ?? '';
      const autosave = files.get(path.join(folderOf(id), 'saves', 'autosave-1.json'));

      expect(JSON.parse(autosave ?? '{}')).toMatchObject({
        kind: 'auto', date: '2030-01-01', moment: { kind: 'season', year: 2030 },
      });
    });

    it('opens a career racing the driver, year, rung and money asked for', async () => {
      const { store } = await build({ closed: true });
      await store.create({
        driver: { name: ' Oksana ', nation: 'UKR' }, year: 2030, level: 3, money: 250_000,
      });

      expect(store.get()).toMatchObject({
        driver: { name: 'Oksana', nation: 'UKR' },
        startDate: '2030-01-01',
        date: '2030-01-01',
        money: 250_000,
        level: { road: 3, touring: 3 },
        rating: { road: 1400, sportscar: 1400 },
        playedAt: NOW.toISOString(),
      });
    });

    it('opens its ledger on the money it starts with, at the speed asked for', async () => {
      const { store } = await build({ closed: true });
      await store.create({ ...NEW_CAREER, year: 2030, settings: { progression: 2 } });

      expect(store.get()?.ledger).toEqual([{
        key: 'opening', kind: 'opening', date: '2030-01-01', season: 0, amount: 100_000,
      }]);
      expect(store.get()?.settings.progression).toBe(2);
    });

    it('writes it into a folder of its own', async () => {
      const { store } = await build();
      await store.flush();

      expect(rename).toHaveBeenCalledWith(
        expect.stringContaining('career.json.tmp'),
        expect.stringMatching(new RegExp(`careers[\\\\/]${store.get()?.id}[\\\\/]career\\.json$`)),
      );
    });

    // The draw used to run after the career was already open, so a failed one
    // left an unwritten career open in main.
    it('leaves nothing open when the season\'s historic events cannot be drawn', async () => {
      const { store, historic } = await build({
        closed: true,
        historic: [historicListing('h1')],
        careerSettings: { historicFrequency: 'quarterly' },
      });
      historic.drawField = async () => { throw new Error('no field'); };

      await expect(store.create(newCareer({ historicFrequency: 'quarterly' }))).rejects.toThrow('no field');
      expect(store.get()).toBeNull();
    });

    it('refuses a request no career can start from, leaving nothing open', async () => {
      const { store } = await build({ closed: true });

      await expect(store.create({ ...NEW_CAREER, driver: { name: '', nation: null } }))
        .rejects.toMatchObject({ code: 'career.driver.unnamed' });
      expect(store.get()).toBeNull();
    });

    it('refuses while a launch is out, leaving the open career as it was', async () => {
      const career = careerWith({});
      const { store, race } = await build({ career });
      race.push(raceSetup({ status: { ...raceSetup().status, phase: 'waiting' } }));
      await settled();

      await expect(store.create(NEW_CAREER)).rejects.toMatchObject({ code: 'run.inFlight' });
      expect(store.get()?.id).toBe(career.id);
    });

    it('starts a career on the default settings, but for any New career was handed', async () => {
      const { store } = await build({ closed: true });
      await store.create({ ...NEW_CAREER, settings: undefined });

      expect(store.get()?.settings).toEqual(DEFAULT_CAREER_SETTINGS);

      await store.create({ ...NEW_CAREER, settings: { allowSameDayEvents: true } });

      expect(store.get()?.settings).toEqual({ ...DEFAULT_CAREER_SETTINGS, allowSameDayEvents: true });
    });
  });

  describe('createChampionship', () => {
    it("opens the year's first edition in the class and car asked for, with nothing else on its calendar", async () => {
      const { store } = await build({ closed: true, historic: [historicListing('old-race')] });
      await store.createChampionship(NEW_CHAMPIONSHIP);
      const career = store.get();

      expect(career).toMatchObject({
        kind: 'championship', driver: { name: 'Oksana', nation: 'UKR' }, date: '2030-01-01', money: 0, ledger: [],
      });
      expect(career?.seasons.map((season) => season.entries.length)).toEqual([1]);
      expect(entryOf(career)).toMatchObject({
        edition: 0, entry: 'main', playerSeat: 'seat-2', car: { model: 'test_car' },
      });
      expect(entryOf(career).events.every((event) => event.date.startsWith('2030-'))).toBe(true);
    });

    it('keeps it with the standalone championships, its first autosave beside it', async () => {
      const { store } = await build({ closed: true });
      const files = memoryDisk();
      await store.createChampionship(NEW_CHAMPIONSHIP);
      await store.flush();
      const folder = standaloneFolderOf(store.get()?.id ?? '');

      expect(files.has(path.join(folder, 'career.json'))).toBe(true);
      expect(files.has(path.join(folder, 'saves', 'autosave-1.json'))).toBe(true);
      expect([...files.keys()].some((file) => file.includes(`${path.sep}careers${path.sep}`))).toBe(false);
    });

    it('refuses a car the class does not race', async () => {
      const { store } = await build({ closed: true });

      await expect(store.createChampionship({ ...NEW_CHAMPIONSHIP, car: { model: 'other_car' } }))
        .rejects.toMatchObject({ code: 'standalone.car' });
      expect(store.get()).toBeNull();
    });

    it('refuses a class the championship does not have, and a championship that cannot be raced', async () => {
      const { store } = await build({
        closed: true,
        listings: [makeListing(CUP, { availability: makeAvailability(CUP, { available: false }) })],
      });

      await expect(store.createChampionship({ ...NEW_CHAMPIONSHIP, entry: 'none' }))
        .rejects.toMatchObject({ code: 'series.entry.unknown' });
      await expect(store.createChampionship(NEW_CHAMPIONSHIP))
        .rejects.toMatchObject({ code: 'career.series.unavailable' });
    });

    it('refuses a year a season may not open in', async () => {
      const { store } = await build({ closed: true });

      await expect(store.createChampionship({ ...NEW_CHAMPIONSHIP, year: 2030.5 }))
        .rejects.toMatchObject({ code: 'career.year.invalid' });
    });
  });

  describe('preview', () => {
    it('dates each round in the year asked for, making nothing', async () => {
      const { store } = await build({ closed: true });
      const preview = await store.preview(CUP.id, 2030);

      expect(preview.year).toBe(2030);
      expect(preview.events.map((one) => one.round)).toEqual(['one', 'two']);
      expect(preview.events.every((one) => one.date.startsWith('2030-'))).toBe(true);
      expect(store.get()).toBeNull();
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('refuses a championship the library does not hold, and a year out of range', async () => {
      const { store } = await build({ closed: true });

      await expect(store.preview('no-cup', 2030)).rejects.toMatchObject({ code: 'series.notFound' });
      await expect(store.preview(CUP.id, 2030.5)).rejects.toMatchObject({ code: 'career.year.invalid' });
    });
  });

  describe('open', () => {
    // A career.json under championships/ that said no kind was opened as a
    // career, and its next write went to careers/ - a second copy, in the
    // other list.
    it('opens a career as the kind its folder says, whatever its file says', async () => {
      const { store } = await build({ closed: true });
      const { files } = folderDisk();
      const standalone = makeCareer({ id: OTHER_ID, kind: 'championship' });
      putStandalone(files, standalone, { ...profileOf(standalone), kind: undefined });
      await store.open(OTHER_ID);
      await store.flush();

      expect(store.get()?.kind).toBe('championship');
      expect([...files.keys()].some((file) => file.includes(`${path.sep}careers${path.sep}`))).toBe(false);
    });

    it('refuses a career that is not on disk', async () => {
      const { store } = await build({ closed: true });

      await expect(store.open(OTHER_ID)).rejects.toMatchObject({ code: 'career.notFound' });
    });

    // The id names a folder, so anything but a career's id could reach outside
    // the careers folder.
    it('refuses an id that is no career\'s, without reading anything', async () => {
      const { store } = await build({ closed: true });

      await expect(store.open('..\\settings')).rejects.toMatchObject({ code: 'career.notFound' });
      expect(readFileMock).not.toHaveBeenCalled();
    });

    it('sets aside a file that names another career rather than opening it as this one', async () => {
      onDisk([makeCareer({ id: OTHER_ID })], [CAREER_ID]);
      readFileMock.mockResolvedValue(JSON.stringify(makeCareer({ id: OTHER_ID })));
      const { store } = await build({ closed: true });

      await expect(store.open(CAREER_ID)).rejects.toMatchObject({ code: 'career.unreadable' });
      expect(store.get()).toBeNull();
    });

    // Opening read the file before the pending write reached it, so reopening
    // the open career lost whatever had changed since.
    it('keeps a change still waiting to be written when the open career is opened again', async () => {
      const career = careerWith({});
      const { store } = await build({ career });
      // Reads back whatever was written last, as the disk would.
      readFileMock.mockImplementation((async (file: unknown) => JSON.stringify(
        lastWritten(String(file).endsWith('state.json') ? 'state.json' : 'career.json') ?? career,
      )) as unknown as typeof readFile);
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      await store.open(career.id);

      expect(entryOf(store.get()).series).toBe(CUP.id);
    });

    it('carries on from the newest save when state.json does not read, setting the file aside', async () => {
      const career = careerWith({}, '2027-03-01');
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      files.set(path.join(folderOf(), 'state.json'), '{ not json');
      putSave(files, 'autosave-1', { ...career, date: '2027-02-01' });
      files.set(saveFile('quicksave'), JSON.stringify({
        ...JSON.parse(files.get(saveFile('autosave-1')) ?? '{}'),
        id: 'quicksave',
        kind: 'quick',
        savedAt: '2027-01-01T08:00:00.000Z',
        date: '2027-02-15',
        state: stateOf({ ...career, date: '2027-02-15' }),
      }));
      await store.open(CAREER_ID);
      await store.flush();

      expect(store.get()).toMatchObject({ date: '2027-02-15', driver: career.driver });
      expect(copyFile).toHaveBeenCalledWith(
        path.join(folderOf(), 'state.json'),
        path.join(folderOf(), 'state.corrupt-1.json'),
        expect.any(Number),
      );
      expect(JSON.parse(files.get(path.join(folderOf(), 'state.json')) ?? '{}').date).toBe('2027-02-15');
    });

    it('carries on from the newest save when state.json is not there', async () => {
      const career = careerWith({}, '2027-03-01');
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      files.delete(path.join(folderOf(), 'state.json'));
      putSave(files, 'autosave-1', { ...career, date: '2027-02-01' });
      await store.open(CAREER_ID);

      expect(store.get()?.date).toBe('2027-02-01');
      expect(copyFile).not.toHaveBeenCalled();
    });

    it('refuses a career with nothing of its state to read', async () => {
      const career = careerWith({});
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      files.set(path.join(folderOf(), 'state.json'), '{ not json');

      await expect(store.open(CAREER_ID)).rejects.toMatchObject({ code: 'career.unreadable' });
      expect(store.get()).toBeNull();
    });

    it('stamps the career as played the moment it opens', async () => {
      const { store } = await build({ career: careerWith({}) });

      expect(store.get()?.playedAt).toBe(NOW.toISOString());
    });

    it('closes whichever career was open, writing it first', async () => {
      const first = careerWith({});
      const second = makeCareer({ ...careerWith({}), id: OTHER_ID });
      const { store } = await build({ career: first });
      onDisk([first, second]);
      await store.setDriver({ name: 'Renamed', nation: null });
      writeFileMock.mockClear();
      await store.open(OTHER_ID);

      expect(store.get()?.id).toBe(OTHER_ID);
      expect(lastWritten('career.json')).toMatchObject({ id: first.id, driver: { name: 'Renamed' } });
    });
  });

  describe('close', () => {
    it('writes the open career and leaves none open', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setDriver({ name: 'Renamed', nation: null });
      writeFileMock.mockClear();
      await store.close();

      expect(store.get()).toBeNull();
      expect(lastWritten('career.json')).toMatchObject({ driver: { name: 'Renamed' } });
    });

    it('tells everyone watching that no career is open', async () => {
      const { store } = await build({ career: careerWith({}) });
      const heard: (Career | null)[] = [];
      store.onChange((career) => heard.push(career));
      await store.close();

      expect(heard).toEqual([null]);
    });

    it('refuses while a launch is out, since its result would land nowhere', async () => {
      const { store, race } = await build({ career: careerWith({}) });
      race.push(raceSetup({ status: { ...raceSetup().status, phase: 'waiting' } }));
      await settled();

      await expect(store.close()).rejects.toMatchObject({ code: 'run.inFlight' });
      expect(store.get()).not.toBeNull();
    });
  });

  describe('remove', () => {
    it('deletes the career\'s folder and answers with the careers left', async () => {
      onDisk([makeCareer({ id: OTHER_ID })]);
      const { store } = await build({ closed: true });
      const left = await store.remove(CAREER_ID);

      expect(rm).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`careers[\\\\/]${CAREER_ID}$`)), { recursive: true });
      expect(left.map((one) => one.id)).toEqual([OTHER_ID]);
    });

    it('deletes a standalone championship from its own folder, answering with those left', async () => {
      const { store } = await build({ closed: true });
      const { files } = folderDisk([makeCareer()]);
      putStandalone(files, makeCareer({ id: OTHER_ID, kind: 'championship' }));

      expect(await store.remove(OTHER_ID)).toEqual([]);
      expect([...files.keys()].some((file) => file.includes(OTHER_ID))).toBe(false);
      expect(files.has(path.join(folderOf(), 'career.json'))).toBe(true);
    });

    it('refuses the career that is open', async () => {
      const career = careerWith({});
      const { store } = await build({ career });

      await expect(store.remove(career.id)).rejects.toMatchObject({ code: 'career.open' });
      expect(rm).not.toHaveBeenCalled();
    });

    it('refuses a career that is not there', async () => {
      jest.mocked(rm).mockRejectedValueOnce(errno('ENOENT'));
      const { store } = await build({ closed: true });

      await expect(store.remove(OTHER_ID)).rejects.toMatchObject({ code: 'career.notFound' });
    });
  });

  describe('folderOf', () => {
    it('answers with the folder a career is kept in', async () => {
      const { store } = await build({ closed: true });

      expect(await store.folderOf(CAREER_ID)).toMatch(new RegExp(`careers[\\\\/]${CAREER_ID}$`));
    });

    it('refuses an id that is no career\'s', async () => {
      const { store } = await build({ closed: true });

      await expect(store.folderOf('..')).rejects.toMatchObject({ code: 'career.notFound' });
    });
  });

  describe('setDriver', () => {
    it('renames the open career\'s driver and changes their nation', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setDriver({ name: ' Oksana ', nation: 'UKR' });

      expect(store.get()?.driver).toEqual({ name: 'Oksana', nation: 'UKR' });
    });

    it('refuses a driver with no name, keeping the one it had', async () => {
      const { store } = await build({ career: careerWith({}) });

      await expect(store.setDriver({ name: ' ', nation: null })).rejects.toMatchObject({ code: 'career.driver.unnamed' });
      expect(store.get()?.driver.name).toBe('Test Driver');
    });

    it('refuses with no career open', async () => {
      const { store } = await build({ closed: true });

      await expect(store.setDriver({ name: 'Oksana', nation: null })).rejects.toMatchObject({ code: 'career.none' });
    });
  });

  describe('setSettings', () => {
    it("sets the open career's own opponents, and follows the app's again on null", async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setSettings({ opponents: { strength: 72, aggression: 55 } });

      expect(store.get()?.settings.opponents).toEqual({ strength: 72, aggression: 55 });

      await store.setSettings({ opponents: null });

      expect(store.get()?.settings.opponents).toBeNull();
    });

    it('changes only what the patch names, read back the tolerant way', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setSettings({ drivingAids: { abs: 0 } });
      await store.setSettings({ opponents: { strength: 140, aggression: 30 } });

      expect(store.get()?.settings).toMatchObject({
        drivingAids: { abs: 0 }, opponents: { strength: 100, aggression: 30 }, historicFrequency: 'off',
      });
    });

    it('writes them to career.json, beside the driver rather than in the state', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setSettings({ allowSameDayEvents: true });
      await store.flush();

      expect((lastWritten('career.json') as Career).settings.allowSameDayEvents).toBe(true);
      expect(lastWritten('state.json')).not.toHaveProperty('settings');
    });

    it('refuses with no career open', async () => {
      const { store } = await build({ closed: true });

      await expect(store.setSettings({ allowSameDayEvents: true })).rejects.toMatchObject({ code: 'career.none' });
    });

    it('notes a change of progression speed in the ledger, moving no money', async () => {
      const { store } = await build({ career: careerWith({}, '2027-04-01') });
      await store.setSettings({ progression: 2 });

      expect(store.get()?.settings.progression).toBe(2);
      expect(store.get()?.money).toBe(100_000);
      expect(store.get()?.ledger).toEqual([expect.objectContaining({
        kind: 'speed', date: '2027-04-01', amount: 0, speed: { from: 1, to: 2 },
      })]);
    });

    it('notes nothing when the speed stays as it was, a speed it cannot run at included', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setSettings({ progression: 1 });
      await store.setSettings({ progression: 7 });

      expect(store.get()?.settings.progression).toBe(1);
      expect(store.get()?.ledger).toEqual([]);
    });
  });

  describe('calendar', () => {
    it('starts a new career on 1 January of the year it asks for, the whole season ahead', async () => {
      const { store } = await build();
      await store.calendar();

      expect(store.get()).toMatchObject({ startDate: '2027-01-01', date: '2027-01-01' });
      expect(store.get()?.seasons).toHaveLength(1);
    });

    it('refuses with no career open', async () => {
      const { store } = await build({ closed: true });

      await expect(store.calendar()).rejects.toMatchObject({ code: 'career.none' });
    });

    it('writes the career in one step, through a file beside it', async () => {
      const { store } = await build();
      await store.calendar();
      await store.flush();

      expect(writeFileMock).toHaveBeenCalledWith(expect.stringContaining('career.json.tmp'), expect.any(String), 'utf8');
      expect(rename).toHaveBeenCalledWith(
        expect.stringContaining('career.json.tmp'),
        expect.stringMatching(/career\.json$/),
      );
    });

    it("lists the library's championships the career could enter", async () => {
      const { store } = await build();
      const calendar = await store.calendar();

      expect(calendar.events.length).toBeGreaterThan(0);
      expect(calendar.events.every((event) => event.series === CUP.id && !event.enrolled)).toBe(true);
    });

    it("draws the season's historic events when the career starts, on weekdays only", async () => {
      const { store } = await build({
        historic: ['h1', 'h2', 'h3', 'h4'].map(historicListing),
        careerSettings: { historicFrequency: 'quarterly' },
      });
      await store.calendar();
      const season = store.get()?.seasons[0];
      const drawn = season?.entries.filter((one) => one.historic) ?? [];

      expect(season?.historicDrawn).toBe(true);
      expect(drawn).toHaveLength(4);
      expect(drawn.every((one) => [1, 2, 3, 4, 5].includes(weekdayOf(one.events[0].date)))).toBe(true);
      // Entered as it is drawn, in the seat the draw picked.
      expect(drawn.every((one) => one.playerSeat !== '' && !one.withdrawn)).toBe(true);
    });

    it('never draws a season twice', async () => {
      const { store } = await build({
        historic: ['h1', 'h2', 'h3', 'h4'].map(historicListing),
        careerSettings: { historicFrequency: 'quarterly' },
      });
      await store.calendar();
      const first = store.get()?.seasons[0].entries.map((one) => one.events[0].date);
      await store.calendar();

      expect(store.get()?.seasons[0].entries.map((one) => one.events[0].date)).toEqual(first);
    });

    it('draws a season it could not read the pool for on a later read', async () => {
      const { store, historic } = await build({
        historic: ['h1', 'h2', 'h3', 'h4'].map(historicListing),
        careerSettings: { historicFrequency: 'quarterly' },
        closed: true,
      });
      historic.failList(new Error('install not located'));
      await store.create(newCareer({ historicFrequency: 'quarterly' }));

      expect(store.get()?.seasons[0].historicDrawn).toBeFalsy();

      historic.failList(null);
      await store.calendar();

      expect(store.get()?.seasons[0].historicDrawn).toBe(true);
      expect(store.get()?.seasons[0].entries.filter((one) => one.historic)).toHaveLength(4);
    });

    it('leaves out a historic event switched off', async () => {
      const { store } = await build({
        historic: ['h1', 'h2'].map(historicListing),
        careerSettings: { historicFrequency: 'quarterly' },
        settings: { historicActive: { h1: false } },
      });
      await store.calendar();

      expect(store.get()?.seasons[0].entries.map((one) => one.series)).toEqual(['h2']);
    });

    // Fixed: every read used to queue behind whatever command was running, so
    // the calendar hung for as long as a launch took to reach Content Manager.
    it('answers while a command is still running, once the season is drawn', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] });
      const { store, race } = await build({ career });
      race.load = () => new Promise(() => {});
      void store.launch({ series: CUP.id, round: 'one' });

      await expect(store.calendar()).resolves.toMatchObject({ season: 0 });
    });
  });

  describe('enrol', () => {
    it('refuses a standalone championship anything but the championship it races', async () => {
      const { store } = await build({ closed: true });
      await store.createChampionship(NEW_CHAMPIONSHIP);

      await expect(store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'standalone.enter' });
    });

    it("enters the class in the player's seat and dates every round of the edition", async () => {
      const { store } = await build();
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      const entry = entryOf(store.get());

      expect(entry).toMatchObject({
        entry: 'main', playerSeat: 'seat-2', car: { model: 'test_car', source: 'rented' },
      });
      expect(entry.events.map((event) => event.round)).toEqual(['one', 'two']);
      expect(entry.events.every((event) => event.status === 'scheduled')).toBe(true);
    });

    it("keeps a copy of the championship the library's edits never reach", async () => {
      const library = makeChampionship();
      const { store } = await build({ listings: [makeListing(library)] });
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      library.rounds[0].name = 'Renamed since';

      expect(entryOf(store.get()).championship.rounds[0].name).toBe('Round one');
    });

    it('refuses a championship the library does not hold', async () => {
      const { store } = await build();

      await expect(store.enrol({ series: 'nowhere', entry: 'main', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'series.notFound' });
    });

    it('refuses a championship the install cannot race', async () => {
      const { store } = await build({
        listings: [makeListing(CUP, { availability: makeAvailability(CUP, { available: false }) })],
      });

      await expect(store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'career.series.unavailable' });
    });

    it("refuses a class above the career's level", async () => {
      const ladder = makeChampionship({
        id: 'ladder',
        entries: [
          { ...CUP.entries[0], id: 'pro', ladder: { ...CUP.entries[0].ladder, tier: 1 } },
          { ...CUP.entries[0], id: 'am' },
        ],
      });
      const { store } = await build({ listings: [makeListing(ladder)] });

      await expect(store.enrol({ series: 'ladder', entry: 'pro', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'career.entry.ineligible' });
    });

    it('refuses to enter one edition twice', async () => {
      const { store } = await build();
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });

      await expect(store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'career.entry.enrolled' });
    });

    it('refuses an edition whose every round is behind the clock', async () => {
      const career = careerWith({}, '2027-12-30');
      const { store } = await build({ career });

      await expect(store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'career.edition.over' });
    });

    it("enters a car the garage holds owned, in the garage's livery whatever was asked", async () => {
      const { store } = await build({ career: garaged() });
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car', skin: 'red' } });

      expect(entryOf(store.get()).car).toEqual({ model: 'test_car', skin: 'blue', source: 'owned' });
    });

    it('enters any other car rented, in the livery picked', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car', skin: 'red' } });

      expect(entryOf(store.get()).car).toEqual({ model: 'test_car', skin: 'red', source: 'rented' });
    });

    it('refuses a car the class cannot race at the round entering starts from', async () => {
      const availability = makeAvailability(CUP);
      const { store } = await build({
        career: careerWith({}),
        listings: [makeListing(CUP, {
          availability: {
            ...availability,
            rounds: availability.rounds.map((one) => (one.round === 'one' ? {
              ...one, entries: [{ entry: 'main', eligible: ['other_car'], missing: [], enough: true }],
            } : one)),
          },
        })],
      });

      await expect(store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } }))
        .rejects.toMatchObject({ code: 'career.car.ineligible' });
    });

    it('tells everyone watching', async () => {
      const { store } = await build();
      const seen: (Career | null)[] = [];
      store.onChange((career) => seen.push(career));
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });

      expect(seen.at(-1)?.seasons[0].entries).toHaveLength(1);
    });
  });

  describe('buyCar', () => {
    it('buys a car into the garage in the livery picked, and writes what it cost', async () => {
      const { store } = await build({ career: careerWith({}), cars: [TEST_CAR], prices: PRICES });
      await store.buyCar({ model: 'test_car', skin: 'blue' });

      expect(store.get()?.money).toBe(60_000);
      expect(store.get()?.garage).toEqual([{
        model: 'test_car', skin: 'blue', paid: 40_000, bought: '2027-01-01',
      }]);
      expect(store.get()?.ledger).toEqual([expect.objectContaining({
        kind: 'purchase', amount: -40_000, car: { model: 'test_car', name: 'Car test_car', livery: 'Livery blue' },
      })]);
    });

    it('buys a car in its first livery when none is picked', async () => {
      const { store } = await build({ career: careerWith({}), cars: [TEST_CAR], prices: PRICES });
      await store.buyCar({ model: 'test_car' });

      expect(store.get()?.garage[0].skin).toBe('red');
    });

    it('races a car being rented owned from then on, in the livery bought', async () => {
      const career = careerWith({
        entries: [makeEntry({
          car: { model: 'test_car', skin: 'red', source: 'rented' }, events: [makeEvent('one', '2027-03-07')],
        })],
      });
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });
      await store.buyCar({ model: 'test_car', skin: 'blue' });

      expect(entryOf(store.get()).car).toEqual({ model: 'test_car', skin: 'blue', source: 'owned' });
    });

    it('refuses a car the garage holds already', async () => {
      const { store } = await build({ career: garaged(), cars: [TEST_CAR], prices: PRICES });

      await expect(store.buyCar({ model: 'test_car' })).rejects.toMatchObject({ code: 'career.car.owned' });
    });

    it('refuses a car the library does not hold', async () => {
      const { store } = await build({ career: careerWith({}), cars: [TEST_CAR], prices: PRICES });

      await expect(store.buyCar({ model: 'gone_car' }))
        .rejects.toMatchObject({ code: 'career.car.unknown', params: { car: 'gone_car' } });
    });

    it('refuses a livery the car does not have', async () => {
      const { store } = await build({ career: careerWith({}), cars: [TEST_CAR], prices: PRICES });

      await expect(store.buyCar({ model: 'test_car', skin: 'gold' }))
        .rejects.toMatchObject({ code: 'career.car.livery' });
    });

    it('refuses a car the career cannot pay for, spending nothing', async () => {
      const career = makeCareer({ ...careerWith({}), money: 30_000 });
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });

      await expect(store.buyCar({ model: 'test_car' }))
        .rejects.toMatchObject({ code: 'career.car.short', params: { price: 40_000, money: 30_000 } });
      expect(store.get()?.money).toBe(30_000);
      expect(store.get()?.garage).toEqual([]);
    });

    it('refuses a standalone championship, which has no money', async () => {
      const { store } = await build({ closed: true, cars: [TEST_CAR], prices: PRICES });
      await store.createChampionship(NEW_CHAMPIONSHIP);

      await expect(store.buyCar({ model: 'test_car' })).rejects.toMatchObject({ code: 'standalone.garage' });
    });
  });

  describe('sellCar', () => {
    it('sells a car for what it is worth today and takes it out of the garage', async () => {
      const { store } = await build({ career: garaged(), cars: [TEST_CAR], prices: PRICES });
      await store.sellCar('test_car');

      // A year after it was bought, 7.5% under what was paid.
      expect(store.get()?.money).toBe(137_000);
      expect(store.get()?.garage).toEqual([]);
      expect(store.get()?.ledger).toEqual([expect.objectContaining({
        kind: 'sale', amount: 37_000, car: expect.objectContaining({ paid: 40_000, bought: '2026-01-01' }),
      })]);
    });

    it('races the rest of the rounds rented, in the livery the car wore', async () => {
      const career = garaged([makeEntry({
        car: { model: 'test_car', skin: 'blue', source: 'owned' }, events: [makeEvent('one', '2027-03-07')],
      })]);
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });
      await store.sellCar('test_car');

      expect(entryOf(store.get()).car).toEqual({ model: 'test_car', skin: 'blue', source: 'rented' });
    });

    it('refuses a car the garage does not hold', async () => {
      const { store } = await build({ career: careerWith({}), cars: [TEST_CAR], prices: PRICES });

      await expect(store.sellCar('test_car')).rejects.toMatchObject({ code: 'career.car.notOwned' });
    });

    it('refuses a car a round is under way in, until the round is over', async () => {
      const career = garaged([makeEntry({
        car: { model: 'test_car', skin: 'blue', source: 'owned' },
        events: [makeEvent('one', '2027-01-01', { sessions: [record(0)] })],
      })]);
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });

      await expect(store.sellCar('test_car')).rejects.toMatchObject({ code: 'career.car.racing' });
      expect(store.get()?.garage).toHaveLength(1);
    });
  });

  describe('repaintCar', () => {
    it('charges a repaint off what was paid and paints the car at once, every round to come included', async () => {
      const career = garaged([makeEntry({
        car: { model: 'test_car', skin: 'blue', source: 'owned' }, events: [makeEvent('one', '2027-03-07')],
      })]);
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });
      await store.repaintCar({ model: 'test_car', skin: 'red' });

      expect(store.get()?.money).toBe(99_400);
      expect(store.get()?.garage[0].skin).toBe('red');
      expect(entryOf(store.get()).car).toEqual({ model: 'test_car', skin: 'red', source: 'owned' });
      expect(store.get()?.ledger).toEqual([expect.objectContaining({
        kind: 'repaint', amount: -600, car: expect.objectContaining({ from: 'Livery blue', livery: 'Livery red' }),
      })]);
    });

    it('refuses the livery the car wears already', async () => {
      const { store } = await build({ career: garaged(), cars: [TEST_CAR], prices: PRICES });

      await expect(store.repaintCar({ model: 'test_car', skin: 'blue' }))
        .rejects.toMatchObject({ code: 'career.car.sameLivery' });
    });

    it('refuses a livery the car does not have', async () => {
      const { store } = await build({ career: garaged(), cars: [TEST_CAR], prices: PRICES });

      await expect(store.repaintCar({ model: 'test_car', skin: 'gold' }))
        .rejects.toMatchObject({ code: 'career.car.livery' });
    });

    it('refuses a repaint the career cannot pay for', async () => {
      const { store } = await build({ career: garaged([], 500), cars: [TEST_CAR], prices: PRICES });

      await expect(store.repaintCar({ model: 'test_car', skin: 'red' }))
        .rejects.toMatchObject({ code: 'career.car.short', params: { price: 600, money: 500 } });
    });

    it('refuses a car the garage does not hold', async () => {
      const { store } = await build({ career: careerWith({}), cars: [TEST_CAR], prices: PRICES });

      await expect(store.repaintCar({ model: 'test_car', skin: 'red' }))
        .rejects.toMatchObject({ code: 'career.car.notOwned' });
    });
  });

  describe('withdraw', () => {
    it('refuses to give a standalone championship up', async () => {
      const { store } = await build({ closed: true });
      await store.createChampionship(NEW_CHAMPIONSHIP);

      await expect(store.withdraw({ series: CUP.id, entry: 'main' })).rejects.toMatchObject({ code: 'standalone.withdraw' });
    });

    it('gives up every round still to come and keeps what was raced', async () => {
      const career = careerWith({
        entries: [makeEntry({
          events: [
            makeEvent('one', '2027-01-01', { status: 'raced' }),
            makeEvent('two', '2027-06-06'),
          ],
        })],
      });
      const { store } = await build({ career });
      await store.withdraw({ series: CUP.id, entry: 'main' });
      const entry = entryOf(store.get());

      expect(entry.withdrawn).toBe(true);
      expect(entry.events.map((event) => event.status)).toEqual(['raced', 'missed']);
    });

    it('refuses a class the career is not in', async () => {
      const { store } = await build({ career: careerWith({}) });

      await expect(store.withdraw({ series: CUP.id, entry: 'main' }))
        .rejects.toMatchObject({ code: 'career.entry.notEnrolled' });
    });

    // Fixed: withdrawing while a session was out at the game marked its round
    // missed, and the result landed on nothing when it came back.
    it('refuses while a session of its own round is out at the game', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] });
      const { store, race } = await build({ career });
      race.setProgress({ raceId: 'test-cup/one', completed: 0, inFlight: true });

      await expect(store.withdraw({ series: CUP.id, entry: 'main' })).rejects.toMatchObject({ code: 'run.inFlight' });
    });

    it('lets a championship go while a session of another is out at the game', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-06-06')] })] });
      const { store, race } = await build({ career });
      race.setProgress({ raceId: 'other-cup/one', completed: 0, inFlight: true });
      await store.withdraw({ series: CUP.id, entry: 'main' });

      expect(entryOf(store.get()).withdrawn).toBe(true);
    });

    it('declines a historic event that has not begun', async () => {
      const event = historicListing('h1').series;
      const career = careerWith({
        entries: [makeEntry({
          series: 'h1', championship: event, historic: true, events: [makeEvent('only', '2027-02-03')],
        })],
      });
      const { store } = await build({ career });
      await store.withdraw({ series: 'h1', entry: 'main' });

      expect(entryOf(store.get(), 'h1')).toMatchObject({ withdrawn: true, events: [{ status: 'missed' }] });
    });

    // Fixed: Decline was offered part-way through an event, and taking it threw
    // away the sessions the player had driven.
    it('refuses to decline a historic event already begun', async () => {
      const event = historicListing('h1').series;
      const career = careerWith({
        entries: [makeEntry({
          series: 'h1',
          championship: event,
          historic: true,
          events: [makeEvent('only', '2027-01-01', { sessions: [record(0)] })],
        })],
      });
      const { store } = await build({ career });

      await expect(store.withdraw({ series: 'h1', entry: 'main' }))
        .rejects.toMatchObject({ code: 'historic.started' });
    });
  });

  describe('strength', () => {
    /**
     * A career entered in the cup, its first round already run.
     * @returns The career
     */
    const entered = (): Career => careerWith({
      entries: [makeEntry({
        events: [makeEvent('one', '2027-01-01', { status: 'raced' }), makeEvent('two', '2027-06-06')],
      })],
    });

    it("keeps the player's step for the season", async () => {
      const { store } = await build({ career: entered() });
      await store.strength({ series: CUP.id, strength: 3 });

      expect(entryOf(store.get()).strength).toBe(3);
    });

    it("keeps the player's step for one round still to run", async () => {
      const { store } = await build({ career: entered() });
      await store.strength({ series: CUP.id, round: 'two', strength: -2 });

      expect(entryOf(store.get()).events[1].strength).toBe(-2);
    });

    it('leaves a round already run at what it raced at', async () => {
      const { store } = await build({ career: entered() });

      await expect(store.strength({ series: CUP.id, round: 'one', strength: 2 }))
        .rejects.toMatchObject({ code: 'career.event.closed' });
    });

    it('refuses a championship the career is not in', async () => {
      const { store } = await build({ career: careerWith({}) });

      await expect(store.strength({ series: CUP.id, strength: 2 }))
        .rejects.toMatchObject({ code: 'career.event.notEntered' });
    });
  });

  describe('advanceTo', () => {
    /**
     * A career entered in the cup, its rounds in March and June.
     * @param date Where the clock stands
     * @returns The career
     */
    const entered = (date = '2027-01-01'): Career => careerWith({
      entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
    }, date);

    it("refuses to move a standalone championship's clock", async () => {
      const { store } = await build({ closed: true });
      await store.createChampionship(NEW_CHAMPIONSHIP);

      await expect(store.advanceTo('2030-02-01')).rejects.toMatchObject({ code: 'standalone.clock' });
    });

    it('refuses to move the clock backwards', async () => {
      const { store } = await build({ career: entered('2027-02-01') });

      await expect(store.advanceTo('2027-01-15')).rejects.toMatchObject({ code: 'career.date.backwards' });
    });

    it('refuses while a session is out at the game', async () => {
      const { store, race } = await build({ career: entered() });
      race.setProgress({ raceId: 'test-cup/one', completed: 0, inFlight: true });

      await expect(store.advanceTo('2027-02-01')).rejects.toMatchObject({ code: 'run.inFlight' });
    });

    it("stops at the career's next event rather than passing it unasked", async () => {
      const { store } = await build({ career: entered() });
      await store.advanceTo('2027-08-01');

      expect(store.get()?.date).toBe('2027-03-07');
      expect(entryOf(store.get()).events.map((event) => event.status)).toEqual(['scheduled', 'scheduled']);
    });

    it('goes all the way once confirmed, and the field races what it passed', async () => {
      const { store } = await build({ career: entered() });
      await store.advanceTo('2027-08-01', true);
      const { events } = entryOf(store.get());

      expect(store.get()?.date).toBe('2027-08-01');
      expect(events.map((event) => event.status)).toEqual(['missed', 'missed']);
      expect(events.every((event) => event.simulated)).toBe(true);
    });

    it('refuses to leave an event part-way through unasked', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { sessions: [record(0)] })] })],
      });
      const { store } = await build({ career });

      await expect(store.advanceTo('2027-02-01')).rejects.toMatchObject({ code: 'career.event.inProgress' });
    });

    it('autosaves as the new season opens', async () => {
      const { store } = await build({ career: entered('2027-12-20') });
      const files = memoryDisk();
      await store.advanceTo('2028-01-02', true);

      expect(JSON.parse(files.get(saveFile('autosave-1')) ?? '{}')).toMatchObject({
        kind: 'auto', date: '2028-01-02', moment: { kind: 'season', year: 2028 },
      });
    });

    it('takes no autosave for a move inside the season', async () => {
      const { store } = await build({ career: entered() });
      const files = memoryDisk();
      await store.advanceTo('2027-02-01');

      expect(files.has(saveFile('autosave-1'))).toBe(false);
    });

    it('closes the year on the way past New Year and opens the next one, drawn', async () => {
      const { store } = await build({
        career: entered('2027-12-20'),
        historic: ['h1', 'h2', 'h3', 'h4'].map(historicListing),
        careerSettings: { historicFrequency: 'quarterly' },
      });
      await store.advanceTo('2028-01-02', true);
      const seasons = store.get()?.seasons ?? [];

      expect(seasons.map((season) => season.startDate)).toEqual(['2027-01-01', '2028-01-01']);
      expect(seasons[1].historicDrawn).toBe(true);
      // A confirmed move draws nothing behind where it lands.
      expect(seasons[1].entries.every((one) => one.events[0].date >= '2028-01-02')).toBe(true);
    });
  });

  describe('skips', () => {
    it('lists the rounds a move to a date would give up', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
      });
      const { store } = await build({ career });

      expect((await store.skips('2027-04-01')).map((one) => one.round)).toEqual(['one']);
    });
  });

  describe('roundCosts', () => {
    // The cup at 1,000 a round, its class racing the cup's car at 800 a round's
    // rent or a cheaper one at 200.
    const PRICED = makeChampionship({
      entryFee: 1_000,
      entries: [makeClassEntry({ eligibility: { kind: 'cars', cars: ['test_car', 'cheap_car'] } })],
    });
    const PRICED_LISTING = makeListing(PRICED, {
      availability: makeAvailability(PRICED, {
        entries: [{
          entry: 'main', eligible: ['test_car', 'cheap_car'], missing: [], enough: true,
        }],
      }),
    });
    const CARS = [TEST_CAR, makeCar('cheap_car')];
    const CAR_PRICES = { ...PRICES, cheap_car: 10_000 };

    it("prices a round of a class as its next round's fee and the cheapest rent the class allows", async () => {
      const { store } = await build({
        career: careerWith({}), listings: [PRICED_LISTING], cars: CARS, prices: CAR_PRICES,
      });

      expect(await store.roundCosts()).toEqual([{ series: PRICED.id, entry: 'main', cost: 1_200 }]);
    });

    it('charges nothing for the car when the garage holds one the class may race', async () => {
      const { store } = await build({
        career: garaged(), listings: [PRICED_LISTING], cars: CARS, prices: CAR_PRICES,
      });

      expect(await store.roundCosts()).toEqual([{ series: PRICED.id, entry: 'main', cost: 1_000 }]);
    });

    it("prices every class of an edition the career is in at its next launch's fee and rent", async () => {
      const championship = makeChampionship({
        entryFee: 1_000,
        entries: [makeClassEntry(), makeClassEntry({ id: 'other' })],
      });
      const career = careerWith({
        entries: [makeEntry({
          championship,
          car: { model: 'test_car', source: 'rented' },
          events: [
            makeEvent('one', '2027-03-07', { status: 'raced', entryFee: 1_000 }),
            makeEvent('two', '2027-06-06', { entryFee: 3_000 }),
          ],
        })],
      });
      const { store } = await build({
        career, listings: [makeListing(championship)], cars: [TEST_CAR], prices: PRICES,
      });

      expect(await store.roundCosts()).toEqual([
        { series: championship.id, entry: 'main', cost: 3_800 },
        { series: championship.id, entry: 'other', cost: 3_800 },
      ]);
    });

    it('prices an edition the career is in in the car it races, at only what is still owed', async () => {
      const career = makeCareer({
        ...careerWith({
          entries: [makeEntry({
            championship: PRICED,
            car: { model: 'test_car', source: 'rented' },
            events: [makeEvent('one', '2027-03-07', { entryFee: 1_000 })],
          })],
        }),
        // The fee is paid already, so only the rent is still owed.
        ledger: [{
          key: 'fee:test-cup/one', kind: 'fee', date: '2027-01-01', amount: -1_000, season: 0,
        }],
      });
      const { store } = await build({
        career, listings: [PRICED_LISTING], cars: CARS, prices: CAR_PRICES,
      });

      expect(await store.roundCosts()).toEqual([{ series: PRICED.id, entry: 'main', cost: 800 }]);
    });

    it('lets the opening round stand for an edition with nothing left this season', async () => {
      const championship = { ...PRICED, rounds: [makeRound('one', { entryFee: 500 }), makeRound('two', { entryFee: 2_000 })] };
      const { store } = await build({
        career: careerWith({}, '2027-12-30'),
        listings: [{ ...PRICED_LISTING, series: championship }],
        cars: CARS,
        prices: CAR_PRICES,
      });

      expect(await store.roundCosts()).toEqual([{ series: PRICED.id, entry: 'main', cost: 700 }]);
    });

    it('leaves out a class nothing installed can enter, and a championship the install cannot race', async () => {
      const unraceable = makeChampionship({ id: 'unraceable' });
      const { store } = await build({
        career: careerWith({}),
        listings: [
          makeListing(CUP, {
            availability: makeAvailability(CUP, {
              entries: [{
                entry: 'main', eligible: [], missing: [], enough: false,
              }],
            }),
          }),
          makeListing(unraceable, { availability: makeAvailability(unraceable, { available: false }) }),
        ],
      });

      expect(await store.roundCosts()).toEqual([]);
    });

    it('prices nothing in a standalone championship, which has no money', async () => {
      const { store } = await build({ closed: true });
      await store.createChampionship(NEW_CHAMPIONSHIP);

      expect(await store.roundCosts()).toEqual([]);
    });
  });

  describe('skipping', () => {
    it('lists every round skipping one would lose, the round itself last', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
      });
      const { store } = await build({ career, listings: [UNRACEABLE_TWO] });

      expect((await store.skipping({ series: CUP.id, round: 'two' })).map((one) => [one.round, one.reason]))
        .toEqual([['one', 'skipped'], ['two', 'unraceable']]);
    });
  });

  describe('skip', () => {
    /**
     * A career entered in the cup, its rounds in March and June.
     * @returns The career
     */
    const entered = (): Career => careerWith({
      entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
    });

    it("moves the clock to the round's day, and the field races it and every round lost with it", async () => {
      const { store } = await build({ career: entered(), listings: [UNRACEABLE_TWO] });
      await store.skip({ series: CUP.id, round: 'two' });
      const { events } = entryOf(store.get());

      expect(store.get()?.date).toBe('2027-06-06');
      expect(events.map((event) => event.status)).toEqual(['missed', 'missed']);
      expect(events.every((event) => event.simulated)).toBe(true);
    });

    it("skips a round the player's own car can no longer race, though the round races without it", async () => {
      const career = careerWith({
        entries: [makeEntry({
          car: { model: 'gone_car' },
          events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')],
        })],
      });
      const { store } = await build({ career });
      await store.skip({ series: CUP.id, round: 'one' });

      expect(entryOf(store.get()).events.map((event) => event.status)).toEqual(['missed', 'scheduled']);
    });

    it('refuses a round the install can race', async () => {
      const { store } = await build({ career: entered() });

      await expect(store.skip({ series: CUP.id, round: 'two' }))
        .rejects.toMatchObject({ code: 'career.skip.raceable' });
      expect(store.get()?.date).toBe('2027-01-01');
    });

    it('refuses a round already behind it', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06', { status: 'missed' })] })],
      });
      const { store } = await build({ career, listings: [UNRACEABLE_TWO] });

      await expect(store.skip({ series: CUP.id, round: 'two' }))
        .rejects.toMatchObject({ code: 'career.event.closed' });
    });

    it('refuses while a session is out at the game', async () => {
      const { store, race } = await build({ career: entered(), listings: [UNRACEABLE_TWO] });
      race.setProgress({ raceId: 'test-cup/one', completed: 0, inFlight: true });

      await expect(store.skip({ series: CUP.id, round: 'two' })).rejects.toMatchObject({ code: 'run.inFlight' });
    });

    it('refuses a round of a championship the career is not in', async () => {
      const { store } = await build({ career: careerWith({}), listings: [UNRACEABLE_TWO] });

      await expect(store.skip({ series: CUP.id, round: 'two' }))
        .rejects.toMatchObject({ code: 'career.event.notEntered' });
    });

    it("finishes a standalone championship whose last rounds can't be raced", async () => {
      const { store } = await build({ closed: true, listings: [UNRACEABLE_TWO] });
      await store.createChampionship(NEW_CHAMPIONSHIP);
      const last = entryOf(store.get()).events[1].date;
      await store.skip({ series: CUP.id, round: 'two' });
      const career = store.get();

      expect(career?.date).toBe(last);
      expect(career && standaloneStanding(career)?.over).toBe(true);
    });
  });

  describe('event', () => {
    it('reads a round the career is in as entered, in its own seat', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-03-07')] })] });
      const { store } = await build({ career });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view).toMatchObject({
        series: CUP.id, round: 'one', date: '2027-03-07', entered: { entry: 'main' }, historic: null,
      });
    });

    it("says a round the player's own car can no longer race cannot be raced, which is what offers its skip", async () => {
      const career = careerWith({
        entries: [makeEntry({ car: { model: 'gone_car' }, events: [makeEvent('one', '2027-03-07')] })],
      });
      const { store } = await build({ career });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view.blocked?.code).toBe('series.round.unavailable');
      expect(view.sessions).toEqual([]);
    });

    it('says what the round costs and what the career holds', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07', { entryFee: 1500 })] })],
      });
      const { store } = await build({ career });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view.money).toEqual({ fee: 1500, paid: false, rent: null, rentPaid: false, balance: 100_000 });
      expect(view.blocked).toBeNull();
    });

    it('refuses a round the career cannot pay to enter', async () => {
      const career = makeCareer({
        ...careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-03-07', { entryFee: 1500 })] })] }),
        money: 1000,
      });
      const { store } = await build({ career });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view.blocked).toMatchObject({ code: 'career.money.short', params: { fee: 1500, money: 1000 } });
    });

    it('says what a round of a rented car rents for', async () => {
      const career = careerWith({
        entries: [makeEntry({
          car: { model: 'test_car', source: 'rented' }, events: [makeEvent('one', '2027-03-07')],
        })],
      });
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });

      expect((await store.event({ series: CUP.id, round: 'one' })).money).toMatchObject({ rent: 800, rentPaid: false });
    });

    it('says an owned car rents for nothing', async () => {
      const career = garaged([makeEntry({
        car: { model: 'test_car', skin: 'blue', source: 'owned' }, events: [makeEvent('one', '2027-03-07')],
      })]);
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });

      expect((await store.event({ series: CUP.id, round: 'one' })).money?.rent).toBeNull();
    });

    it('counts the rent beside the fee in what the career cannot pay', async () => {
      const career = makeCareer({
        ...careerWith({
          entries: [makeEntry({
            car: { model: 'test_car', source: 'rented' },
            events: [makeEvent('one', '2027-03-07', { entryFee: 1500 })],
          })],
        }),
        money: 2000,
      });
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view.blocked).toMatchObject({ code: 'career.money.short', params: { fee: 2300, money: 2000 } });
    });

    it('offers the cars of the round entering would start from', async () => {
      const availability = makeAvailability(CUP);
      const { store } = await build({
        career: careerWith({}),
        listings: [makeListing(CUP, {
          availability: {
            ...availability,
            rounds: availability.rounds.map((one) => (one.round === 'one' ? {
              ...one, entries: [{ entry: 'main', eligible: ['other_car'], missing: [], enough: true }],
            } : one)),
          },
        })],
      });
      const view = await store.event({ series: CUP.id, round: 'two' });

      expect(view.classes[0].cars).toEqual(['other_car']);
    });

    it("shows a round's prize at the career's progression speed", async () => {
      const championship = makeChampionship({ prizes: { positions: [1000] } });
      const career = careerWith({
        entries: [makeEntry({ championship, events: [makeEvent('one', '2027-03-07')] })],
      });
      const { store } = await build({ career, careerSettings: { progression: 1.5 } });

      expect((await store.event({ series: CUP.id, round: 'one' })).prize).toBe(1500);
    });

    it('says a round of a championship the career is not in has to be entered first', async () => {
      const { store } = await build({ career: careerWith({}) });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view.entered).toBeNull();
      expect(view.blocked?.code).toBe('career.event.notEntered');
      expect(view.money).toBeNull();
    });

    it("reads a historic event off the season's own copy, with the seat it invited the player to", async () => {
      const event = historicListing('h1').series;
      const career = careerWith({
        entries: [makeEntry({
          series: 'h1', championship: event, historic: true, events: [makeEvent('only', '2027-02-03')],
        })],
      });
      const { store } = await build({ career });
      const view = await store.event({ series: 'h1', round: 'only' });

      expect(view.historic).toMatchObject({ seat: 'seat-2', event: { id: 'h1' } });
    });

    // Fixed: a declined historic event is in no library a career reads, and its
    // page said the championship could not be found.
    it('reads a declined historic event back off its own entry', async () => {
      const event = historicListing('h1').series;
      const career = careerWith({
        entries: [makeEntry({
          series: 'h1',
          championship: event,
          historic: true,
          withdrawn: true,
          events: [makeEvent('only', '2027-02-03', { status: 'missed' })],
        })],
      });
      const { store } = await build({ career });

      await expect(store.event({ series: 'h1', round: 'only' })).resolves.toMatchObject({ status: 'missed' });
    });
  });

  describe('results', () => {
    it("reads an entered championship's season off the career", async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-03-07')] })] });
      const { store } = await build({ career });
      const results = await store.results({ series: CUP.id });

      expect(results).toMatchObject({ playerSeat: 'seat-2', playerEntry: 'main' });
    });

    it('simulates a championship the career is not in, the same on every read', async () => {
      const { store } = await build({ career: careerWith({}, '2027-12-31') });
      const first = await store.results({ series: CUP.id });

      expect(first.playerSeat).toBeNull();
      expect(first.rounds).toHaveLength(2);
      expect(await store.results({ series: CUP.id })).toEqual(first);
    });
  });

  describe('launch', () => {
    it('loads the round into the race slot under its run id and sends it out', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] });
      const { store, race } = await build({ career });
      await store.launch({ series: CUP.id, round: 'one', scale: 2 });

      expect(race.loaded.map((one) => one.definition.id)).toEqual(['test-cup/one']);
      expect(race.launches).toEqual([2]);
    });

    it("moves the clock to an event raced ahead of it", async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-03-07')] })] });
      const { store } = await build({ career });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(store.get()?.date).toBe('2027-03-07');
    });

    it('refuses to race past an earlier round unasked, and gives it up once confirmed', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
      });
      const { store } = await build({ career });

      await expect(store.launch({ series: CUP.id, round: 'two' }))
        .rejects.toMatchObject({ code: 'career.event.earlierPending' });

      await store.launch({ series: CUP.id, round: 'two', skip: true });

      expect(entryOf(store.get()).events[0].status).toBe('missed');
    });

    it('costs the season nothing when the launch fails to start', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
      });
      const { store, race } = await build({ career });
      race.launch = async () => { throw new Error('Content Manager is not there'); };

      await expect(store.launch({ series: CUP.id, round: 'two', skip: true })).rejects.toThrow('Content Manager');
      expect(entryOf(store.get()).events[0].status).toBe('scheduled');
      expect(store.get()?.date).toBe('2027-01-01');
    });

    it('pays the entry fee as the first session goes out, and only once', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { entryFee: 1500 })] })],
      });
      const { store } = await build({ career });
      await store.launch({ series: CUP.id, round: 'one' });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(store.get()?.money).toBe(98_500);
      expect(store.get()?.ledger).toEqual([expect.objectContaining({
        key: 'fee:test-cup/one', kind: 'fee', amount: -1500, round: 'one',
      })]);
    });

    it('refuses a launch the career cannot pay for, sending nothing out', async () => {
      const career = makeCareer({
        ...careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { entryFee: 1500 })] })] }),
        money: 1000,
      });
      const { store, race } = await build({ career });

      await expect(store.launch({ series: CUP.id, round: 'one' }))
        .rejects.toMatchObject({ code: 'career.money.short', params: { fee: 1500, money: 1000 } });
      expect(race.launches).toEqual([]);
    });

    it("pays a rented car's rent beside the fee, and only once", async () => {
      const career = careerWith({
        entries: [makeEntry({
          car: { model: 'test_car', source: 'rented' },
          events: [makeEvent('one', '2027-01-01', { entryFee: 1500 })],
        })],
      });
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });
      await store.launch({ series: CUP.id, round: 'one' });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(store.get()?.money).toBe(97_700);
      expect(store.get()?.ledger).toEqual([
        expect.objectContaining({ key: 'fee:test-cup/one', kind: 'fee', amount: -1500 }),
        expect.objectContaining({
          key: 'rent:test-cup/one', kind: 'rent', amount: -800, car: { model: 'test_car', name: 'Car test_car' },
        }),
      ]);
    });

    it('charges an owned car no rent', async () => {
      const career = garaged([makeEntry({
        car: { model: 'test_car', skin: 'blue', source: 'owned' },
        events: [makeEvent('one', '2027-01-01', { entryFee: 1500 })],
      })]);
      const { store } = await build({ career, cars: [TEST_CAR], prices: PRICES });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(store.get()?.ledger.map((line) => line.kind)).toEqual(['fee']);
    });

    it('refuses a launch the fee and the rent together come to more than the career holds', async () => {
      const career = makeCareer({
        ...careerWith({
          entries: [makeEntry({
            car: { model: 'test_car', source: 'rented' },
            events: [makeEvent('one', '2027-01-01', { entryFee: 1500 })],
          })],
        }),
        money: 2000,
      });
      const { store, race } = await build({ career, cars: [TEST_CAR], prices: PRICES });

      await expect(store.launch({ series: CUP.id, round: 'one' }))
        .rejects.toMatchObject({ code: 'career.money.short', params: { fee: 2300, money: 2000 } });
      expect(race.launches).toEqual([]);
    });

    it('charges nothing when the launch fails to start', async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { entryFee: 1500 })] })],
      });
      const { store, race } = await build({ career });
      race.launch = async () => { throw new Error('Content Manager is not there'); };

      await expect(store.launch({ series: CUP.id, round: 'one' })).rejects.toThrow('Content Manager');
      expect(store.get()?.money).toBe(100_000);
      expect(store.get()?.ledger).toEqual([]);
    });

    it("races under the career's own driver rather than the default one", async () => {
      const career = makeCareer({
        ...careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] }),
        driver: { name: 'Oksana Melnyk', nation: 'UKR' },
      });
      const { store, race } = await build({ career, settings: { driverName: 'Someone Else' } });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(race.loaded[0].definition.playerCar).toMatchObject({
        driver: 'Oksana Melnyk', nationCode: 'UKR', nationality: expect.any(String),
      });
    });

    it('refuses a round of a championship the career is not in', async () => {
      const { store } = await build({ career: careerWith({}) });

      await expect(store.launch({ series: CUP.id, round: 'one' }))
        .rejects.toMatchObject({ code: 'career.event.notEntered' });
    });

    it("lowers the round over the career's own opponents, or the app's while it follows them", async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] });
      const { store, series } = await build({ career, settings: { opponents: { strength: 90, aggression: 20 } } });
      const seen: unknown[] = [];
      const lower = series.lowerRound;
      series.lowerRound = async (championship, request, step, opponents) => {
        seen.push(opponents);

        return lower(championship, request, step, opponents);
      };
      await store.event({ series: CUP.id, round: 'one' });
      await store.setSettings({ opponents: { strength: 70, aggression: 60 } });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(seen[0]).toEqual({ strength: 90, aggression: 20 });
      expect(seen.at(-1)).toEqual({ strength: 70, aggression: 60 });
    });

    it("launches with the career's own driving aids, or the app's while it follows them", async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] });
      const { store, race } = await build({ career, settings: { drivingAids: { abs: 2 } } });
      const aids: (DrivingAids | undefined)[] = [];
      race.launch = async (options) => {
        aids.push(options?.aids);

        return race.get();
      };
      await store.launch({ series: CUP.id, round: 'one' });
      await store.setSettings({ drivingAids: { abs: 0, autoClutch: true } });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(aids).toEqual([{ abs: 2 }, { abs: 0, autoClutch: true }]);
    });

    it('clashes two events on one day unless the career allows them', async () => {
      const other = makeChampionship({ id: 'other-cup', name: 'Other Cup' });
      const career = careerWith({
        entries: [
          makeEntry({ events: [makeEvent('one', '2027-03-07')] }),
          makeEntry({
            series: other.id,
            championship: other,
            events: [makeEvent('one', '2027-03-07', { raceId: 'other-cup/one' })],
          }),
        ],
      });
      const { store } = await build({ career });

      await expect(store.launch({ series: CUP.id, round: 'one' }))
        .rejects.toMatchObject({ code: 'career.event.sameDay' });

      await store.setSettings({ allowSameDayEvents: true });
      await store.launch({ series: CUP.id, round: 'one' });

      expect(store.get()?.date).toBe('2027-03-07');
    });
  });

  describe('adopting a result', () => {
    /**
     * A career entered in the cup, its first round on the 7 March.
     * @returns The career
     */
    const entered = (): Career => careerWith({
      entries: [makeEntry({ events: [makeEvent('one', '2027-03-07'), makeEvent('two', '2027-06-06')] })],
    });

    /**
     * What the race store pushes once launches of the cup's first round land.
     * @param completed How many have
     * @param launchCount How many the event runs
     * @returns The state
     */
    const landed = (completed: number, launchCount = 2) => raceSetup({
      owner: CAREER_ID,
      plan: makePlan(CUP.eventFormats[0].sessions.slice(0, launchCount)),
      state: {
        raceId: 'test-cup/one', launchCount, completed: Array.from({ length: completed }, (unused, at) => record(at)),
      },
    });

    it('records a launch on its round the moment it lands', async () => {
      const { store, race } = await build({ career: entered() });
      race.push(landed(1));
      await settled();
      const [one] = entryOf(store.get()).events;

      expect(one.sessions).toHaveLength(1);
      expect(one.status).toBe('scheduled');
    });

    it('closes the round once its last launch lands, and moves the clock to its day', async () => {
      const { store, race } = await build({ career: entered() });
      race.push(landed(2));
      await settled();

      expect(entryOf(store.get()).events[0].status).toBe('raced');
      expect(store.get()?.date).toBe('2027-03-07');
    });

    it('ignores a push while a launch is still out, or one holding nothing new', async () => {
      const { store, race } = await build({ career: entered() });
      race.push({ ...landed(1), status: { ...landed(1).status, phase: 'waiting' } });
      await settled();

      expect(entryOf(store.get()).events[0].sessions).toHaveLength(0);

      race.push(landed(1));
      await settled();
      const before = store.get();
      race.push(landed(1));
      await settled();

      expect(store.get()).toBe(before);
    });

    it('autosaves once a launch lands, saying which session it followed', async () => {
      const { store, race } = await build({ career: entered() });
      const heard: string[][] = [];
      store.onSaves((saves) => heard.push(saves.saves.map((one) => one.id)));
      const files = memoryDisk();
      race.push(landed(1));
      await store.flush();
      await settled();
      const [session] = CUP.eventFormats[0].sessions;

      expect(JSON.parse(files.get(saveFile('autosave-1')) ?? '{}')).toMatchObject({
        kind: 'auto',
        moment: {
          kind: 'session',
          seriesName: CUP.name,
          roundName: CUP.rounds[0].name,
          session: { name: session.name ?? null, type: session.type },
        },
      });
      expect(heard).toEqual([['autosave-1']]);
    });

    it('keeps no more autosaves than settings ask for', async () => {
      const { store, race } = await build({ career: entered(), settings: { autosaves: 1 } });
      const files = memoryDisk();
      race.push(landed(1));
      await settled();
      race.push(landed(2));
      await settled();
      await store.flush();

      expect([...files.keys()].filter((file) => file.includes('autosave-'))).toEqual([saveFile('autosave-1')]);
      expect(JSON.parse(files.get(saveFile('autosave-1')) ?? '{}').state.seasons[0].entries[0].events[0].status)
        .toBe('raced');
    });

    // Two careers can race a round under the same id, so a result another
    // career put in the slot must never land on this one.
    it('ignores a result another career put in the slot', async () => {
      const { store, race } = await build({ career: entered() });
      const before = store.get();
      race.push({ ...landed(2), owner: OTHER_ID });
      await settled();

      expect(store.get()).toBe(before);
    });

    it("ignores a race that is none of the career's rounds", async () => {
      const { store, race } = await build({ career: entered() });
      const before = store.get();
      const other = landed(2);
      race.push({ ...other, plan: other.plan && { ...other.plan, raceId: 'quick/abc' } });
      await settled();

      expect(store.get()).toBe(before);
    });
  });

  describe('settling up', () => {
    it('pays a prize the career has earned whatever command settles it, and only once', async () => {
      const championship = makeChampionship({ prizes: { positions: [1000, 600] } });
      const place: RacePlace = {
        seat: 'seat-2',
        entry: 'main',
        team: null,
        driver: 'Test Driver',
        position: 2,
        classPosition: 2,
        qualifyingPosition: null,
        fastestLap: false,
        finishPoints: 18,
        fastestLapPoints: 0,
        qualifyingPoints: 0,
        points: 18,
      };
      const raced = makeEvent('one', '2027-03-07', {
        status: 'raced',
        score: {
          round: 'one',
          recordedAt: '2027-03-07T18:00:00.000Z',
          races: [{
            launch: 2, session: null, name: 'Race', pointsSystem: 'standard', places: [place],
          }],
        },
      });
      const career = careerWith({ entries: [makeEntry({ championship, events: [raced] })] }, '2027-03-07');
      const { store } = await build({ career });
      await store.setSettings({ allowSameDayEvents: true });
      await store.setSettings({ allowSameDayEvents: false });

      expect(store.get()?.money).toBe(100_600);
      expect(store.get()?.ledger).toEqual([expect.objectContaining({
        key: 'race:test-cup/one:2', kind: 'race', amount: 600, place: 2,
      })]);
    });
  });

  describe('saves', () => {
    it("lists a career's saves, newest first, whether it is open or not", async () => {
      const { store } = await build({ closed: true });
      const files = memoryDisk();
      putSave(files, 'quicksave', careerWith({}));
      files.set(saveFile(NAMED_ID), JSON.stringify({
        ...JSON.parse(files.get(saveFile('quicksave')) ?? '{}'),
        id: NAMED_ID,
        kind: 'named',
        name: 'Later',
        savedAt: '2027-01-01T08:00:00.000Z',
      }));

      expect((await store.saves(CAREER_ID)).map((one) => one.id)).toEqual([NAMED_ID, 'quicksave']);
    });

    it('answers none for a career with no saves yet', async () => {
      const { store } = await build({ closed: true });
      memoryDisk();

      expect(await store.saves(CAREER_ID)).toEqual([]);
    });
  });

  describe('quickSave', () => {
    it('saves where the career has got to, and nothing of who races it', async () => {
      const { store } = await build({ career: careerWith({}, '2027-02-14') });
      const files = memoryDisk();
      const saves = await store.quickSave();
      const written = JSON.parse(files.get(saveFile('quicksave')) ?? '{}');

      expect(saves.map((one) => [one.id, one.kind])).toEqual([['quicksave', 'quick']]);
      expect(written).toMatchObject({ kind: 'quick', date: '2027-02-14', state: { date: '2027-02-14' } });
      expect(written.state).not.toHaveProperty('driver');
    });

    it('writes over the one quick save there is', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();
      await store.advanceTo('2027-02-01');

      expect(await store.quickSave()).toEqual([expect.objectContaining({ id: 'quicksave', date: '2027-02-01' })]);
    });

    it('tells everyone watching the saves', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      const heard: string[] = [];
      store.onSaves((saves) => heard.push(saves.career));
      await store.quickSave();

      expect(heard).toEqual([CAREER_ID]);
    });

    it('refuses with no career open', async () => {
      const { store } = await build({ closed: true });

      await expect(store.quickSave()).rejects.toMatchObject({ code: 'career.none' });
    });
  });

  describe('save', () => {
    it('makes a save of its own under each name', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.save({ name: 'First' });
      const saves = await store.save({ name: '  Second  ' });

      expect(saves.map((one) => one.name).sort()).toEqual(['First', 'Second']);
      expect(saves.every((one) => one.kind === 'named' && /^[0-9a-f-]{36}$/.test(one.id))).toBe(true);
    });

    it('writes over the named save it is asked to, keeping its id', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      const [first] = await store.save({ name: 'First' });
      await store.advanceTo('2027-02-01');
      const saves = await store.save({ name: 'Renamed', over: first.id });

      expect(saves).toEqual([expect.objectContaining({ id: first.id, name: 'Renamed', date: '2027-02-01' })]);
    });

    it('never writes over the quick save or an autosave', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();

      await expect(store.save({ name: 'Mine', over: 'quicksave' })).rejects.toMatchObject({ code: 'save.protected' });
      await expect(store.save({ name: 'Mine', over: 'autosave-1' })).rejects.toMatchObject({ code: 'save.protected' });
    });

    it('refuses to write over a save that is not there', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();

      await expect(store.save({ name: 'Mine', over: NAMED_ID })).rejects.toMatchObject({ code: 'save.notFound' });
    });

    it('refuses a name with nothing in it', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();

      await expect(store.save({ name: '   ' })).rejects.toMatchObject({ code: 'save.unnamed' });
    });
  });

  describe('load', () => {
    it('puts the career back where the save stood, and says which save it was', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();
      await store.advanceTo('2027-02-01');
      const loaded = await store.load(CAREER_ID, 'quicksave');

      expect(loaded.career.date).toBe('2027-01-01');
      expect(store.get()?.date).toBe('2027-01-01');
      expect(loaded.save).toMatchObject({ id: 'quicksave', kind: 'quick' });
      expect(loaded.save).not.toHaveProperty('state');
    });

    it('keeps the driver as they are now, since a save holds none', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();
      await store.setDriver({ name: 'Renamed', nation: null });
      await store.load(CAREER_ID, 'quicksave');

      expect(store.get()?.driver.name).toBe('Renamed');
    });

    it('writes the state it put back through to state.json', async () => {
      const { store } = await build({ career: careerWith({}) });
      const files = memoryDisk();
      await store.quickSave();
      await store.advanceTo('2027-02-01');
      await store.load(CAREER_ID, 'quicksave');
      await store.flush();

      expect(JSON.parse(files.get(path.join(folderOf(), 'state.json')) ?? '{}').date).toBe('2027-01-01');
    });

    it('opens a career that is not open, as the Careers page loads one', async () => {
      const career = careerWith({}, '2027-03-01');
      const { store } = await build({ closed: true });
      const files = memoryDisk([career]);
      putSave(files, 'quicksave', { ...career, date: '2027-02-01' });
      await store.load(CAREER_ID, 'quicksave');

      expect(store.get()).toMatchObject({ id: CAREER_ID, date: '2027-02-01', driver: career.driver });
    });

    it('refuses the save of a career that is not there', async () => {
      const { store } = await build({ closed: true });
      const files = memoryDisk();
      putSave(files, 'quicksave', careerWith({}));

      await expect(store.load(CAREER_ID, 'quicksave')).rejects.toMatchObject({ code: 'career.notFound' });
      expect(store.get()).toBeNull();
    });

    it('lists only the results the loaded state raced, leaving the others on disk', async () => {
      const raced = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { sessions: [record(0)] })] })],
      });
      const { store, race } = await build({ career: raced });
      const files = memoryDisk([raced]);
      putSave(files, 'quicksave', careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] }));

      expect(race.lists('launch-0.json')).toBe(true);

      await store.load(CAREER_ID, 'quicksave');

      expect(race.lists('launch-0.json')).toBe(false);
      expect(rm).not.toHaveBeenCalledWith(expect.stringContaining('launch-0'), expect.anything());
    });

    /**
     * A career part-way through the cup's first round, the race store's slot
     * holding the same launches.
     * @returns The career and its harness
     */
    const partWay = async () => {
      const career = careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { sessions: [record(0)] })] })],
      });
      const built = await build({ career });
      built.race.push(raceSetup({
        owner: CAREER_ID,
        definition: { id: 'test-cup/one' } as RaceSetup['definition'],
        plan: makePlan(CUP.eventFormats[0].sessions.slice(0, 2)),
        state: { raceId: 'test-cup/one', launchCount: 2, completed: [record(0)] },
      }));
      await settled();

      return { career, ...built };
    };

    it("empties the race slot when the save holds the slot's event at another point", async () => {
      const { career, store, race } = await partWay();
      const files = memoryDisk([career]);
      putSave(files, 'quicksave', careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-01-01')] })] }));
      await store.load(CAREER_ID, 'quicksave');

      expect(race.slot()).toBeNull();
    });

    // Counting them was not enough: a timeline left and raced again holds as
    // many sessions as the save, but not the same ones.
    it('empties the race slot when the save holds as many launches of the event but other ones', async () => {
      const { career, store, race } = await partWay();
      const files = memoryDisk([career]);
      const other = { ...record(0), completedAt: '2027-01-01T08:00:00.000Z', archive: 'launch-other.json' };
      putSave(files, 'quicksave', careerWith({
        entries: [makeEntry({ events: [makeEvent('one', '2027-01-01', { sessions: [other] })] })],
      }));
      await store.load(CAREER_ID, 'quicksave');

      expect(race.slot()).toBeNull();
    });

    it('leaves the race slot alone when the save holds the event just where the slot does', async () => {
      const { career, store, race } = await partWay();
      const files = memoryDisk([career]);
      putSave(files, 'quicksave', career);
      await store.load(CAREER_ID, 'quicksave');

      expect(race.slot()?.completed).toHaveLength(1);
    });

    it('refuses while a launch is out, leaving the career as it was', async () => {
      const { store, race } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();
      await store.advanceTo('2027-02-01');
      race.push(raceSetup({ status: { ...raceSetup().status, phase: 'waiting' } }));
      await settled();

      await expect(store.load(CAREER_ID, 'quicksave')).rejects.toMatchObject({ code: 'run.inFlight' });
      expect(store.get()?.date).toBe('2027-02-01');
    });

    it('sets a save that does not read aside rather than loading it', async () => {
      const { store } = await build({ career: careerWith({}) });
      const files = memoryDisk();
      files.set(saveFile('quicksave'), '{ not json');

      await expect(store.load(CAREER_ID, 'quicksave')).rejects.toMatchObject({ code: 'save.unreadable' });
      expect(copyFile).toHaveBeenCalledWith(
        saveFile('quicksave'),
        expect.stringContaining('quicksave.corrupt-1.json'),
        expect.any(Number),
      );
    });

    it('refuses a save that is not there', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();

      await expect(store.load(CAREER_ID, 'quicksave')).rejects.toMatchObject({ code: 'save.notFound' });
    });
  });

  describe('renameSave', () => {
    it('renames a named save, keeping when it was taken and what it holds', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      const [first] = await store.save({ name: 'First' });
      jest.setSystemTime(new Date('2027-01-05T09:00:00.000Z'));
      const saves = await store.renameSave(CAREER_ID, first.id, ' Second ');

      expect(saves).toEqual([{ ...first, name: 'Second' }]);
    });

    it('never renames the quick save or an autosave', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();

      await expect(store.renameSave(CAREER_ID, 'quicksave', 'Mine')).rejects.toMatchObject({ code: 'save.protected' });
      await expect(store.renameSave(CAREER_ID, 'autosave-1', 'Mine')).rejects.toMatchObject({ code: 'save.protected' });
    });
  });

  describe('deleteSave', () => {
    it('deletes a named save and answers with those left', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();
      const named = (await store.save({ name: 'First' })).find((one) => one.kind === 'named');
      if (!named) throw new Error('not saved');

      expect((await store.deleteSave(CAREER_ID, named.id)).map((one) => one.id)).toEqual(['quicksave']);
    });

    it('never deletes the quick save or an autosave', async () => {
      const { store } = await build({ career: careerWith({}) });
      memoryDisk();
      await store.quickSave();

      await expect(store.deleteSave(CAREER_ID, 'quicksave')).rejects.toMatchObject({ code: 'save.protected' });
      await expect(store.deleteSave(CAREER_ID, 'autosave-1')).rejects.toMatchObject({ code: 'save.protected' });
    });
  });

  describe('savesFolderOf', () => {
    it("answers the career's saves folder, making it first", async () => {
      jest.mocked(access).mockResolvedValue(undefined);
      const { store } = await build({ closed: true });
      const folder = await store.savesFolderOf(CAREER_ID);

      expect(folder).toBe(path.join(folderOf(), 'saves'));
      expect(mkdir).toHaveBeenCalledWith(folder, { recursive: true });
    });

    // A folder made for a career that is not there is one list trips over on
    // every read after.
    it('makes nothing for a career that is not there', async () => {
      jest.mocked(access).mockRejectedValue(errno('ENOENT'));
      const { store } = await build({ closed: true });

      await expect(store.savesFolderOf(OTHER_ID)).rejects.toMatchObject({ code: 'career.notFound' });
      expect(mkdir).not.toHaveBeenCalledWith(expect.stringContaining('saves'), expect.anything());
    });
  });

  describe('backupName', () => {
    it('names the backup after the driver and the day the clock stands at', async () => {
      onDisk([makeCareer({ date: '2027-06-14', driver: { name: 'Eterry', nation: 'GBR' } })]);
      const { store } = await build({ closed: true });

      expect(await store.backupName(CAREER_ID)).toBe('eterry-career-2027-06-14.zip');
    });

    it('reads the open career from memory, which is ahead of its file', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setDriver({ name: 'Oksana', nation: 'UKR' });

      expect(await store.backupName(CAREER_ID)).toBe('oksana-career-2027-01-01.zip');
    });

    it('refuses a career that is not there', async () => {
      const { store } = await build({ closed: true });

      await expect(store.backupName(OTHER_ID)).rejects.toMatchObject({ code: 'career.notFound' });
    });
  });

  describe('backup', () => {
    it("writes the career's folder as one zip, saying when, and how many saves and results went in", async () => {
      const { store } = await build({ closed: true });
      const career = careerWith({});
      const { files, zips } = folderDisk([career]);
      putSave(files, 'quicksave', career);
      files.set(path.join(folderOf(), 'results', '2027-03-07T10-00-00.json'), '{}');
      files.set(path.join(folderOf(), 'notes.txt'), 'not a career file');

      const written = await store.backup(CAREER_ID, 'D:\\out\\career.zip');
      const entries = await unpackZip(zips.get('D:\\out\\career.zip') ?? Buffer.alloc(0));

      expect(written).toEqual({ file: 'D:\\out\\career.zip', saves: 1, results: 1 });
      expect(entries.map((one) => one.name)).toEqual([
        'backup.json', 'career.json', 'state.json', 'saves/quicksave.json', 'results/2027-03-07T10-00-00.json',
      ]);
      expect(JSON.parse(entries[0].data.toString())).toEqual({
        version: 1, kind: 'career', backedUpAt: NOW.toISOString(),
      });
    });

    it('writes whatever the open career still had to write first', async () => {
      const { store } = await build({ career: careerWith({}) });
      const { zips } = folderDisk([careerWith({})]);
      await store.setDriver({ name: 'Oksana', nation: 'UKR' });
      await store.backup(CAREER_ID, 'D:\\out\\career.zip');
      const entries = await unpackZip(zips.get('D:\\out\\career.zip') ?? Buffer.alloc(0));
      const profile = JSON.parse(entries.find((one) => one.name === 'career.json')?.data.toString() ?? '{}');

      expect(profile.driver.name).toBe('Oksana');
    });

    it('refuses a career that is not there, writing nothing', async () => {
      const { store } = await build({ closed: true });
      const { zips } = folderDisk();

      await expect(store.backup(OTHER_ID, 'D:\\out\\career.zip')).rejects.toMatchObject({ code: 'career.notFound' });
      expect(zips.size).toBe(0);
    });
  });

  describe('readBackup', () => {
    it('says what a backup holds, restoring nothing of it', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk();
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));

      expect(await store.readBackup(BACKUP_FILE, 'career')).toMatchObject({
        file: BACKUP_FILE,
        career: { id: CAREER_ID, date: '2027-06-14' },
        saves: 0,
        results: 1,
        backedUpAt: '2027-06-14T21:40:00.000Z',
        here: null,
      });
      expect(files.size).toBe(0);
    });

    it('says when the career it holds is here already', async () => {
      const { store } = await build({ closed: true });
      const { zips } = folderDisk([careerWith({})]);
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));

      expect((await store.readBackup(BACKUP_FILE, 'career')).here).toMatchObject({ id: CAREER_ID, date: '2027-01-01' });
    });

    // Fixed: a career listed once was taken to be here for good, so one
    // deleted outside the app still read as the copy a restore would replace.
    it('finds no career here once its folder is deleted outside the app', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk([careerWith({})]);
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));
      await store.list('career');
      [...files.keys()].filter((file) => file.startsWith(folderOf())).forEach((file) => files.delete(file));

      expect((await store.readBackup(BACKUP_FILE, 'career')).here).toBeNull();
    });

    it('refuses a backup of the other kind, saying where it is restored from', async () => {
      const { store } = await build({ closed: true });
      const { zips } = folderDisk();
      const standaloneFile = 'D:\\backups\\championship.zip';
      zips.set(BACKUP_FILE, await backupOf(careerWith({})));
      zips.set(standaloneFile, await backupOf({ ...careerWith({}), kind: 'championship' }));

      await expect(store.readBackup(BACKUP_FILE, 'championship')).rejects.toMatchObject({ code: 'backup.isCareer' });
      await expect(store.readBackup(standaloneFile, 'career')).rejects.toMatchObject({ code: 'backup.isChampionship' });
    });

    it('refuses a zip holding no career that reads, and a file that is no zip', async () => {
      const { store } = await build({ closed: true });
      const { zips } = folderDisk();
      zips.set(BACKUP_FILE, await packZip([{ name: 'readme.txt', data: Buffer.from('hello') }]));
      zips.set('D:\\backups\\photo.zip', Buffer.from('not a zip at all, not even close'));

      await expect(store.readBackup(BACKUP_FILE, 'career')).rejects.toMatchObject({ code: 'backup.notCareer' });
      await expect(store.readBackup('D:\\backups\\photo.zip', 'career')).rejects.toMatchObject({ code: 'zip.unreadable' });
    });
  });

  describe('restore', () => {
    it('restores a career that is not here under its own id, its saves and results with it', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk();
      const career = careerWith({}, '2027-06-14');
      zips.set(BACKUP_FILE, await backupOf(career, {
        'saves/quicksave.json': JSON.stringify({
          version: 1, savedAt: '2027-06-01T10:00:00.000Z', date: '2027-06-01', state: stateOf(career),
        }),
      }));

      const restored = await store.restore(BACKUP_FILE, false);

      expect(restored.id).toBe(CAREER_ID);
      expect(restored.careers.map((one) => one.id)).toEqual([CAREER_ID]);
      expect([...files.keys()].sort()).toEqual([
        path.join(folderOf(), 'career.json'),
        path.join(folderOf(), 'results', '2027-03-07T10-00-00.json'),
        path.join(folderOf(), 'saves', 'quicksave.json'),
        path.join(folderOf(), 'state.json'),
      ].sort());
    });

    it('keeps both, the backup coming back as a career of its own that names its new id', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk([careerWith({})]);
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));

      const { id, careers } = await store.restore(BACKUP_FILE, false);
      const profile = JSON.parse(files.get(path.join(folderOf(id), 'career.json')) ?? '{}');

      expect(id).not.toBe(CAREER_ID);
      expect(profile.id).toBe(id);
      expect(careers.map((one) => one.id).sort()).toEqual([CAREER_ID, id].sort());
      expect(JSON.parse(files.get(path.join(folderOf(), 'state.json')) ?? '{}').date).toBe('2027-01-01');
    });

    // Fixed: replacing the career a page was showing left its saves panel on
    // the saves of the career it replaced, since its id had not changed.
    it('replaces the career here when asked, and says what its saves now are', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk([careerWith({})]);
      putSave(files, 'quicksave', careerWith({}));
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));
      const heard: string[][] = [];
      store.onSaves((saves) => heard.push(saves.saves.map((one) => one.id)));

      const { id } = await store.restore(BACKUP_FILE, true);

      expect(id).toBe(CAREER_ID);
      expect(JSON.parse(files.get(path.join(folderOf(), 'state.json')) ?? '{}').date).toBe('2027-06-14');
      // A save the backup did not hold goes with the career it replaced.
      expect(files.has(saveFile('quicksave'))).toBe(false);
      expect(heard).toEqual([[]]);
    });

    it('refuses to replace the career that is open, leaving it as it was', async () => {
      const { store } = await build({ career: careerWith({}) });
      const { files, zips } = folderDisk([careerWith({})]);
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));

      await expect(store.restore(BACKUP_FILE, true)).rejects.toMatchObject({ code: 'career.open' });
      expect(JSON.parse(files.get(path.join(folderOf(), 'state.json')) ?? '{}').date).toBe('2027-01-01');
    });

    it('gives a career whose id no folder could be named after a new one', async () => {
      const { store } = await build({ closed: true });
      const { zips } = folderDisk();
      zips.set(BACKUP_FILE, await backupOf({ ...careerWith({}), id: '../elsewhere' }));

      const { id } = await store.restore(BACKUP_FILE, false);

      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    // Fixed: a failed swap used to leave the career replaced in a folder the
    // Careers list never reads, so it vanished.
    it('puts the career here back when the backup cannot be moved into its place', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk([careerWith({})]);
      zips.set(BACKUP_FILE, await backupOf(careerWith({}, '2027-06-14')));
      const move = jest.mocked(rename).getMockImplementation();
      jest.mocked(rename).mockImplementation(async (from, to) => {
        if (String(from).endsWith('.restoring')) throw errno('EPERM');
        await move?.(from, to);
      });

      await expect(store.restore(BACKUP_FILE, true)).rejects.toThrow('EPERM');
      expect(JSON.parse(files.get(path.join(folderOf(), 'state.json')) ?? '{}').date).toBe('2027-01-01');
      expect([...files.keys()].every((file) => !file.includes('.restoring') && !file.includes('.replaced'))).toBe(true);
    });

    it('leaves nothing half written when a file of the backup cannot be written', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk();
      zips.set(BACKUP_FILE, await backupOf(careerWith({})));
      const write = writeFileMock.getMockImplementation();
      writeFileMock.mockImplementation((async (file: unknown, data: unknown) => {
        if (String(file).endsWith('state.json')) throw errno('ENOSPC');
        await write?.(file as never, data as never);
      }) as typeof writeFile);

      await expect(store.restore(BACKUP_FILE, false)).rejects.toThrow('ENOSPC');
      expect(files.size).toBe(0);
    });

    it('restores nothing from a backup holding no career that reads', async () => {
      const { store } = await build({ closed: true });
      const { files, zips } = folderDisk();
      zips.set(BACKUP_FILE, await backupOf(careerWith({}), { 'career.json': '{"version":2}' }));

      await expect(store.restore(BACKUP_FILE, false)).rejects.toMatchObject({ code: 'backup.notCareer' });
      expect(files.size).toBe(0);
    });
  });

  describe('flush', () => {
    it('writes a pending change straight away', async () => {
      const { store } = await build();
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      await store.flush();
      const written = lastWritten('state.json') as Career;

      expect(written.seasons[0].entries[0].series).toBe(CUP.id);
    });
  });
});
