import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  copyFile, readdir, readFile, rename, rm, unlink, writeFile,
} from 'node:fs/promises';

import {
  CAREER_ID, makeAvailability, makeCareer, makeChampionship, makeEntry, makeEvent, makeListing, makePlan, makeRound,
  makeSeason,
} from './fixtures.ts';
import { ContentSource } from '../../../shared/types/index.ts';
import type {
  Career, CareerSeason, LaunchRecord, NewCareerRequest, SeriesListing, SeriesRequirements, Settings,
} from '../../../shared/types/index.ts';
import { weekdayOf } from '../../../shared/utils/calendar-days/index.ts';
import {
  fakeContentStore, fakeRaceStore, fakeSeriesStore, fakeSettingsStore, raceSetup,
} from '../../__tests__/fakes/index.ts';
import type { FakeRaceStore, FakeSeriesStore } from '../../__tests__/fakes/index.ts';
import { createCareerStore } from '../career-store.ts';
import type { CareerStore } from '../career-store.ts';

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
   * Settings beyond the defaults. Historic events are off unless a test turns
   * them on, so a season holds only what the test entered.
   */
  settings?: Partial<Settings>;
  /**
   * A career already on disk, which the harness opens - or, absent, the one it
   * starts as New career would.
   */
  career?: Career;
  /**
   * Leaves every career closed, as the start screen does.
   */
  closed?: boolean;
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
};

/**
 * The championship most tests race: two rounds, one class at the bottom rung.
 */
const CUP = makeChampionship();

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
  if (options.career) readFileMock.mockResolvedValue(JSON.stringify(options.career));

  const series = fakeSeriesStore(options.listings ?? [makeListing(CUP)]);
  const historic = fakeSeriesStore(options.historic ?? []);
  const race = fakeRaceStore();
  const store = await createCareerStore(
    'D:\\userData',
    series,
    historic,
    race,
    fakeContentStore(),
    fakeSettingsStore({ historicFrequency: 'off', ...options.settings }),
  );
  if (options.career) await store.open(options.career.id);
  else if (!options.closed) await store.create(NEW_CAREER);

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
 * A record of one launch that has run.
 * @param index Which launch of the event
 * @returns The record
 */
