// The careers: a folder each under careers/, and the one open held in memory -
// one clock, the championships it has entered, and what came of them. Kept in
// two files in its folder, written atomically and debounced the way the
// settings store writes its own: career.json, what every save shares - who
// races it and how it is set up - and state.json, where it has got to, with its
// archived results beside them.
//
// A championship the career enters is copied into the season whole, and the
// season reads only that copy from then on - so the library's championship is a
// rulebook the career never touches, and an edit to it reaches the next season
// rather than the one being raced.
//
// Nothing is open when the app starts: the start screen opens a career, and
// going back to it closes one. Its saves are copies of state.json alone, kept in
// its saves folder, so loading one puts the career back where it was and
// leaves its profile as it is.

import {
  access, mkdir, readdir, readFile, rename, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  BACKUP_MANIFEST,
  CAREER_DIRS,
  CAREER_FILE,
  CAREER_ID_PATTERN,
  CAREER_RESULTS_DIR,
  CAREER_VERSION,
  REPLACED_SUFFIX,
  RESTORING_SUFFIX,
  STATE_FILE,
  WRITE_DEBOUNCE_MS,
} from './constants.ts';
import type {
  BackupContents, CareerStore, EnrolRequest, EnteredEvent, EventRequest, ResultsRequest,
} from './types.ts';
import {
  advanceSkips,
  advanceStop,
  archivesOf,
  backupName,
  checkedDriver,
  checkEdition,
  checkedNewCareer,
  checkedNewChampionship,
  checkedYear,
  closeSeason,
  composeCalendar,
  currentSeason,
  editionAt,
  enteredEntry,
  enteredEvent,
  eventName,
  eventSessions,
  eventStrength,
  heldRaceable,
  inProgressEvent,
  issueForecast,
  issueForecasts,
  keptInBackup,
  launchBlock,
  launchSkips,
  lostName,
  markMissed,
  materialiseEvents,
  openSeason,
  profileOf,
  readBackup,
  readProfile,
  readState,
  seasonOf,
  seasonSalt,
  simulatedEvent,
  skipCost,
  skippedRound,
  stateOf,
  strengthStep,
  summarise,
  winnerPrize,
  withSeason,
} from './utils.ts';
import {
  feeLine,
  feeOf,
  feeOwed,
  feePaid,
  openingLine,
  payOut,
  post,
  purchaseLine,
  rentLine,
  rentOwed,
  rentPaid,
  repaintLine,
  saleLine,
  speedLine,
} from '../../core/career-money/index.ts';
import { planEvent } from '../../core/event/index.ts';
import {
  historicSeat, historicSlots, planHistoric, withPlayerSeat,
} from '../../core/historic-draw/index.ts';
import { simulateRound } from '../../core/round-simulation/index.ts';
import { addDays, toDayNumber } from '../../core/season-calendar/index.ts';
import { scoreRound } from '../../core/season-scoring/index.ts';
import {
  climateOf, formatOf, roundSessions, runRaceId,
} from '../../core/series/index.ts';
import { offerForecast } from '../../core/weather-forecast/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  Career,
  CareerEventView,
  CareerKind,
  CareerListing,
  CareerProfile,
  CareerSaves,
  CareerSeason,
  CareerState,
  Championship,
  ClassEntry,
  EventPlan,
  RaceDefinition,
  RaceSetup,
  RoundCost,
  SaveMoment,
  SaveSummary,
  SeasonEntry,
  SeasonEvent,
  SeriesAvailability,
  SeriesLibrary,
  SeriesListing,
} from '../../shared/types/index.ts';
import { keptStep, withStrength } from '../../shared/utils/ai-figure/index.ts';
import { rentOf, repaintOf, resaleValue } from '../../shared/utils/car-prices/index.ts';
import { isEligible, levelsAt, ratingsAt } from '../../shared/utils/career-eligibility/index.ts';
import { careerDrivingAids, careerOpponents, readCareerSettings } from '../../shared/utils/career-settings/index.ts';
import { hiddenBySources } from '../../shared/utils/content-sources/index.ts';
import {
  editionEntry, editionsOf, enteredEdition, seasonYear,
} from '../../shared/utils/editions/index.ts';
import {
  liveryName, ownedCar, racingIn, roundUnderWay, withCarIn,
} from '../../shared/utils/garage/index.ts';
import { isHistoric } from '../../shared/utils/historic/index.ts';
import { nationName } from '../../shared/utils/nations/index.ts';
import { eligibleCarsIn, firstRaceable, roundRaceableIn } from '../../shared/utils/round-availability/index.ts';
import { isSeriesActive } from '../../shared/utils/series-toggles/index.ts';
import { buildStandings, entryResults, roundResult } from '../../shared/utils/standings/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
import { slotHolds, withLevelsOf } from '../race-store/index.ts';
import {
  autosaveSlot,
  checkedSaveName,
  listSaves,
  QUICK_SAVE_ID,
  readSave,
  removeSave,
  SAVE_VERSION,
  saveKindOf,
  SAVES_DIR,
  summaryOf,
  writeSave,
} from '../save-files/index.ts';
import type { SeriesStore } from '../series-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';
import { quarantine } from '../settings-store/index.ts';
import { packZip, unpackZip } from '../zip-archive/index.ts';
import type { ZipEntry } from '../zip-archive/index.ts';

export type {
  CareerStore, EnrolRequest, EventRequest, ResultsRequest, SaveRequest, StrengthRequest,
} from './types.ts';
// Re-exported because a quick race's page lists its sessions the way a
// round's page does.
export { eventSessions } from './utils.ts';

/**
 * The still-scheduled round a race id belongs to, in a season.
 * @param season The season to look in
 * @param raceId The race's id
 * @returns The entry and its event, or null when the race is no round of it
 */
const scheduledHeld = (season: CareerSeason, raceId: string): EnteredEvent | null => {
  for (const entry of season.entries) {
    const event = entry.events.find((one) => one.raceId === raceId && one.status === 'scheduled');
    if (event && !entry.withdrawn) return { entry, event };
  }

  return null;
};

/**
 * Returns a store over the careers on disk, none of them open yet.
 *
 * Takes the series store because a round is lowered through it - it holds the
 * weather offer and the class catalogue a race is drawn over - the historic
 * events' store, which a season draws its historic events from, the race store
 * because that is what runs an event, the content store because the event
 * page plans an event to say what each session is, and settings because they
 * say whether two events on one day clash.
 * @param userDataDir Folder to keep the careers' folders in
 * @param series The championship library
 * @param historic The historic event library
 * @param race The race being set up and run
 * @param content The installed content
 * @param settings The user's settings
 * @returns A store over the careers
 */