const record = (index: number): LaunchRecord => ({
  index, completedAt: '2027-01-02T10:00:00.000Z', archive: `launch-${index}.json`, gridOrder: [], classification: null,
});

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

      expect((await store.list()).map((one) => one.driver.name)).toEqual(['Newer', 'Older']);
    });

    it('passes over a folder that is not named by a career id', async () => {
      onDisk([makeCareer()], [CAREER_ID, 'notes', '..']);
      const { store } = await build({ closed: true });

      expect((await store.list()).map((one) => one.id)).toEqual([CAREER_ID]);
    });

    it('leaves out a career it cannot read, or whose file names another career', async () => {
      onDisk([makeCareer({ id: OTHER_ID })], [CAREER_ID, OTHER_ID]);
      readFileMock.mockImplementation((async (file: unknown) => {
        if (String(file).includes(CAREER_ID)) return '{ not json';

        return JSON.stringify(makeCareer({ id: CAREER_ID }));
      }) as typeof readFile);
      const { store } = await build({ closed: true });

      expect(await store.list()).toEqual([]);
    });

    it('lists the career just started before it has been written', async () => {
      const { store } = await build();

      expect((await store.list()).map((one) => one.id)).toEqual([store.get()?.id]);
    });

    it('answers for the open career from memory, which is ahead of its file', async () => {
      const career = careerWith({});
      const { store } = await build({ career });
      await store.setDriver({ name: 'Renamed', nation: null });

      expect((await store.list())[0].driver.name).toBe('Renamed');
    });
  });

  describe('create', () => {
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
        settings: { historicFrequency: 'quarterly' },
      });
      historic.drawField = async () => { throw new Error('no field'); };

      await expect(store.create(NEW_CAREER)).rejects.toThrow('no field');
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
  });

  describe('open', () => {
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
      readFileMock.mockImplementation((async () => (
        String(writeFileMock.mock.calls.at(-1)?.[1] ?? JSON.stringify(career))
      )) as unknown as typeof readFile);
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      await store.open(career.id);

      expect(entryOf(store.get()).series).toBe(CUP.id);
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
      const written = JSON.parse(String(writeFileMock.mock.calls[0]?.[1])) as Career;
      expect(written).toMatchObject({ id: first.id, driver: { name: 'Renamed' } });
    });
  });

  describe('close', () => {
    it('writes the open career and leaves none open', async () => {
      const { store } = await build({ career: careerWith({}) });
      await store.setDriver({ name: 'Renamed', nation: null });
      writeFileMock.mockClear();
      await store.close();

      expect(store.get()).toBeNull();
      expect(JSON.parse(String(writeFileMock.mock.calls[0]?.[1]))).toMatchObject({ driver: { name: 'Renamed' } });
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
        settings: { historicFrequency: 'quarterly' },
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
        settings: { historicFrequency: 'quarterly' },
      });
      await store.calendar();
      const first = store.get()?.seasons[0].entries.map((one) => one.events[0].date);
      await store.calendar();

      expect(store.get()?.seasons[0].entries.map((one) => one.events[0].date)).toEqual(first);
    });

    it('draws a season it could not read the pool for on a later read', async () => {
      const { store, historic } = await build({
        historic: ['h1', 'h2', 'h3', 'h4'].map(historicListing),
        settings: { historicFrequency: 'quarterly' },
        closed: true,
      });
      historic.failList(new Error('install not located'));
      await store.create(NEW_CAREER);

      expect(store.get()?.seasons[0].historicDrawn).toBeFalsy();

      historic.failList(null);
      await store.calendar();

      expect(store.get()?.seasons[0].historicDrawn).toBe(true);
      expect(store.get()?.seasons[0].entries.filter((one) => one.historic)).toHaveLength(4);
    });

    it('leaves out a historic event switched off', async () => {
      const { store } = await build({
        historic: ['h1', 'h2'].map(historicListing),
        settings: { historicFrequency: 'quarterly', historicActive: { h1: false } },
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
    it("enters the class in the player's seat and dates every round of the edition", async () => {
      const { store } = await build();
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      const entry = entryOf(store.get());

      expect(entry).toMatchObject({ entry: 'main', playerSeat: 'seat-2', car: { model: 'test_car' } });
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

    it('tells everyone watching', async () => {
      const { store } = await build();
      const seen: (Career | null)[] = [];
      store.onChange((career) => seen.push(career));
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });

      expect(seen.at(-1)?.seasons[0].entries).toHaveLength(1);
    });
  });

  describe('withdraw', () => {
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

    it('closes the year on the way past New Year and opens the next one, drawn', async () => {
      const { store } = await build({
        career: entered('2027-12-20'),
        historic: ['h1', 'h2', 'h3', 'h4'].map(historicListing),
        settings: { historicFrequency: 'quarterly' },
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

  describe('event', () => {
    it('reads a round the career is in as entered, in its own seat', async () => {
      const career = careerWith({ entries: [makeEntry({ events: [makeEvent('one', '2027-03-07')] })] });
      const { store } = await build({ career });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view).toMatchObject({
        series: CUP.id, round: 'one', date: '2027-03-07', entered: { entry: 'main' }, historic: null,
      });
    });

    it('says a round of a championship the career is not in has to be entered first', async () => {
      const { store } = await build({ career: careerWith({}) });
      const view = await store.event({ series: CUP.id, round: 'one' });

      expect(view.entered).toBeNull();
      expect(view.blocked?.code).toBe('career.event.notEntered');
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

  describe('flush', () => {
    it('writes a pending change straight away', async () => {
      const { store } = await build();
      await store.enrol({ series: CUP.id, entry: 'main', car: { model: 'test_car' } });
      await store.flush();
      const written = JSON.parse(String(writeFileMock.mock.calls.at(-1)?.[1])) as Career;

      expect(written.seasons[0].entries[0].series).toBe(CUP.id);
    });
  });
});