export const createCareerStore = async (
  userDataDir: string,
  series: SeriesStore,
  historic: SeriesStore,
  race: RaceStore,
  content: ContentStore,
  settings: SettingsStore,
): Promise<CareerStore> => {
  /**
   * The folder a kind of career is kept in.
   * @param kind The kind
   * @returns The folder's path
   */
  const rootOf = (kind: CareerKind): string => path.join(userDataDir, CAREER_DIRS[kind]);

  /**
   * The folder a career of a kind is kept in, whether it is there or not.
   * @param kind The career's kind
   * @param id The career's id
   * @returns The folder's path
   * @throws When the id is no career's, which is what keeps a crafted one from
   * naming any other folder
   */
  const folderIn = (kind: CareerKind, id: string): string => {
    if (!CAREER_ID_PATTERN.test(id)) throw new AppError('career.notFound');

    return path.join(rootOf(kind), id);
  };

  // The career open, and the folder it is kept in - both null on the start
  // screen.
  let current: Career | null = null;
  let dir: string | null = null;
  // Which kind each career found so far is: an id's folder never moves between
  // the two, so only whether it is still there is probed for again.
  const kinds = new Map<string, CareerKind>();

  /**
   * Which kind of career an id is, by the folder it is kept under.
   * @param id The career's id
   * @returns Its kind, or null when no folder holds it
   * @throws When the id is no career's
   */
  const kindOf = async (id: string): Promise<CareerKind | null> => {
    if (current?.id === id) return current.kind;
    const known = kinds.get(id);
    if (known && await access(folderIn(known, id)).then(() => true, () => false)) return known;
    kinds.delete(id);
    const all = Object.keys(CAREER_DIRS) as CareerKind[];
    const held = await Promise.all(all.map((kind) => access(folderIn(kind, id)).then(() => true, () => false)));
    const found = all.find((_, at) => held[at]) ?? null;
    if (found) kinds.set(id, found);

    return found;
  };

  /**
   * The folder a career is kept in, whichever kind it is - a career's own for
   * an id no folder holds, so reading it reports the career missing.
   * @param id The career's id
   * @returns The folder's path
   * @throws When the id is no career's
   */
  const folderFor = async (id: string): Promise<string> => (
    current?.id === id && dir ? dir : folderIn(await kindOf(id) ?? 'career', id)
  );

  /**
   * The folder a career's saves are kept in.
   * @param id The career's id
   * @returns The folder's path
   */
  const savesDirOf = async (id: string): Promise<string> => path.join(await folderFor(id), SAVES_DIR);

  const listeners = new Set<(career: Career | null) => void>();
  const saveListeners = new Set<(saves: CareerSaves) => void>();
  let timer: NodeJS.Timeout | null = null;
  let pending: Promise<void> = Promise.resolve();
  // Commands run one after another, the way the class store runs its edits.
  // Every one of them reads the career, awaits something - the library, the
  // installed content, an archived result - and then rebuilds it from what it
  // read, so two overlapping commands would each write over the other's work:
  // an event's score landing while a championship is being entered would lose
  // one or the other. Queued, each reads the career when its turn comes.
  let queue: Promise<unknown> = Promise.resolve();

  /**
   * Runs one command once every command before it has finished.
   * @param command The command, which reads the career as it then stands
   * @returns What the command answers with
   */
  const commit = <T>(command: () => Promise<T>): Promise<T> => {
    const run = queue.then(command);
    queue = run.catch(() => undefined);

    return run;
  };

  /**
   * Writes one of a career's files, replacing it in one step.
   * @param folder The career's folder
   * @param name The file's name
   * @param value What it holds
   * @returns Resolves once it is written
   */
  const writeJson = async (folder: string, name: string, value: unknown): Promise<void> => {
    const file = path.join(folder, name);
    const tmp = `${file}.tmp`;
    await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await rename(tmp, file);
  };

  /**
   * Writes the career: its state, then its profile.
   * @returns Resolves once both are written or the failure is logged
   */
  const write = async (): Promise<void> => {
    if (!current || !dir) return;

    const career = current;
    try {
      await mkdir(dir, { recursive: true });
      await writeJson(dir, STATE_FILE, stateOf(career));
      await writeJson(dir, CAREER_FILE, profileOf(career));
    } catch (error) {
      console.error('Could not save the career.', error);
    }
  };

  /**
   * Writes any change still waiting, at once.
   * @returns Resolves once nothing is left to write
   */
  const flushNow = async (): Promise<void> => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      pending = write();
    }
    await pending;
  };

  /**
   * Points the race store at a career's results, or back at its own.
   * @param career The career now open, or null for none
   * @throws When a launch is in flight
   */
  const scopeTo = (career: Career | null): void => {
    if (career === null) {
      race.scope(null, null);

      return;
    }
    const { id } = career;
    // Read when Results asks, by which time the career is the one open.
    race.scope(id, path.join(folderIn(career.kind, id), CAREER_RESULTS_DIR), () => (
      current?.id === id ? archivesOf(current) : null
    ));
  };

  /**
   * Reads one of a career's files.
   * @param file The file's path
   * @param read Reads what was parsed out of it
   * @returns What it holds, or null when it is not something this build reads
   * @throws The file system's error when the file cannot be read at all
   */
  const parseFile = async <T>(file: string, read: (value: unknown) => T | null): Promise<T | null> => {
    const text = await readFile(file, 'utf8');
    try {
      return read(JSON.parse(text));
    } catch {
      return null;
    }
  };

  /**
   * Sets a career's file that does not read aside, rather than leaving it to
   * be half-understood.
   * @param file The file
   * @returns Resolves once it is moved, or the failure is logged
   */
  const setAside = async (file: string): Promise<void> => {
    const moved = await quarantine(file);
    console.warn(`Career file was not one this build reads; ${moved ? `moved to ${moved}` : 'ignoring it'}.`);
  };

  /**
   * Reads a career's profile.
   * @param id The career's id
   * @returns The profile, or null when it is not one this build reads or names
   * another career
   * @throws The file system's error when the file cannot be read at all
   */
  const profileFrom = async (id: string): Promise<CareerProfile | null> => {
    const profile = await parseFile(path.join(await folderFor(id), CAREER_FILE), readProfile);

    // The folder it is kept under says what it is, whatever the file says, so
    // it is written back where it was read from.
    return profile?.id === id ? { ...profile, kind: await kindOf(id) ?? profile.kind } : null;
  };

  /**
   * Reads a career's state.
   * @param id The career's id
   * @returns The state, or null when it is not one this build reads
   * @throws The file system's error when the file cannot be read at all
   */
  const stateFrom = async (id: string): Promise<CareerState | null> => (
    parseFile(path.join(await folderFor(id), STATE_FILE), readState)
  );

  /**
   * The state of a career's newest save that reads, for a career whose
   * state.json does not.
   * @param id The career's id
   * @returns The state, or null when no save of it reads
   */
  const savedState = async (id: string): Promise<CareerState | null> => {
    // Listing reads every save through, so the newest listed is one that reads.
    const saves = await savesDirOf(id);
    const [newest] = await listSaves(saves, readState);
    const save = newest && await readSave(saves, newest.id, readState).catch(() => null);

    return save?.state ?? null;
  };

  /**
   * Reads one career's two files and joins them, its newest save standing in
   * for a state.json that does not read.
   * @param id The career's id
   * @returns The career, or null when its profile is not one this build reads
   * or names another career, or nothing of its state reads
   * @throws The file system's error when the profile cannot be read at all
   */
  const parseFrom = async (id: string): Promise<Career | null> => {
    const [profile, state] = await Promise.all([profileFrom(id), stateFrom(id).catch(() => null)]);
    if (!profile) return null;

    const recovered = state ?? await savedState(id);

    return recovered && { ...profile, ...recovered };
  };

  /**
   * Turns a career's file going missing into the career not being there.
   * @param error What reading it threw
   * @returns Never
   * @throws career.notFound for a missing file, else the error itself
   */
  const missingCareer = (error: unknown): never => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new AppError('career.notFound');
    throw error;
  };

  /**
   * Reads one career off disk.
   * @param id The career's id
   * @returns The career, carried on from its newest save when its state.json
   * is missing or does not read
   * @throws When there is no such career, or it is not one this build reads -
   * in which case the file that does not read is set aside rather than
   * half-understood
   */
  const readFrom = async (id: string): Promise<Career> => {
    const profile = await profileFrom(id).catch(missingCareer);
    if (!profile) {
      await setAside(path.join(await folderFor(id), CAREER_FILE));
      throw new AppError('career.unreadable');
    }
    // Undefined for a file that could not be read at all, null for one that
    // does not read as a state.
    const state = await stateFrom(id).catch(() => undefined);
    if (state) return { ...profile, ...state };
    if (state === null) await setAside(path.join(await folderFor(id), STATE_FILE));

    const saved = await savedState(id);
    if (!saved) throw new AppError('career.unreadable');
    console.warn(`Career ${id} had no state that reads; carrying on from its newest save.`);

    return { ...profile, ...saved };
  };

  /**
   * Makes a career the one open, once whatever the one open before still had to
   * write is written.
   * @param career The career
   * @returns Resolves once it is open
   * @throws When a launch is in flight, before anything has changed
   */
  const makeCurrent = async (career: Career): Promise<void> => {
    scopeTo(career);
    await flushNow();
    current = career;
    dir = folderIn(career.kind, career.id);
  };

  /**
   * Tells everyone watching a career's saves what they now are.
   * @param id The career's id
   * @param saves Its saves, newest first
   * @returns The saves
   */
  const announceSaves = (id: string, saves: SaveSummary[]): SaveSummary[] => {
    for (const listener of saveListeners) listener({ career: id, saves });

    return saves;
  };

  /**
   * Reads a career's saves and tells everyone watching them.
   * @param id The career's id
   * @returns Its saves, newest first
   */
  const pushSaves = async (id: string): Promise<SaveSummary[]> => (
    announceSaves(id, await listSaves(await savesDirOf(id), readState))
  );

  /**
   * Writes the career as it stands into one of its saves.
   * @param career The career
   * @param id The save's id
   * @param name The name the player gave it, or null
   * @param moment What an autosave was taken after, or null
   * @returns The save written
   */
  const writeSnapshot = async (
    career: Career,
    id: string,
    name: string | null,
    moment: SaveMoment | null,
  ): Promise<SaveSummary> => {
    const file = {
      version: SAVE_VERSION,
      id,
      kind: saveKindOf(id),
      name,
      savedAt: new Date().toISOString(),
      date: career.date,
      moment,
      state: stateOf(career),
    };
    await writeSave(await savesDirOf(career.id), file);

    return summaryOf(file);
  };

  /**
   * Autosaves the open career, the oldest autosave making room once as many are
   * kept as settings ask. A failure is logged rather than thrown: the command
   * that took the autosave has already done its work.
   * @param moment What it is taken after
   * @returns Resolves once written, or the failure is logged
   */
  const autosave = async (moment: SaveMoment): Promise<void> => {
    if (!current) return;

    const career = current;
    const saves = await savesDirOf(career.id);
    try {
      const before = await listSaves(saves, readState);
      const slot = autosaveSlot(before, settings.get().autosaves);
      const written = await writeSnapshot(career, slot.id, null, moment);
      await Promise.all(slot.drop.map((id) => removeSave(saves, id).catch(() => undefined)));
      // Worked out rather than read again: every save is a whole career.
      const gone = new Set([slot.id, ...slot.drop]);
      announceSaves(career.id, [written, ...before.filter((one) => !gone.has(one.id))]);
    } catch (error) {
      console.error('Could not autosave the career.', error);
    }
  };

  /**
   * Empties the race store's slot of the career's event when a save just loaded
   * holds that event at another point, or not at all. Left, the slot would carry
   * the event on from sessions the save never raced, and its next push would
   * copy them back onto the career.
   * @param career The career, with the state the save holds
   */
  const releaseSlot = (career: Career): void => {
    const slot = race.slot();
    if (slot?.owner !== career.id) return;

    const held = career.seasons
      .flatMap((season) => season.entries)
      .flatMap((entry) => entry.events)
      .find((event) => event.raceId === slot.raceId);
    // The same launches rather than as many: a timeline left and raced again
    // holds as many of other ones.
    const same = held?.sessions.length === slot.completed.length && held.sessions.every((launch, at) => (
      launch.completedAt === slot.completed[at].completedAt && launch.archive === slot.completed[at].archive
    ));
    if (!same) race.empty();
  };

  /**
   * Pays whatever the career is owed, schedules a write and tells everyone
   * watching.
   *
   * Every change ends here, so every prize lands as soon as anything has earned
   * it - a race recorded, an edition run out by the clock - whichever command
   * got it there.
   * @returns The career as it now stands
   */
  const settle = (): Career => {
    if (!current) throw new AppError('career.none');
    // Played is opened or changed, which every settle is one of.
    const career: Career = { ...payOut(current), playedAt: new Date().toISOString() };
    current = career;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      pending = write();
    }, WRITE_DEBOUNCE_MS);

    for (const listener of listeners) listener(career);

    return career;
  };

  /**
   * Draws a season's historic events onto its calendar, once.
   *
   * Over the historic events switched on that this install can race and the
   * content sources leave in, as often as settings ask - read now, which is
   * why a change reaches the next season rather than this one. The player is
   * invited to every one, in a seat the draw picks, so each is entered as it
   * is drawn. Nothing is placed before the day given, so a season drawn
   * part-way through dates nothing behind the clock.
   * @param career The career
   * @param season The season to draw
   * @param from The ISO date the draw places nothing before
   * @returns The season, drawn - or unchanged when it has been already, or
   * when the library cannot be read yet, so it is drawn on a later read
   */
  const drawHistoric = async (career: Career, season: CareerSeason, from: string): Promise<CareerSeason> => {
    if (season.historicDrawn) return season;

    const { historicActive, hiddenContentSources } = settings.get();
    const slots = historicSlots(season, career.settings.historicFrequency);
    if (slots.length === 0) return { ...season, historicDrawn: true };

    let library: SeriesLibrary;
    try {
      library = await historic.list();
    } catch (error) {
      // There is nothing to say what can be raced until the install is
      // located, and drawing over nothing would leave the season without.
      console.warn('Could not read the historic events to draw from.', error);

      return season;
    }

    const offered = library.series.filter((one) => (
      one.availability.available
      && isSeriesActive(one, { seriesActive: historicActive })
      && !hiddenBySources(one, hiddenContentSources)
    ));
    const salt = seasonSalt(career, season.index);
    const picks = planHistoric({
      slots,
      pool: offered.map((one) => one.series.id).sort(),
      busy: new Set(season.entries
        .filter((entry) => !entry.withdrawn)
        .flatMap((entry) => entry.events.filter((event) => event.status !== 'missed').map((event) => event.date))),
      from,
      salt,
    });

    const at = new Date().toISOString();
    const drawn: SeasonEntry[] = [];
    for (const pick of picks) {
      const listing = offered.find((one) => one.series.id === pick.id);
      const round = listing?.series.rounds[0];
      if (!listing || !round) continue;

      const eligible = new Map(listing.series.entries.map((entry) => [
        entry.id,
        eligibleCarsIn(listing.availability, round.id, entry.id),
      ]));
      const seat = historicSeat(listing.series, eligible, salt);
      if (!seat) continue;

      // A copy, as a championship entered is, with the seat the player was
      // invited to moved to where every lowering takes the player's from.
      const championship = withPlayerSeat(structuredClone(listing.series), seat.entry, seat.seat);
      drawn.push({
        series: championship.id,
        edition: 0,
        championship,
        entry: seat.entry,
        playerSeat: seat.seat,
        car: seat.car,
        field: await historic.drawField(championship, seat.entry, salt),
        events: [{
          round: round.id,
          raceId: runRaceId(championship.id, round.id, { season: season.index, edition: 0 }),
          date: pick.date,
          status: 'scheduled',
          sessions: [],
        }],
        standings: buildStandings(championship, [], at),
        historic: true,
      });
    }

    return { ...season, entries: [...season.entries, ...drawn], historicDrawn: true };
  };

  /**
   * Draws the current season's historic events when it has not yet, which is
   * how a career started before historic events existed, or before the install
   * was located, comes to have its own.
   * @returns Resolves once drawn, or at once when there was nothing to draw
   */
  const drawPending = async (): Promise<void> => {
    const season = current && currentSeason(current);
    if (!current || !season || season.historicDrawn) return;

    const drawn = await drawHistoric(current, season, current.date);
    if (drawn === season) return;

    current = withSeason(current, issueForecasts(current, drawn, current.date));
    settle();
  };

  /**
   * The open career.
   * @returns The career
   * @throws When none is open
   */
  const ensure = async (): Promise<Career> => {
    if (current) return current;

    throw new AppError('career.none');
  };

  /**
   * The season a command works on.
   * @returns The career and its current season
   * @throws When no career is open, or it somehow has no season, which nothing
   * can reach
   */
  const seasonNow = async (): Promise<{ career: Career; season: CareerSeason }> => {
    const career = await ensure();
    const season = currentSeason(career);
    if (!season) throw new AppError('career.season.notFound', { season: 0 });

    return { career, season };
  };

  /**
   * One round the career is in, or a refusal saying it is not.
   * @param season The season to look in
   * @param request Which championship and round, and which edition - the one
   * being raced when it names none
   * @returns The entry and its event
   * @throws When the career is not in that championship
   */
  const heldEvent = async (
    season: CareerSeason,
    request: Omit<EventRequest, 'season'>,
  ): Promise<EnteredEvent> => {
    const edition = request.edition ?? enteredEdition(season, request.series);
    const held = edition === null ? null : enteredEvent(season, request.series, request.round, edition);
    if (held) return held;

    const listing = await series.get(request.series);
    throw new AppError('career.event.notEntered', { series: listing?.series.name ?? request.series });
  };

  /**
   * The season and edition a read asks for, its defaults filled in: the current
   * season, and the edition the career is racing, or else the one still to come.
   * @param request Which championship, and the season and edition it names
   * @param request.series The championship's id
   * @param request.season Which season, when it names one
   * @param request.edition Which edition, when it names one
   * @returns The career, the season, the library's championship and the edition
   * @throws When no career is open, or it has no such season
   */
  const runAsked = async (request: { series: string; season?: number; edition?: number }) => {
    const career = await ensure();
    const season = seasonOf(career, request.season);
    if (!season) throw new AppError('career.season.notFound', { season: request.season ?? 0 });
    const listing = await series.get(request.series);
    const edition = request.edition
      ?? enteredEdition(season, request.series)
      ?? (listing ? editionAt(listing.series, season, career.date) : 0);

    return {
      career, season, listing, edition,
    };
  };

  /**
   * Lowers one of the career's rounds under the id its event carries.
   *
   * The id is the run's rather than the round's: the race store holds one event
   * at a time by it, and the event plan seeds a grid off it - so the page that
   * plans a round and the launch that races it lower it exactly alike.
   * @param championship The season's own copy of the championship
   * @param request What the round is lowered with
   * @param raceId The event's own race id
   * @param step The player's own steps on the AI's strength for the round
   * @returns The race the round runs as
   */
  const lowerEvent = async (
    championship: Championship,
    request: Parameters<SeriesStore['lowerRound']>[1],
    raceId: string,
    step: number,
  ): Promise<RaceDefinition> => {
    const lowered = await series.lowerRound(
      championship,
      request,
      step,
      careerOpponents(settings.get(), current?.settings ?? null),
    );
    // The career's own driver, rather than the default one settings names.
    const driver = current?.driver;
    const nation = driver?.nation ?? null;

    return {
      ...lowered,
      id: raceId,
      playerCar: {
        ...lowered.playerCar,
        ...(driver ? { driver: driver.name } : {}),
        ...(nation ? { nationCode: nation, nationality: nationName(nation) } : {}),
      },
    };
  };

  /**
   * Replaces one season entry, and the season around it, in the career.
   * @param season The season the entry belongs to
   * @param before The entry as it was
   * @param after The entry as it now is
   */
  const replaceEntry = (season: CareerSeason, before: SeasonEntry, after: SeasonEntry): void => {
    if (!current) throw new AppError('career.none');

    const next: CareerSeason = {
      ...season,
      entries: season.entries.map((one) => (one === before ? after : one)),
    };
    current = withSeason(current, next);
  };

  /**
   * An entry with one of its events replaced, and its standings rebuilt from
   * every round it has now scored.
   * @param entry The entry
   * @param event The event as it now is
   * @param at When, as an ISO timestamp
   * @returns The entry
   */
  const withEvent = (entry: SeasonEntry, event: SeasonEvent, at: string): SeasonEntry => {
    const events = entry.events.map((one) => (one.round === event.round ? event : one));
    const scores = events.map((one) => one.score).filter((one) => one !== undefined);

    return {
      ...entry,
      events,
      standings: buildStandings(entry.championship, scores, at),
    };
  };

  /**
   * Simulates every round the clock has passed without the player.
   *
   * A round entered too late, skipped, or given up on by withdrawing is raced
   * by the field all the same, with the player's seat driven by the driver it
   * names. Simulated once its day has come, and stored, so it never
   * changes again: a later edit to the championship or to settings cannot
   * rewrite a round that has been run. Whatever of an event the player did
   * drive before abandoning it stays as it was driven.
   * @param career The career
   * @returns The career, with every such round simulated
   */
  const simulateMissed = async (career: Career): Promise<Career> => {
    const at = new Date().toISOString();
    let next = career;

    for (const season of career.seasons) {
      const entries = await Promise.all(season.entries.map(async (entry) => {
        const salt = seasonSalt(career, season.index, entry.edition);
        const due = entry.events.filter((event) => (
          event.status === 'missed' && !event.simulated && event.date <= career.date
        ));
        let updated = entry;

        for (const event of due) {
          try {
            const simulated = simulateRound({
              series: entry.championship,
              round: event.round,
              salt,
              recordedAt: at,
              field: entry.field,
              player: { entry: entry.entry },
              completed: event.sessions,
              results: await race.launchResults(event.sessions),
            });
            updated = withEvent(updated, {
              ...event, sessions: simulated.sessions, score: simulated.score, simulated: true,
            }, at);
          } catch (error) {
            // Left as a plain non-start, which pays nobody anything - and marked
            // all the same, since the season's copy never changes and would only
            // fail again on every catch-up.
            console.warn(`Could not simulate ${entry.championship.name} - ${event.round}.`, error);
            updated = withEvent(updated, { ...event, simulated: true }, at);
          }
        }

        return updated;
      }));

      if (entries.some((entry, index) => entry !== season.entries[index])) {
        next = withSeason(next, { ...season, entries });
      }
    }

    return next;
  };

  /**
   * Brings the career's missed rounds up to date, after anything that can have
   * passed or given one up.
   */
  const catchUp = async (): Promise<void> => {
    if (current) current = await simulateMissed(current);
  };

  /**
   * Copies an event's progress onto the career after every launch.
   *
   * Every launch rather than only the last, so a practice or qualifying result
   * is on the event the moment it lands, and a race's points reach the
   * standings before the event is over. Idempotent, and that is load-bearing
   * rather than tidy: the race store pushes its whole state on every change, so
   * the same progress arrives here again and again, and is only acted on when it
   * holds more than the career already does.
   * @param setup The race store's state, which carries the plan and the run
   * @returns Resolves once recorded, or immediately when there is nothing new
   */
  const adopt = async (setup: RaceSetup): Promise<void> => {
    const { plan, state } = setup;
    if (!current || !plan || !state) return;
    if (setup.status.phase !== 'idle') return;
    // Two careers can race a round under the same id, so only an event this
    // career put in the slot is its own.
    if (setup.owner !== current.id) return;

    const season = currentSeason(current);
    const held = season && scheduledHeld(season, plan.raceId);
    if (!season || !held) return;
    if (state.completed.length <= held.event.sessions.length) return;

    const at = new Date().toISOString();
    const score = scoreRound(
      held.entry.championship,
      held.event.round,
      plan,
      state,
      await race.launchResults(state.completed),
      at,
    );
    const finished = state.completed.length >= state.launchCount;

    const event: SeasonEvent = {
      ...held.event,
      sessions: [...state.completed],
      score,
      status: finished ? 'raced' : 'scheduled',
    };
    replaceEntry(season, held.entry, withEvent(held.entry, event, at));

    // The clock never runs backwards, so an event raced early leaves it where
    // it was rather than pulling it back to the event's day.
    if (finished && current.date < event.date) {
      current = { ...current, date: event.date };
      // Finishing one event can bring the next inside the forecast lead, and
      // take the clock past the race day of a round given up on.
      const now = currentSeason(current);
      if (now) current = withSeason(current, issueForecasts(current, now, current.date));
      await catchUp();
    }
    settle();

    const landed = plan.launches[state.completed[state.completed.length - 1]?.index ?? -1];
    const round = held.entry.championship.rounds.find((one) => one.id === held.event.round);
    if (landed) {
      await autosave({
        kind: 'session',
        seriesName: held.entry.championship.name,
        roundName: round?.name ?? held.event.round,
        session: { name: landed.session.name ?? null, type: landed.session.type },
      });
    }
  };

  race.onChange((setup) => {
    // Queued with the commands rather than run alongside them: adopting reads
    // archives off disk before it writes, and a championship entered meanwhile
    // would be thrown away by whichever of the two rebuilt the career second.
    void commit(() => adopt(setup)).catch((error: unknown) => {
      console.error('Could not record the event against the career.', error);
    });
  });

  /**
   * What the install can race of each championship the season has entered.
   * @param season The season
   * @returns One availability per entry, of its own copy of the championship
   */
  const enteredAvailability = async (
    season: CareerSeason,
  ): Promise<Map<SeasonEntry, SeriesAvailability>> => new Map(await Promise.all(
    season.entries.map(async (entry): Promise<[SeasonEntry, SeriesAvailability]> => (
      [entry, await series.validate(entry.championship)]
    )),
  ));

  /**
   * Every file of a career's folder a backup holds, by its path in the folder.
   * @param id The career's id
   * @returns The files
   */
  const folderEntries = async (id: string): Promise<ZipEntry[]> => {
    const folder = await folderFor(id);
    const inside = async (sub: string): Promise<string[]> => (
      (await readdir(path.join(folder, sub)).catch(() => [] as string[])).map((name) => `${sub}/${name}`)
    );
    const names = [CAREER_FILE, STATE_FILE, ...await inside(SAVES_DIR), ...await inside(CAREER_RESULTS_DIR)]
      .filter(keptInBackup);
    const read = await Promise.all(names.map(async (name): Promise<ZipEntry | null> => {
      try {
        return { name, data: await readFile(path.join(folder, ...name.split('/'))) };
      } catch (error) {
        // A career with no state.json yet is backed up without one.
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    }));

    return read.filter((entry) => entry !== null);
  };

  /**
   * Reads a backup off disk.
   * @param file The zip
   * @returns What it holds
   * @throws When it is not a zip, or holds no career that reads
   */
  const backupFrom = async (file: string): Promise<BackupContents> => {
    const contents = readBackup(await unpackZip(await readFile(file)));
    if (!contents) throw new AppError('backup.notCareer');

    return contents;
  };

  /**
   * Whether a folder is kept for a career, of either kind.
   * @param id The career's id, which may be no career's at all
   * @returns Whether it is there
   */
  const isHere = async (id: string): Promise<boolean> => (
    CAREER_ID_PATTERN.test(id) && await kindOf(id) !== null
  );

  /**
   * The championship and class a career asks to race, as the library holds
   * them.
   * @param seriesId The championship's id
   * @param entryId The class entry's id
   * @returns The championship's listing and the class
   * @throws When there is no such championship or class, or the championship
   * cannot be raced
   */
  const raceableEntry = async (
    seriesId: string,
    entryId: string,
  ): Promise<{ listing: SeriesListing; entry: ClassEntry }> => {
    const listing = await series.get(seriesId);
    if (!listing) throw new AppError('series.notFound', { series: seriesId });
    const entry = listing.series.entries.find((one) => one.id === entryId);
    if (!entry) throw new AppError('series.entry.unknown', { entry: entryId });
    if (!listing.availability.available) {
      throw new AppError('career.series.unavailable', { series: listing.series.name });
    }

    return { listing, entry };
  };

  /**
   * An edition of a championship as a career enters it, its rounds dated from
   * the career's clock.
   * @param career The career
   * @param season The season it is entered in
   * @param listing The championship
   * @param entry The class
   * @param edition Which of the season's editions
   * @param car The car it is raced in
   * @returns The season's entry
   */
  const entering = async (
    career: Career,
    season: CareerSeason,
    listing: SeriesListing,
    entry: ClassEntry,
    edition: number,
    car: SeasonEntry['car'],
  ): Promise<SeasonEntry> => {
    // A copy, and a deep one: the season must not change when the library's
    // own object does.
    const championship = structuredClone(listing.series);

    return {
      series: championship.id,
      edition,
      championship,
      entry: entry.id,
      // The last seat of the class, which is the one roundRace gives up.
      playerSeat: entry.seats[entry.seats.length - 1]?.id ?? '',
      car,
      // Salted like the forecasts, so two careers, two seasons and two
      // editions of one championship field different drivers.
      field: await series.drawField(championship, entry.id, seasonSalt(career, season.index, edition)),
      events: materialiseEvents(championship, season, edition, career.date),
      standings: buildStandings(championship, [], new Date().toISOString()),
    };
  };

  /**
   * What a round of an entry's car costs to rent, whether or not it is rented.
   * @param entry The season's entry
   * @returns The rent, zero for a car the install no longer has
   */
  const rentFor = async (entry: SeasonEntry): Promise<number> => rentOf(await content.price(entry.car.model) ?? 0);

  /**
   * What a round still owes before its next session launches: its entry fee,
   * and its rent when the car is rented - each only until it is paid.
   * @param career The career
   * @param held The entry and the round
   * @returns The fee and the rent owed, each zero for nothing, and what a
   * round of the car rents for, paid or not - null for a car not rented
   */
  const owedFor = async (
    career: Career,
    held: EnteredEvent,
  ): Promise<{ fee: number; rent: number; roundRent: number | null }> => {
    // Priced only when rented, which spares every other car the lookup.
    const roundRent = held.entry.car.source === 'rented' ? await rentFor(held.entry) : null;

    return {
      fee: feeOwed(career, held.entry, held.event),
      rent: roundRent === null ? 0 : rentOwed(career, held.entry, held.event, roundRent),
      roundRent,
    };
  };

  /**
   * The car a garage command is about, and the career and season it is made in.
   * @param model The car's folder ID
   * @returns The career, its season and the car as the garage holds it - null
   * when it is not owned
   * @throws When the career is a standalone championship, which has no money
   */
  const garageNow = async (model: string) => {
    const { career, season } = await seasonNow();
    if (career.kind === 'championship') throw new AppError('standalone.garage');

    return { career, season, owned: ownedCar(career, model) };
  };

  /**
   * A car's name and its liveries' names, off the install.
   * @param model The car's folder ID
   * @returns What to call it, and a livery by its skin ID
   */
  const namesOf = async (model: string) => {
    const car = await content.car(model, true);

    return {
      car,
      name: car?.name ?? model,
      livery: (skin: string | undefined): string | undefined => liveryName(car, skin),
    };
  };

  /**
   * One career as the Careers list shows it, whether it reads or not.
   * @param id The career's id, whose folder is there
   * @returns Its listing
   */
  const listingOf = async (id: string): Promise<CareerListing> => {
    // The open one is read from memory, which is ahead of its file.
    if (current?.id === id) return summarise(current);

    try {
      const career = await parseFrom(id);
      if (career) return summarise(career);
      console.warn(`Career ${id} is not one this build reads; listing it as unreadable.`);
    } catch (error) {
      console.warn(`Could not read career ${id}; listing it as unreadable.`, error);
    }
    // Never left out, or it could not be deleted from the app.
    const profile = await profileFrom(id).catch(() => null);

    return {
      id, unreadable: true, driver: profile?.driver ?? null, playedAt: profile?.playedAt ?? null,
    };
  };

  /**
   * Every career of one kind on disk, played most recently first.
   * @param kind Careers, or standalone championships
   * @returns Their summaries
   */
  const list = async (kind: CareerKind): Promise<CareerListing[]> => {
    const names = (await readdir(rootOf(kind)).catch(() => [] as string[]))
      .filter((name) => CAREER_ID_PATTERN.test(name));
    names.forEach((name) => kinds.set(name, kind));
    const read = await Promise.all(names.map(listingOf));
    // One just started may not be written yet.
    if (current?.kind === kind && !names.includes(current.id)) read.push(summarise(current));

    // One whose career.json does not read either has no time to sort by, so goes last.
    return read.sort((left, right) => (right.playedAt ?? '').localeCompare(left.playedAt ?? ''));
  };

  return {
    get: () => current,

    list,

    create: (request) => commit(async () => {
      const {
        driver, year, level, money, settings: own,
      } = checkedNewCareer(request);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const startDate = `${year}-01-01`;
      const started: Career = {
        version: CAREER_VERSION,
        id,
        kind: 'career',
        createdAt: now,
        playedAt: now,
        driver,
        money,
        ledger: [openingLine(startDate, money)],
        garage: [],
        rating: ratingsAt(level),
        startDate,
        settings: readCareerSettings(own),
        date: startDate,
        level: levelsAt(level),
        seasons: [openSeason(0, startDate)],
      };

      // Drawn before anything changes, so a draw that fails leaves the career
      // open before as it was.
      const first = currentSeason(started);
      const ready = first
        ? withSeason(started, issueForecasts(started, await drawHistoric(started, first, startDate), startDate))
        : started;
      await makeCurrent(ready);
      const made = settle();
      // Its first season opening, so even a career that never races has a save
      // to carry on from should its state.json not read.
      await autosave({ kind: 'season', year });

      return made;
    }),

    createChampionship: (request) => commit(async () => {
      const { driver, year, car } = checkedNewChampionship(request);
      const { listing, entry } = await raceableEntry(request.series, request.entry);
      // The cars New championship offered: the class's at the first round the
      // install can race.
      const first = firstRaceable(listing);
      if (!first || !eligibleCarsIn(listing.availability, first, entry.id).includes(car.model)) {
        throw new AppError('standalone.car', { car: car.model, entry: entry.name });
      }

      const now = new Date().toISOString();
      const startDate = `${year}-01-01`;
      // Nothing is drawn onto its calendar but the championship itself.
      const season: CareerSeason = { ...openSeason(0, startDate), historicDrawn: true };
      // On the top rung everywhere, so any of its classes may be raced: there
      // is no ladder to climb, and no money or rating to spend.
      const base: Career = {
        version: CAREER_VERSION,
        id: crypto.randomUUID(),
        kind: 'championship',
        createdAt: now,
        playedAt: now,
        driver,
        money: 0,
        ledger: [],
        garage: [],
        rating: ratingsAt(1),
        startDate,
        settings: readCareerSettings(undefined),
        date: startDate,
        level: levelsAt(1),
        seasons: [season],
      };
      const enrolled = await entering(base, season, listing, entry, 0, car);

      await makeCurrent(withSeason(base, issueForecasts(base, { ...season, entries: [enrolled] }, startDate)));
      const made = settle();
      await autosave({ kind: 'season', year });

      return made;
    }),

    async preview(seriesId, year) {
      const listing = await series.get(seriesId);
      if (!listing) throw new AppError('series.notFound', { series: seriesId });
      const season = openSeason(0, `${checkedYear(year)}-01-01`);

      return {
        year,
        events: materialiseEvents(listing.series, season, 0, season.startDate)
          .map((event) => ({ round: event.round, date: event.date })),
      };
    },

    open: (id) => commit(async () => {
      // Written first, so reopening the career open reads what it holds now.
      await flushNow();
      await makeCurrent(await readFrom(id));
      // One whose clock passed rounds it had given up on while this build was
      // not running is brought up to date as it opens.
      await catchUp();

      return settle();
    }),

    close: () => commit(async () => {
      scopeTo(null);
      await flushNow();
      current = null;
      dir = null;
      for (const listener of listeners) listener(null);
    }),

    remove: (id) => commit(async () => {
      if (current?.id === id) throw new AppError('career.open');

      const kind = await kindOf(id);
      if (!kind) throw new AppError('career.notFound');
      // Probed afresh should the folder outlive a failed delete.
      kinds.delete(id);
      try {
        await rm(folderIn(kind, id), { recursive: true });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new AppError('career.notFound');
        throw error;
      }

      return list(kind);
    }),

    folderOf: folderFor,

    backupName: async (id) => {
      const career = current?.id === id ? current : await parseFrom(id).catch(missingCareer);
      if (!career) throw new AppError('career.unreadable');

      return backupName(summarise(career));
    },

    backup: (id, file) => commit(async () => {
      if (current?.id === id) await flushNow();
      const entries = await folderEntries(id);
      const contents = readBackup(entries);
      if (!contents) throw new AppError(entries.length === 0 ? 'career.notFound' : 'career.unreadable');

      const manifest = { version: CAREER_VERSION, kind: contents.profile.kind, backedUpAt: new Date().toISOString() };
      await writeFile(file, await packZip([
        { name: BACKUP_MANIFEST, data: Buffer.from(JSON.stringify(manifest, null, 2)) },
        ...entries,
      ]));

      return { file, saves: contents.saves, results: contents.results };
    }),

    readBackup: async (file, kind) => {
      const contents = await backupFrom(file);
      // Restored from the list it would come back to, or the player would be
      // left looking for it in the other one.
      if (contents.profile.kind !== kind) {
        throw new AppError(contents.profile.kind === 'championship' ? 'backup.isChampionship' : 'backup.isCareer');
      }
      const { id } = contents.profile;
      const here = await isHere(id) ? await listingOf(id) : null;

      return {
        file,
        career: summarise({ ...contents.profile, ...contents.state }),
        saves: contents.saves,
        results: contents.results,
        backedUpAt: contents.backedUpAt,
        here,
      };
    },

    restore: (file, replace) => commit(async () => {
      const contents = await backupFrom(file);
      const own = contents.profile.id;
      const here = await isHere(own);
      // Beside the copy here, or from a backup whose id no folder could be
      // named after, it comes back as a career of its own.
      const id = CAREER_ID_PATTERN.test(own) && !(here && !replace) ? own : crypto.randomUUID();
      const replacing = here && id === own;
      if (replacing && current?.id === id) throw new AppError('career.open');

      const career: Career = { ...contents.profile, ...contents.state, id };
      const target = folderIn(career.kind, id);
      // Written whole beside the careers first, so a restore that fails part
      // of the way leaves the career here as it was.
      const staging = `${target}${RESTORING_SUFFIX}`;
      const aside = `${target}${REPLACED_SUFFIX}`;
      await rm(staging, { recursive: true, force: true });
      try {
        await Promise.all(contents.files.map(async (entry) => {
          const to = path.join(staging, ...entry.name.split('/'));
          await mkdir(path.dirname(to), { recursive: true });
          // Written afresh, since a career of its own names its new id.
          await writeFile(to, entry.name === CAREER_FILE ? JSON.stringify(profileOf(career), null, 2) : entry.data);
        }));
        if (replacing) {
          await rm(aside, { recursive: true, force: true });
          await rename(target, aside);
          try {
            await rename(staging, target);
          } catch (error) {
            // Put back, or the career would sit where the list never looks.
            await rename(aside, target);
            throw error;
          }
        } else {
          await rename(staging, target);
        }
      } catch (error) {
        await rm(staging, { recursive: true, force: true }).catch(() => undefined);
        throw error;
      }

      if (replacing) {
        await rm(aside, { recursive: true, force: true });
        // The race slot may hold an event of the career it replaced, and a
        // page showing its saves still shows the old ones.
        releaseSlot(career);
        await pushSaves(id);
      }

      return { id, careers: await list(career.kind) };
    }),

    setDriver: (driver) => commit(async () => {
      const career = await ensure();
      current = { ...career, driver: checkedDriver(driver) };

      return settle();
    }),

    setSettings: (patch) => commit(async () => {
      const career = await ensure();
      // Merged and read back the tolerant way, as a patch to settings.json is.
      const next = readCareerSettings({ ...career.settings, ...patch });
      // A change of speed is written down, so a run played at more than one
      // says so. Only a career has money for it to change.
      const noted = career.kind === 'career' && next.progression !== career.settings.progression
        ? post(career, [speedLine(career, next.progression)])
        : career;
      current = { ...noted, settings: next };

      return settle();
    }),

    saves: async (id) => listSaves(await savesDirOf(id), readState),

    save: ({ name, over }) => commit(async () => {
      const career = await ensure();
      const named = checkedSaveName(name);
      if (over !== undefined) {
        if (saveKindOf(over) !== 'named') throw new AppError('save.protected');
        const saves = await listSaves(await savesDirOf(career.id), readState);
        if (!saves.some((one) => one.id === over)) throw new AppError('save.notFound');
      }
      await writeSnapshot(career, over ?? crypto.randomUUID(), named, null);

      return pushSaves(career.id);
    }),

    quickSave: () => commit(async () => {
      const career = await ensure();
      await writeSnapshot(career, QUICK_SAVE_ID, null, null);

      return pushSaves(career.id);
    }),

    load: (id, save) => commit(async () => {
      const saved = await readSave(await savesDirOf(id), save, readState);
      await flushNow();
      // The profile alone: the state is the save's.
      const profile = current?.id === id ? profileOf(current) : await profileFrom(id).catch(missingCareer);
      if (!profile) throw new AppError('career.unreadable');
      // Only the state is the save's: who races the career stays as it is.
      const career: Career = { ...profile, ...saved.state };
      await makeCurrent(career);
      releaseSlot(career);
      await catchUp();

      return { career: settle(), save: summaryOf(saved) };
    }),

    renameSave: (id, save, name) => commit(async () => {
      if (saveKindOf(save) !== 'named') throw new AppError('save.protected');
      const saves = await savesDirOf(id);
      const saved = await readSave(saves, save, readState);
      // Renaming is not saving, so it keeps when the save was taken.
      await writeSave(saves, { ...saved, name: checkedSaveName(name) });

      return pushSaves(id);
    }),

    deleteSave: (id, save) => commit(async () => {
      if (saveKindOf(save) !== 'named') throw new AppError('save.protected');
      await removeSave(await savesDirOf(id), save);

      return pushSaves(id);
    }),

    savesFolderOf: async (id) => {
      const saves = await savesDirOf(id);
      // Never a folder for a career that is not there, which list would trip over.
      await access(await folderFor(id)).catch(missingCareer);
      await mkdir(saves, { recursive: true });

      return saves;
    },

    async calendar(index) {
      const loaded = await ensure();
      // Queued, since it can write: a season not drawn yet is drawn on read. A
      // season drawn already reads straight through, as calendar reads do.
      if (!currentSeason(loaded)?.historicDrawn) await commit(drawPending);
      const career = await ensure();
      const at = index ?? (currentSeason(career)?.index ?? 0);
      const held = career.seasons.find((one) => one.index === at);
      if (!held) throw new AppError('career.season.notFound', { season: at });

      const library = await series.list();

      return composeCalendar(
        career,
        held,
        library.series,
        await enteredAvailability(held),
        career.settings.allowSameDayEvents,
      );
    },

    enrol: (request: EnrolRequest) => commit(async () => {
      const { career, season } = await seasonNow();
      if (career.kind === 'championship') throw new AppError('standalone.enter');

      const { listing, entry } = await raceableEntry(request.series, request.entry);
      if (!isEligible(entry.ladder, career.level)) {
        throw new AppError('career.entry.ineligible', { entry: entry.name });
      }
      const edition = request.edition ?? editionAt(listing.series, season, career.date);
      checkEdition(listing.series, edition);
      if (enteredEntry(season, request.series, edition)) {
        throw new AppError('career.entry.enrolled', { entry: listing.series.name });
      }

      // Every round already behind the clock would be a season raced entirely
      // without the player.
      const events = materialiseEvents(listing.series, season, edition, career.date);
      const opener = events.find((one) => one.status !== 'missed');
      if (!opener) throw new AppError('career.edition.over', { series: listing.series.name });

      // The cars the Enter panel offered: the class's at the round it starts at.
      const { model } = request.car;
      if (!eligibleCarsIn(listing.availability, opener.round, entry.id).includes(model)) {
        throw new AppError('career.car.ineligible', { car: (await namesOf(model)).name, entry: entry.name });
      }
      // A car in the garage races owned, in the garage's livery; any other is
      // rented, in whichever livery was picked.
      const owned = ownedCar(career, model);
      const car: SeasonEntry['car'] = owned
        ? { model, ...(owned.skin === undefined ? {} : { skin: owned.skin }), source: 'owned' }
        : { ...request.car, source: 'rented' };
      const enrolled = await entering(career, season, listing, entry, edition, car);

      // Entering a championship whose opener is this week forecasts it at once,
      // rather than leaving it blank until the clock next happens to move.
      current = withSeason(career, issueForecasts(
        career,
        { ...season, entries: [...season.entries, enrolled] },
        career.date,
      ));
      // The rounds already behind the clock happened without the player.
      await catchUp();

      return settle();
    }),

    buyCar: ({ model, skin }) => commit(async () => {
      const { career, season, owned } = await garageNow(model);
      const names = await namesOf(model);
      if (owned) throw new AppError('career.car.owned', { car: names.name });
      // Bought from the library alone, which is what the Store sells.
      const price = await content.car(model) ? await content.price(model) : null;
      if (price === null || !names.car) throw new AppError('career.car.unknown', { car: model });
      if (skin !== undefined && !names.car.skins.some((one) => one.id === skin)) {
        throw new AppError('career.car.livery', { car: names.name, livery: skin });
      }
      if (price > career.money) throw new AppError('career.car.short', { price, money: career.money });

      const livery = skin ?? names.car.skins[0]?.id;
      const painted = livery === undefined ? {} : { skin: livery };
      const paid = post(career, [purchaseLine(career, model, names.name, names.livery(livery), price)]);
      // A car being rented is the player's own from its next round, in the
      // livery bought - the round already paid for keeps its rent.
      current = withSeason(
        { ...paid, garage: [...career.garage, { model, ...painted, paid: price, bought: career.date }] },
        withCarIn(season, racingIn(season, model, 'rented'), { model, ...painted, source: 'owned' }),
      );

      return settle();
    }),

    sellCar: (model) => commit(async () => {
      const { career, season, owned } = await garageNow(model);
      const { name } = await namesOf(model);
      if (!owned) throw new AppError('career.car.notOwned', { car: name });
      // A round part-way through is raced in the car it started in.
      const racing = racingIn(season, model, 'owned');
      const busy = roundUnderWay(racing);
      if (busy) throw new AppError('career.car.racing', { car: name, event: eventName(busy) });

      const value = resaleValue(owned.paid, owned.bought, career.date);
      const sold = post(career, [saleLine(career, owned, name, value)]);
      // Whatever still races it races the rest of its rounds rented, in the
      // livery it wears.
      const painted = owned.skin === undefined ? {} : { skin: owned.skin };
      current = withSeason(
        { ...sold, garage: career.garage.filter((one) => one !== owned) },
        withCarIn(season, racing, { model, ...painted, source: 'rented' }),
      );

      return settle();
    }),

    repaintCar: ({ model, skin }) => commit(async () => {
      const { career, season, owned } = await garageNow(model);
      const names = await namesOf(model);
      if (!owned) throw new AppError('career.car.notOwned', { car: names.name });
      if (skin === owned.skin) throw new AppError('career.car.sameLivery', { car: names.name });
      if (!names.car?.skins.some((one) => one.id === skin)) {
        throw new AppError('career.car.livery', { car: names.name, livery: skin });
      }
      // Priced off what was paid for it, as its sale is, so a price changed
      // since in settings never reaches a car already bought.
      const cost = repaintOf(owned.paid);
      if (cost > career.money) throw new AppError('career.car.short', { price: cost, money: career.money });

      const painted = post(career, [
        repaintLine(career, model, names.name, names.livery(owned.skin), names.livery(skin), cost),
      ]);
      // At once, for every round still to come.
      current = withSeason(
        { ...painted, garage: career.garage.map((one) => (one === owned ? { ...one, skin } : one)) },
        withCarIn(season, racingIn(season, model, 'owned'), { model, skin, source: 'owned' }),
      );

      return settle();
    }),

    withdraw: (request) => commit(async () => {
      const { career, season } = await seasonNow();
      if (career.kind === 'championship') throw new AppError('standalone.withdraw');
      // The edition named, or else the earliest of this class's still running.
      const held = season.entries
        .filter((one) => (
          one.series === request.series
          && one.entry === request.entry
          && !one.withdrawn
          && (request.edition === undefined
            ? one.events.some((event) => event.status === 'scheduled')
            : one.edition === request.edition)
        ))
        .sort((left, right) => left.edition - right.edition)[0];
      if (!held) throw new AppError('career.entry.notEnrolled', { entry: request.entry });
      // A session out at the game would land on a round already given up.
      const progress = race.progress();
      if (progress?.inFlight && held.events.some((event) => event.raceId === progress.raceId)) {
        throw new AppError('run.inFlight');
      }
      // Declining is turning an invitation down, which an event already begun
      // is past.
      if (isHistoric(held) && held.events.some((event) => event.sessions.length > 0)) {
        throw new AppError('historic.started', { event: held.championship.name });
      }

      replaceEntry(season, held, {
        ...held,
        withdrawn: true,
        // Everything still to come becomes a non-start. What was already raced
        // stays exactly as it was: those rounds happened.
        events: held.events.map((event) => (
          event.status === 'scheduled' ? { ...event, status: 'missed' as const } : event
        )),
      });
      // Only what is already behind the clock; the rest is simulated as it comes.
      await catchUp();

      return settle();
    }),

    strength: (request) => commit(async () => {
      const { season } = await seasonNow();
      const step = keptStep(request.strength);
      const edition = request.edition ?? enteredEdition(season, request.series);
      const entry = edition === null ? null : enteredEntry(season, request.series, edition);
      if (!entry) {
        const listing = await series.get(request.series);
        throw new AppError('career.event.notEntered', { series: listing?.series.name ?? request.series });
      }

      if (request.round === undefined) {
        replaceEntry(season, entry, withStrength(entry, step));

        return settle();
      }

      const event = entry.events.find((one) => one.round === request.round);
      if (!event) {
        throw new AppError('career.event.notFound', { series: entry.championship.name, round: request.round });
      }
      // A round already run keeps what it raced at, which its sessions record.
      if (event.status !== 'scheduled') {
        const round = entry.championship.rounds.find((one) => one.id === event.round);
        throw new AppError('career.event.closed', { round: round?.name ?? event.round });
      }

      replaceEntry(season, entry, {
        ...entry,
        events: entry.events.map((one) => (one === event ? withStrength(one, step) : one)),
      });

      return settle();
    }),

    advanceTo: (date: string, skip = false) => commit(async () => {
      const { career, season } = await seasonNow();
      // Racing or skipping a round moves its clock; nothing else does, so its
      // one season never closes under it.
      if (career.kind === 'championship') throw new AppError('standalone.clock');
      if (toDayNumber(date) < toDayNumber(career.date)) {
        throw new AppError('career.date.backwards', { date, from: career.date });
      }
      // A session out at the game is being raced for a round the move could give
      // up, or close the season under, and its result would then land nowhere.
      if (race.progress()?.inFlight) throw new AppError('run.inFlight');
      // Moving on would turn the rest of an event already begun into a
      // non-start, which is not something to do on the way past - unless the
      // player was shown that and confirmed it.
      const busy = inProgressEvent(season);
      if (busy && !skip) throw new AppError('career.event.inProgress', { event: eventName(busy) });

      let working = career;
      let year = season;
      // Confirmed, the clock goes all the way; otherwise it stops at the first
      // event of the career's on the way rather than pass it unasked.
      let stop = skip ? date : advanceStop(year, working.date, date);
      // An event on the clock's own day is no stop, so moving on unconfirmed
      // would still lose it - and nothing is lost unasked.
      const unasked = skip ? undefined : advanceSkips(year, stop)[0];
      if (unasked) throw new AppError('career.event.earlierPending', { event: lostName(unasked) });

      // A move past 31 December closes the year on the way: whatever of it was
      // still to run is given up and raced by the field, and the next opens empty.
      while (stop > year.endDate) {
        working = await simulateMissed(closeSeason(working, year));
        const opened = openSeason(year.index + 1, addDays(year.endDate, 1));
        working = { ...working, date: opened.startDate, seasons: [...working.seasons, opened] };
        // A confirmed move draws nothing before where it lands, since nothing
        // drawn on the way was shown to the player as given up.
        year = await drawHistoric(working, opened, skip && date > opened.startDate ? date : opened.startDate);
        working = withSeason(working, year);
        stop = skip ? date : advanceStop(year, working.date, date);
      }

      // An enrolled event the clock has gone right past was never raced.
      const next = issueForecasts(working, markMissed(year, advanceSkips(year, stop)), stop);
      current = withSeason({ ...working, date: stop }, next);
      await catchUp();
      const moved = settle();
      if (year.index !== season.index) await autosave({ kind: 'season', year: seasonYear(year) });

      return moved;
    }),

    async skips(date) {
      const { season } = await seasonNow();

      return advanceSkips(season, date);
    },

    async roundCosts() {
      const { career, season } = await seasonNow();
      if (career.kind !== 'career') return [];

      const owned = new Set(career.garage.map((car) => car.model));
      // The lookups, not their answers, are kept: every class is priced at
      // once, so an answer would arrive too late to spare any of them.
      const rents = new Map<string, Promise<number>>();
      /**
       * What a round of a car rents for, looked up once per call.
       * @param model The car's folder ID
       * @returns The rent
       */
      const rentOfCar = (model: string): Promise<number> => {
        const rent = rents.get(model) ?? content.price(model).then((price) => rentOf(price ?? 0));
        rents.set(model, rent);

        return rent;
      };

      const { series: listings } = await series.list();
      const perListing = await Promise.all(listings
        .filter((listing) => listing.availability.available)
        .map(async (listing): Promise<RoundCost[]> => {
          const championship = listing.series;
          const edition = enteredEdition(season, championship.id) ?? editionAt(championship, season, career.date);
          const held = enteredEntry(season, championship.id, edition);
          const events = held?.events ?? materialiseEvents(championship, season, edition, career.date);
          // With nothing left of it this season, its opening round stands for a
          // round of it.
          const next = events.find((event) => event.status === 'scheduled') ?? events[0];
          if (!next) return [];

          // An edition the career is in is raced in the class it entered, so
          // every class of it answers with what that class's next launch owes.
          if (held && next.status === 'scheduled') {
            const owed = await owedFor(career, { entry: held, event: next });

            return championship.entries.map((entry) => (
              { series: championship.id, entry: entry.id, cost: owed.fee + owed.rent }
            ));
          }

          const priced = await Promise.all(championship.entries.map(async (entry): Promise<RoundCost | null> => {
            const cars = eligibleCarsIn(listing.availability, next.round, entry.id);
            if (cars.length === 0) return null;
            const rent = cars.some((car) => owned.has(car)) ? 0 : Math.min(...await Promise.all(cars.map(rentOfCar)));

            return { series: championship.id, entry: entry.id, cost: (next.entryFee ?? 0) + rent };
          }));

          return priced.filter((cost) => cost !== null);
        }));

      return perListing.flat();
    },

    async skipping(request) {
      const { season } = await seasonNow();

      return skipCost(season, await heldEvent(season, request));
    },

    skip: (request) => commit(async () => {
      const { career, season } = await seasonNow();
      // The round or one skipped with it may be the one out at the game.
      if (race.progress()?.inFlight) throw new AppError('run.inFlight');
      const held = await heldEvent(season, request);
      const availability = await series.validate(held.entry.championship);
      // The page offers Skip exactly where Launch is refused for this reason.
      const block = launchBlock(season, held, heldRaceable(availability, held), career.settings.allowSameDayEvents);
      if (block?.code !== 'series.round.unavailable') {
        if (block) throw new AppError(block.code, block.params);
        throw new AppError('career.skip.raceable', { round: eventName(held) });
      }

      const date = held.event.date > career.date ? held.event.date : career.date;
      const next = issueForecasts(career, markMissed(season, skipCost(season, held)), date);
      current = withSeason({ ...career, date }, next);
      // Each round skipped is raced by the field, its day being behind the clock.
      await catchUp();

      return settle();
    }),

    async event(request) {
      const {
        career, season, listing, edition,
      } = await runAsked(request);
      // A season behind the current one is history: read back, never raced.
      const closed = season !== currentSeason(career);
      const setup = await race.get();
      // A historic event is in no library a career reads from, so one declined
      // is read back off its own entry rather than offered to be entered again.
      const declined = editionEntry(season, request.series, edition)?.historic === true;
      const held = enteredEvent(season, request.series, request.round, edition, closed || declined);

      const championship = held?.entry.championship ?? listing?.series;
      if (!championship) throw new AppError('series.notFound', { series: request.series });
      if (!held) checkEdition(championship, edition);

      const classEntry = championship.entries.find((one) => one.id === (held?.entry.entry ?? ''))
        ?? championship.entries[0];
      const salt = seasonSalt(career, season.index, edition);
      // A championship the career is not in is dated as if entered today.
      const dated = held ? [] : materialiseEvents(championship, season, edition, career.date);
      const found = dated.find((one) => one.round === request.round);
      // Entering offers the cars of the round it would start from, which are
      // the ones enrol accepts.
      const enterAt = dated.find((one) => one.status !== 'missed')?.round ?? request.round;
      const listed = held?.event ?? (found && simulatedEvent(championship, found, salt));
      // Drawn on read as well as stored as the clock moves, so an event inside
      // the lead has its weather whether or not it has been entered yet.
      const event = listed && issueForecast(
        career,
        { season: season.index, edition },
        championship,
        listed,
        career.date,
      );
      const round = championship.rounds.find((one) => one.id === request.round);
      if (!classEntry || !event || !round) {
        throw new AppError('career.event.notFound', { series: championship.name, round: request.round });
      }

      const availability = held || !listing ? await series.validate(championship) : listing.availability;
      const raceable = held ? heldRaceable(availability, held) : roundRaceableIn(availability, request.round);
      // A career not yet in the championship has no car, so its event is
      // planned in the first one the class could field - the sessions, their
      // lengths and their weather do not depend on which.
      const firstCar = eligibleCarsIn(availability, request.round, classEntry.id)[0];
      const car = held?.entry.car ?? (firstCar ? { model: firstCar } : null);

      let plan: EventPlan | null = null;
      if (car && raceable) {
        try {
          const definition = await lowerEvent(championship, {
            entry: classEntry.id, round: request.round, car, draw: event.forecast, field: held?.entry.field,
          }, event.raceId, held ? strengthStep(held) : 0);
          plan = planEvent(definition, await content.content());
        } catch (error) {
          // What the page can show without a plan is the round itself, and it
          // already says the round cannot be raced.
          console.warn(`Could not plan ${championship.name} - ${round.name}.`, error);
        }
      }

      const format = formatOf(championship, round);
      const climate = climateOf(championship, round);
      const forecast = event.forecast ? offerForecast(event.forecast, await series.offer()) : null;
      const playerSeat = held?.entry.playerSeat ?? null;
      const seat = classEntry.seats.find((one) => one.id === playerSeat);

      let blocked: AppErrorInfo | null = appErrorInfo('career.event.notEntered', { series: championship.name });
      if (closed) blocked = appErrorInfo('career.season.closed', { year: seasonYear(season) });
      else if (held) blocked = launchBlock(season, held, raceable, career.settings.allowSameDayEvents);
      // Exactly where the launch would refuse it, once nothing else does.
      const owed = held ? await owedFor(career, held) : null;
      if (owed && !closed && blocked === null && owed.fee + owed.rent > career.money) {
        blocked = appErrorInfo('career.money.short', { fee: owed.fee + owed.rent, money: career.money });
      }

      const view: CareerEventView = {
        series: championship.id,
        season: season.index,
        edition,
        editions: editionsOf(championship),
        seriesName: championship.name,
        round: round.id,
        roundName: round.name,
        number: championship.rounds.indexOf(round) + 1,
        rounds: championship.rounds.length,
        track: round.track,
        date: event.date,
        climate,
        prize: winnerPrize(career, championship, classEntry.id),
        gridSize: classEntry.seats.length,
        status: event.status,
        clock: career.date,
        entered: held ? {
          entry: classEntry.id,
          entryName: classEntry.name,
          ladder: classEntry.ladder,
          car: held.entry.car,
          team: championship.teams?.find((one) => one.id === seat?.team)?.name ?? null,
        } : null,
        strength: held ? eventStrength(held, !closed && event.status === 'scheduled') : null,
        classes: championship.entries.map((one) => ({
          id: one.id,
          name: one.name,
          ladder: one.ladder,
          eligible: isEligible(one.ladder, career.level),
          cars: eligibleCarsIn(availability, enterAt, one.id),
        })),
        raceable,
        sessions: plan ? eventSessions(
          plan,
          format ? roundSessions(format, round) : [],
          event.sessions,
          forecast,
          climate !== null && forecast === null,
          event.score,
          playerSeat,
          !closed && !!held && event.status === 'scheduled',
        ) : [],
        blocked,
        money: held && career.kind === 'career' ? {
          fee: feeOf(held.entry, held.event),
          paid: feePaid(career, held.event),
          rent: owed?.roundRent ?? null,
          rentPaid: rentPaid(career, held.event),
          balance: career.money,
        } : null,
        skips: !closed && held && event.status === 'scheduled'
          ? launchSkips(season, held, career.settings.allowSameDayEvents)
          : [],
        // Whatever is already over is a non-start from the moment it is entered.
        behind: closed ? [] : dated
          .filter((one) => one.status === 'missed')
          .map((one) => skippedRound(championship, classEntry.id, edition, one, 'behind')),
        live: !closed && setup.definition.id === event.raceId,
        grid: plan?.grid ?? [],
        // Not the player in a round they were not there for, nor in any round
        // of a championship they are not in.
        substituted: event.status === 'missed',
        historic: held && isHistoric(held.entry) ? {
          description: championship.description ?? null,
          event: championship,
          availability,
          seat: held.entry.playerSeat,
        } : null,
      };

      return view;
    },

    async results(request: ResultsRequest) {
      const {
        career, season, listing, edition,
      } = await runAsked(request);
      const held = editionEntry(season, request.series, edition);
      if (held) return entryResults(held, season.index);

      if (!listing) throw new AppError('series.notFound', { series: request.series });
      checkEdition(listing.series, edition);

      // Simulated afresh on every read and never stored: the same round of the
      // same edition always comes out the same, so there is nothing to keep.
      const salt = seasonSalt(career, season.index, edition);
      const rounds = materialiseEvents(listing.series, season, edition, career.date)
        .map((event) => roundResult(simulatedEvent(listing.series, event, salt)));

      return {
        championship: listing.series, season: season.index, edition, rounds, playerSeat: null, playerEntry: null,
      };
    },

    launch: (request) => commit(async () => {
      const { career, season } = await seasonNow();
      const held = await heldEvent(season, request);

      const availability = await series.validate(held.entry.championship);
      const block = launchBlock(season, held, heldRaceable(availability, held), career.settings.allowSameDayEvents);
      if (block) throw new AppError(block.code, block.params);
      // Paid as the first session goes out, and never into debt.
      const { fee, rent } = await owedFor(career, held);
      if (fee + rent > career.money) throw new AppError('career.money.short', { fee: fee + rent, money: career.money });

      // What this event costs the rest of the season, which the player has to
      // have been shown and agreed to - an event on the same day included,
      // unless the career allows two on one day.
      const lost = launchSkips(season, held, career.settings.allowSameDayEvents);
      if (lost.length > 0 && !request.skip) {
        const partway = lost.find((one) => one.reason === 'partway');
        if (partway) throw new AppError('career.event.otherInProgress', { event: lostName(partway) });
        const earlier = lost.find((one) => one.reason !== 'clash');
        throw earlier
          ? new AppError('career.event.earlierPending', { event: lostName(earlier) })
          : new AppError('career.event.sameDay', { event: lostName(lost[0]) });
      }

      // Racing an event still ahead of the clock moves the clock to it, and
      // everything confirmed lost on the way becomes a non-start. Forecasts are
      // issued either way, since an event already inside the lead may not have
      // had its own.
      const date = career.date < held.event.date ? held.event.date : career.date;
      const moved = issueForecasts(career, markMissed(season, lost), date);
      const event = enteredEvent(moved, request.series, request.round, held.entry.edition)?.event ?? held.event;

      // Part-way through, the event carries on from the race the slot holds,
      // with only its AI levels taken afresh. What has run comes from the
      // career's own record, so a quick race raced in between costs it nothing.
      const fresh = await lowerEvent(held.entry.championship, {
        entry: held.entry.entry,
        round: request.round,
        car: held.entry.car,
        draw: event.forecast,
        field: held.entry.field,
      }, event.raceId, strengthStep(held));
      const setup = await race.get();
      const carriedOn = slotHolds(setup, event.raceId, event.sessions.length, career.id);
      await race.load(carriedOn ? withLevelsOf(setup.definition, fresh) : fresh, event.sessions);
      const launched = await race.launch({
        scale: request.scale,
        aids: careerDrivingAids(settings.get(), career.settings),
      });

      // Kept only once the launch is away, so one that fails to start costs the
      // season nothing - its entry fee and its rent included.
      const changed = date !== career.date || lost.length > 0 || event.forecast !== held.event.forecast;
      if (changed || fee > 0 || rent > 0) {
        const next = changed ? withSeason({ ...career, date }, moved) : career;
        const name = rent > 0 ? (await namesOf(held.entry.car.model)).name : '';
        current = post(next, [
          ...(fee > 0 ? [feeLine(season, held.entry, event, fee)] : []),
          ...(rent > 0 ? [rentLine(season, held.entry, event, rent, name)] : []),
        ]);
        if (changed) await catchUp();
        settle();
      }

      return launched;
    }),

    flush: flushNow,

    onChange(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    onSaves(listener) {
      saveListeners.add(listener);

      return () => saveListeners.delete(listener);
    },
  };
};
