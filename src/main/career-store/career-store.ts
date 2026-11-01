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
  BackupContents, CareerStore, EnrolRequest, EnteredEvent, EventRequest, OfferDraft, ResultsRequest,
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
  declineOffers,
  drawnCars,
  drawnEvent,
  drawOf,
  editionAt,
  endSponsor,
  endSponsorYears,
  enteredEntry,
  enteredEvent,
  eventName,
  eventSessions,
  eventStrength,
  experiencedAt,
  heldRaceable,
  historicDraws,
  historicInvitation,
  inProgressEvent,
  invitationMail,
  invitationState,
  issueForecast,
  issueForecasts,
  keptInBackup,
  launchBlock,
  launchSkips,
  lostName,
  markMissed,
  materialiseEvents,
  noticeMail,
  offerMail,
  openSeason,
  previousRun,
  profileOf,
  readBackup,
  readProfile,
  readState,
  saleSeats,
  seasonOf,
  seasonSalt,
  sendSponsorOffers,
  signedContract,
  signSponsor,
  simulatedEvent,
  skipCost,
  skippedRound,
  stateOf,
  strengthStep,
  summarise,
  unansweredSkips,
  winnerPrize,
  withKept,
  withLapsed,
  withReply,
  withSeason,
} from './utils.ts';
import {
  coveringSponsor,
  feeLine,
  feeOf,
  feeOwed,
  feePaid,
  openingLine,
  payOut,
  post,
  purchaseLine,
  refundLine,
  releaseLine,
  rentLine,
  rentOwed,
  rentPaid,
  repaintLine,
  salaryPaid,
  saleLine,
  seatLine,
  speedLine,
  sponsorLine,
} from '../../core/career-money/index.ts';
import {
  closeLevels, liftOnEntering, noteRatingSpeed, openingRatingLine, rateCareer,
} from '../../core/career-rating/index.ts';
import { planEvent } from '../../core/event/index.ts';
import {
  historicRung, historicSeat, historicSlots, invitationDrawn, planHistoric, withPlayerSeat,
} from '../../core/historic-draw/index.ts';
import { simulateRound } from '../../core/round-simulation/index.ts';
import { addDays, toDayNumber } from '../../core/season-calendar/index.ts';
import { scoreRound } from '../../core/season-scoring/index.ts';
import {
  classOffers, drawnTeam, lifelineOffer, offerStanding, renewalOffer, rungPosition,
} from '../../core/seat-offers/index.ts';
import type { ClassOfferRequest } from '../../core/seat-offers/index.ts';
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
  Contract,
  ContractTerms,
  Discipline,
  EventPlan,
  HistoricDraw,
  KeptOutcome,
  Mail,
  OfferPick,
  RaceDefinition,
  RaceSetup,
  RoundCost,
  SaveMoment,
  SaveSummary,
  SeasonEntry,
  SeasonEvent,
  SeatSale,
  SeriesAvailability,
  SeriesLibrary,
  SeriesListing,
  SkippedRound,
} from '../../shared/types/index.ts';
import { keptStep, withStrength } from '../../shared/utils/ai-figure/index.ts';
import { rentOf, repaintOf, resaleValue } from '../../shared/utils/car-prices/index.ts';
import {
  isEligible, levelsAt, LOWEST_RUNG, openLevels, ratingFloor, ratingsAt,
} from '../../shared/utils/career-eligibility/index.ts';
import { careerDrivingAids, careerOpponents, readCareerSettings } from '../../shared/utils/career-settings/index.ts';
import { hiddenBySources } from '../../shared/utils/content-sources/index.ts';
import {
  activeContract, coveredFee, keepStanding, offerDay, pickedOffer, roundFine, roundSalary, seatId, termination,
} from '../../shared/utils/contracts/index.ts';
import {
  editionEntry, editionOver, editionsOf, enteredEdition, seasonYear,
} from '../../shared/utils/editions/index.ts';
import { entryFeeOf } from '../../shared/utils/entry-fees/index.ts';
import {
  liveryName, ownedCar, racingIn, roundUnderWay, withCarIn,
} from '../../shared/utils/garage/index.ts';
import { isHistoric } from '../../shared/utils/historic/index.ts';
import {
  awaitingMail, invitationChance, invitationDay, invitationId, mailStatus,
} from '../../shared/utils/inbox/index.ts';
import { nationName } from '../../shared/utils/nations/index.ts';
import { prizeTable } from '../../shared/utils/prizes/index.ts';
import { eligibleCarsIn, firstRaceable, roundRaceableIn } from '../../shared/utils/round-availability/index.ts';
import { hiddenAsFiller, isSeriesActive } from '../../shared/utils/series-toggles/index.ts';
import { bestRung, liveDeals } from '../../shared/utils/sponsors/index.ts';
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
   * Pays whatever the career is owed, rates every session it has driven,
   * schedules a write and tells everyone watching.
   *
   * Every change ends here, so every prize lands as soon as anything has earned
   * it - a race recorded, an edition run out by the clock - and every session
   * is rated as soon as it lands, whichever command got it there.
   * @returns The career as it now stands
   */
  const settle = (): Career => {
    if (!current) throw new AppError('career.none');
    // Played is opened or changed, which every settle is one of.
    const career: Career = { ...rateCareer(payOut(current)), playedAt: new Date().toISOString() };
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
   * why a change reaches the next season rather than this one. Each is kept on
   * the season as drawn, open for anyone to enter, and its invitation goes out
   * four weeks before its day. Nothing is placed before the day given, so a
   * season drawn part-way through dates nothing behind the clock.
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

    const drawn = picks.flatMap((pick): HistoricDraw[] => {
      const listing = offered.find((one) => one.series.id === pick.id);
      const round = listing?.series.rounds[0];
      if (!listing || !round) return [];

      return [{
        series: listing.series.id,
        // A copy, as a championship entered is, so an edit to the library
        // reaches next season's draw rather than this one.
        championship: structuredClone(listing.series),
        round: round.id,
        raceId: runRaceId(listing.series.id, round.id, { season: season.index, edition: 0 }),
        date: pick.date,
        invitations: invitationDay(pick.date, from),
      }];
    });

    return { ...season, historicEvents: [...historicDraws(season), ...drawn], historicDrawn: true };
  };

  /**
   * Sends every historic event's invitation whose day has come, once each.
   *
   * Whether one comes is a seeded draw at the chance of the player's highest
   * rung among the event's disciplines, read as they go out, and it offers a
   * seat in that discipline's class nearest the rung. None is drawn for once
   * the player has entered the event at their own cost, and none sent for an
   * event whose day the clock has already passed.
   * @param career The career
   * @param today The ISO date to send them as of - the clock's own, or the day
   * after its season ends for a move closing that season on the way
   * @returns The career, every invitation due sent - the same one when none was
   */
  const sendInvitations = async (career: Career, today = career.date): Promise<Career> => {
    const season = currentSeason(career);
    const due = season
      ? historicDraws(season).filter((draw) => !draw.invitation && draw.invitations <= today)
      : [];
    if (!season || due.length === 0) return career;

    const salt = seasonSalt(career, season.index);
    const sent: Mail[] = [];
    const draws = await Promise.all(historicDraws(season).map(async (draw): Promise<HistoricDraw> => {
      if (!due.includes(draw)) return draw;
      const on = draw.invitations;
      if (enteredEntry(season, draw.series, 0)) return { ...draw, invitation: { on, outcome: 'entered' } };
      // Passed by while the clock jumped, it has nobody left to invite.
      if (draw.date < today) return { ...draw, invitation: { on, outcome: 'uninvited' } };

      const cars = drawnCars(draw, await historic.validate(draw.championship));
      const rung = historicRung(draw.championship, cars, career.level);
      if (!rung) return { ...draw, invitation: { on, outcome: 'uninvited' } };
      const chance = invitationChance(rung.rung);
      const drawnOn = {
        on, discipline: rung.discipline, rung: rung.rung, chance,
      };
      const seat = invitationDrawn(draw.championship, chance, salt)
        ? historicSeat(draw.championship, cars, salt, career.level)
        : null;
      if (!seat) return { ...draw, invitation: { ...drawnOn, outcome: 'uninvited' } };

      sent.push({
        id: invitationId(draw.raceId),
        kind: 'invitation',
        season: season.index,
        arrived: on,
        opened: false,
        deadline: draw.date,
        invitation: {
          series: draw.series, raceId: draw.raceId, entry: seat.entry, seat: seat.seat, car: seat.car,
        },
      });

      return { ...draw, invitation: { ...drawnOn, outcome: 'invited' } };
    }));

    return {
      ...withSeason(career, { ...season, historicEvents: draws }),
      inbox: [...career.inbox, ...sent.sort((left, right) => left.arrived.localeCompare(right.arrived))],
    };
  };

  /**
   * A team's car in the livery it is shown and raced in: the one its seat
   * names, or the car's first rather than its maker's badge.
   * @param car The car, as the seat names it
   * @returns The car, liveried where the install has any livery for it
   */
  const liveried = async (car: ContractTerms['car']): Promise<ContractTerms['car']> => {
    if (car.skin !== undefined) return car;
    const skin = (await content.car(car.model, true))?.skins[0]?.id;

    return skin === undefined ? car : { ...car, skin };
  };

  /**
   * A round's rent of the cheapest car a class may be raced in.
   * @param cars The installed cars the class may race, by folder ID
   * @returns The rent, or infinity when nothing installed can race it
   */
  const cheapestRent = async (cars: readonly string[]): Promise<number> => {
    if (cars.length === 0) return Number.POSITIVE_INFINITY;
    const rents = await Promise.all(cars.map(async (car) => rentOf(await content.price(car) ?? 0)));

    return Math.min(...rents);
  };

  /**
   * A rent as an offer states it.
   * @param rent The cheapest rent found
   * @returns It, or zero where no car was found to rent
   */
  const knownRent = (rent: number): number => (Number.isFinite(rent) ? rent : 0);

  /**
   * Sends every edition's seat offers whose day has come, once each.
   *
   * Eight weeks before an edition opens, each class on the player's rung - or
   * the one below, while the player is in the bottom half of their own - draws
   * how many of its seats are going, and the best funded of its teams that call
   * fill them. An edition's offers come as one mail. None comes for an edition
   * the player has entered, or one already under way. And a career with no car,
   * no offer waiting and too little money for any round of the bottom rung's
   * classes whose offers go out is offered one free seat there, so it is never
   * stuck.
   * @param career The career
   * @param today The ISO date to send them as of
   * @returns The career, every offer due sent - the same one when none was
   */
  const sendOffers = async (career: Career, today = career.date): Promise<Career> => {
    const season = currentSeason(career);
    if (career.kind !== 'career' || !season) return career;

    let library: SeriesLibrary;
    try {
      library = await series.list();
    } catch (error) {
      console.warn('Could not read the championships to draw seat offers from.', error);

      return career;
    }

    const shown = settings.get();
    const drawn = new Set(season.offersDrawn ?? []);
    // Only what the Championships page lists, and only an edition not drawn
    // yet - which spares dating every edition of the library on every command.
    const due = library.series
      .filter((listing) => (
        listing.availability.available
        && isSeriesActive(listing, shown)
        && !hiddenAsFiller(listing, shown)
        && !hiddenBySources(listing, shown.hiddenContentSources)
      ))
      .flatMap((listing) => Array.from({ length: editionsOf(listing.series) }, (unused, edition) => ({
        listing, edition, key: `${listing.series.id}:${edition}`,
      })))
      .filter((one) => !drawn.has(one.key))
      .flatMap((one) => {
        const opener = materialiseEvents(one.listing.series, season, one.edition, season.startDate)[0];

        return opener && offerDay(opener.date) <= today ? [{ ...one, opener }] : [];
      });
    if (due.length === 0) return career;

    const open = openLevels(career.level);
    // A class's offer before the rent of its cheapest car is looked up.
    type Drawn = Omit<OfferDraft, 'rent'> & { cars: readonly string[] };
    const editions: { championship: Championship; edition: number; drafts: Drawn[] }[] = [];
    const lifelines: {
      request: ClassOfferRequest; edition: number; events: SeasonEvent[]; listing: SeriesListing;
    }[] = [];
    // What came of each contract whose team decided, and the news of a team
    // letting the player go.
    const decided: { season: number; series: string; edition: number; kept: KeptOutcome }[] = [];
    const notices: Mail[] = [];
    for (const { listing, edition, opener } of due) {
      // Passed by, or entered already: there is no seat left to offer.
      if (opener.date > today && !enteredEntry(season, listing.series.id, edition)) {
        const championship = listing.series;
        const salt = seasonSalt(career, season.index, edition);
        const drafts: Drawn[] = [];
        // The team the player raced the run before for decides now, on the
        // class's table as it stands.
        const before = previousRun(career, season, championship, edition);
        const judged = before ? keepStanding(before.entry) : null;
        // A team that has not seen the player race in a run still under way
        // keeps them on.
        const keeping = judged && before && judged.place === null && !editionOver(before.entry, today)
          ? { ...judged, kept: true }
          : judged;
        if (before && keeping && !keeping.kept) {
          notices.push(noticeMail(before.season, before.entry, keeping, today, season.index));
          decided.push({
            season: before.season.index, series: championship.id, edition: before.entry.edition, kept: 'released',
          });
        }

        for (const entry of championship.entries) {
          const { discipline, tier } = entry.ladder;
          const standing = offerStanding(tier, open[discipline], career.rating[discipline]);
          const events = materialiseEvents(championship, season, edition, season.startDate, entry.id);
          const cars = eligibleCarsIn(listing.availability, opener.round, entry.id);
          const request: ClassOfferRequest = {
            championship,
            entry,
            salt,
            cars,
            standing: standing ?? 'below',
            position: rungPosition(career.rating[discipline], tier),
            experienced: experiencedAt(career, discipline, tier),
            fees: events.map((event) => event.entryFee ?? 0),
            winnerPrize: prizeTable(championship, entry.id, 'positions')[0] ?? 0,
            prizeSpeed: career.settings.prizeSpeed,
          };
          // A renewal leads its class, beside whoever else calls - and the team
          // renewing does not call twice. Only in a class the ladder still
          // opens to the player, as any offer is.
          const renewing = before && keeping?.kept && before.entry.contract.entry === entry.id;
          const renewal = renewing && isEligible(entry.ladder, open)
            ? renewalOffer(request, before.entry.contract, {
              season: before.season.index, edition: before.entry.edition,
            }, keeping.place ?? keeping.size)
            : null;
          if (renewal && before) {
            drafts.push({ terms: renewal, events, cars });
            decided.push({
              season: before.season.index, series: championship.id, edition: before.entry.edition, kept: 'offered',
            });
          }
          if (standing) {
            drafts.push(...classOffers(request)
              .filter((terms) => terms.team !== renewal?.team)
              .map((terms) => ({ terms, events, cars })));
          }
          if (tier >= LOWEST_RUNG && isEligible(entry.ladder, open)) {
            lifelines.push({
              request, edition, listing, events,
            });
          }
        }
        if (drafts.length > 0) editions.push({ championship, edition, drafts });
      }
    }
    const sent = await Promise.all(editions.map(async ({ championship, edition, drafts }) => offerMail(
      season,
      championship,
      edition,
      await Promise.all(drafts.map(async ({ terms, events, cars }): Promise<OfferDraft> => ({
        terms, events, rent: knownRent(await cheapestRent(cars)),
      }))),
      today,
    )));

    // Only when nothing else came and nothing else waits, and only to a career
    // with no car, no contract still to race and too little money for any of
    // these rounds.
    const waiting = awaitingMail(career.inbox, today).some((mail) => mail.kind === 'offer');
    const contracted = season.entries.some((entry) => (
      activeContract(entry) && entry.events.some((event) => event.status === 'scheduled')
    ));
    if (sent.length === 0 && !waiting && !contracted && career.garage.length === 0 && lifelines.length > 0) {
      const rents = await Promise.all(lifelines.map((one) => cheapestRent(one.request.cars)));
      if (lifelines.every((one, at) => (one.events[0]?.entryFee ?? 0) + rents[at] > career.money)) {
        const found = lifelines
          .map((one, at) => ({ one, at, terms: lifelineOffer(one.request) }))
          .find((pair) => pair.terms !== null);
        if (found?.terms) {
          const { listing, edition, events } = found.one;
          sent.push(offerMail(season, listing.series, edition, [{
            terms: found.terms, events, rent: knownRent(rents[found.at]),
          }], today));
        }
      }
    }

    const known = new Set(career.inbox.map((mail) => mail.id));
    const painted = await Promise.all(sent.map(async (mail): Promise<Mail> => ({
      ...mail,
      offers: await Promise.all((mail.offers ?? []).map(async (offer) => ({
        ...offer, car: await liveried(offer.car),
      }))),
    })));

    const drawnNow = withSeason(career, { ...season, offersDrawn: [...drawn, ...due.map((one) => one.key)] });

    return {
      ...decided.reduce((marked, one) => withKept(marked, one.season, one.series, one.edition, one.kept), drawnNow),
      inbox: [...career.inbox, ...[...notices, ...painted].filter((mail) => !known.has(mail.id))],
    };
  };

  /**
   * Whether a car races in a class on a rung or below it, anywhere in the
   * championship library.
   * @param model The car's folder ID
   * @param rung The rung, 1 being the top
   * @param discipline The discipline the class has to enter at, or null for any
   * @returns True when some class at that rung or lower may field it
   */
  const racesAtOrBelow = async (model: string, rung: number, discipline: Discipline | null): Promise<boolean> => {
    let library: SeriesLibrary;
    try {
      library = await series.list();
    } catch {
      return false;
    }

    return library.series.some((listing) => listing.series.entries.some((entry) => (
      entry.ladder.tier >= rung
      && (discipline === null || entry.ladder.discipline === discipline)
      && eligibleCarsIn(listing.availability, listing.series.rounds[0]?.id ?? '', entry.id).includes(model)
    )));
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

    current = await sendInvitations(withSeason(current, issueForecasts(current, drawn, current.date)));
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
   * Brings the career's missed rounds and its mail up to date, after anything
   * that can have moved the clock or given a round up.
   */
  const catchUp = async (): Promise<void> => {
    if (current) {
      current = await sendOffers(await sendInvitations(await simulateMissed(current)));
      // Rated first, so an offer is drawn on the rung and rating the round left.
      current = sendSponsorOffers(rateCareer(endSponsorYears(current)));
    }
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
    // A round finished may bring a sponsor's offer, whether or not it moved
    // the clock.
    if (finished) current = sendSponsorOffers(rateCareer(current));
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
   * The class of a championship's edition a career asks to enter, checked as
   * every way in checks it: the class open to the career, the edition not
   * entered already, and a round of it still to race.
   * @param career The career
   * @param season The season it is entered in
   * @param request The championship, the class and the edition, when it names one
   * @returns The championship, the class, the edition and its rounds, dated
   * from the career's clock
   * @throws When any of that does not hold
   */
  const enterable = async (
    career: Career,
    season: CareerSeason,
    request: { series: string; entry: string; edition?: number },
  ): Promise<{ listing: SeriesListing; entry: ClassEntry; edition: number; events: SeasonEvent[] }> => {
    const { listing, entry } = await raceableEntry(request.series, request.entry);
    if (!isEligible(entry.ladder, openLevels(career.level))) {
      throw new AppError('career.entry.ineligible', { entry: entry.name });
    }
    const edition = request.edition ?? editionAt(listing.series, season, career.date);
    checkEdition(listing.series, edition);
    if (enteredEntry(season, request.series, edition)) {
      throw new AppError('career.entry.enrolled', { entry: listing.series.name });
    }
    // Every round already behind the clock would be a season raced entirely
    // without the player.
    const events = materialiseEvents(listing.series, season, edition, career.date, entry.id);
    if (!events.some((one) => one.status !== 'missed')) {
      throw new AppError('career.edition.over', { series: listing.series.name });
    }

    return {
      listing, entry, edition, events,
    };
  };

  /**
   * An edition of a championship as a career enters it, its rounds dated from
   * the career's clock.
   *
   * The player takes a team's slower seat - the contract's team, or on their
   * own one drawn for the edition among those fielding two cars - moved to the
   * end of the class in the season's copy, which is the seat every lowering,
   * field draw and simulation gives the player. A class with no such team
   * leaves them its last seat, as it stands.
   * @param career The career
   * @param season The season it is entered in
   * @param listing The championship
   * @param entry The class
   * @param edition Which of the season's editions
   * @param car The car it is raced in
   * @param contract The contract it is raced under, when it is
   * @returns The season's entry
   */
  const entering = async (
    career: Career,
    season: CareerSeason,
    listing: SeriesListing,
    entry: ClassEntry,
    edition: number,
    car: SeasonEntry['car'],
    contract?: Contract,
  ): Promise<SeasonEntry> => {
    // Salted like the forecasts, so two careers, two seasons and two editions
    // of one championship field different drivers - and draw different teams.
    const salt = seasonSalt(career, season.index, edition);
    // A copy, and a deep one: the season must not change when the library's
    // own object does.
    const copy = structuredClone(listing.series);
    const seat = contract?.seat ?? drawnTeam(copy, entry, salt)?.seat.id;
    const championship = seat === undefined ? copy : withPlayerSeat(copy, entry.id, seat);
    const placed = championship.entries.find((one) => one.id === entry.id) ?? entry;

    return {
      series: championship.id,
      edition,
      championship,
      entry: entry.id,
      // The last seat of the class, which is the one roundRace gives up.
      playerSeat: placed.seats[placed.seats.length - 1]?.id ?? '',
      car,
      field: await series.drawField(championship, entry.id, salt),
      events: materialiseEvents(championship, season, edition, career.date, entry.id),
      standings: buildStandings(championship, [], new Date().toISOString()),
      ...(contract ? { contract } : {}),
    };
  };

  /**
   * A career signed to the contract one of a mail's offers holds out, entered
   * in its championship in the team's seat and car - every other offer for the
   * edition declined, and a seat paid for as it is signed.
   * @param career The career
   * @param season The season the offer is for
   * @param mail The edition's seat offers
   * @param pick Which of them, needed where it holds more than one
   * @returns The career
   * @throws When the mail holds no such offer, it can no longer be accepted,
   * the edition is entered already, the seat costs more than the career holds,
   * or the championship no longer races or fields the seat
   */
  const signOffer = async (career: Career, season: CareerSeason, mail: Mail, pick?: OfferPick): Promise<Career> => {
    const offer = pickedOffer(mail, pick);
    if (!offer) throw new AppError('mail.notFound');
    const named = { team: offer.teamName, series: offer.seriesName };
    if (offer.season !== season.index || mailStatus(mail, career.date) !== 'awaiting') {
      throw new AppError('contract.closed', named);
    }
    if (enteredEntry(season, offer.series, offer.edition)) {
      throw new AppError('career.entry.enrolled', { entry: offer.seriesName });
    }
    const price = offer.pay === 'seat' ? offer.amount : 0;
    if (price > career.money) throw new AppError('contract.short', { price, money: career.money });

    const { listing, entry } = await raceableEntry(offer.series, offer.entry);
    if (!entry.seats.some((seat) => seat.id === offer.seat && seat.team === offer.team)) {
      throw new AppError('contract.gone', named);
    }
    const contract = signedContract(mail, offer, career.date);
    // The team's car, which is never the player's to rent or buy.
    const enrolled = await entering(career, season, listing, entry, offer.edition, offer.car, contract);
    const answered = declineOffers(
      withReply(career, mail, 'accepted', { entry: offer.entry, team: offer.team }),
      season,
      offer.series,
      offer.edition,
    );
    const signed = withSeason(liftOnEntering(answered, season, enrolled), issueForecasts(
      answered,
      { ...season, entries: [...season.entries, enrolled] },
      career.date,
    ));

    // Signing a renewal is the contract it renews carried on.
    const renewed = offer.renews
      ? withKept(signed, offer.renews.season, offer.series, offer.renews.edition, 'renewed')
      : signed;

    return post(renewed, price > 0 ? [seatLine(career, mail.id, offer)] : []);
  };

  /**
   * Rounds a move would lose under a contract, the install could not race
   * anyway: listed as such, and never fined.
   * @param season The season they fall in
   * @param rounds The rounds lost
   * @returns The rounds, those the install cannot race marked so
   */
  const withUnraceable = async (season: CareerSeason, rounds: readonly SkippedRound[]): Promise<SkippedRound[]> => {
    const checked = new Map<SeasonEntry, Promise<SeriesAvailability>>();

    return Promise.all(rounds.map(async (round): Promise<SkippedRound> => {
      if (round.fine === null || round.reason !== 'skipped') return round;
      const held = enteredEvent(season, round.series, round.round, round.edition);
      if (!held) return round;
      const availability = checked.get(held.entry) ?? series.validate(held.entry.championship);
      checked.set(held.entry, availability);

      return heldRaceable(await availability, held) ? round : { ...round, reason: 'unraceable', fine: null };
    }));
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
   * The car a career enters in: owned, in the garage's livery, when the garage
   * holds it, and otherwise rented in whichever livery was picked.
   * @param career The career
   * @param picked The car and livery picked
   * @returns The car as the entry races it
   */
  const enteredCar = (career: Career, picked: { model: string; skin?: string }): SeasonEntry['car'] => {
    const owned = ownedCar(career, picked.model);

    return owned
      ? { model: picked.model, ...(owned.skin === undefined ? {} : { skin: owned.skin }), source: 'owned' }
      : { ...picked, source: 'rented' };
  };

  /**
   * A career entered in a historic event the season drew, its field drawn and
   * its forecast issued as any entry's are.
   * @param career The career
   * @param season The season the event was drawn in
   * @param draw The historic event
   * @param held The championship it races, the class, seat and car, and its
   * one event
   * @returns The career
   */
  const withHistoricEntry = async (
    career: Career,
    season: CareerSeason,
    draw: HistoricDraw,
    held: Pick<SeasonEntry, 'championship' | 'entry' | 'playerSeat' | 'car' | 'events'>,
  ): Promise<Career> => {
    const entry: SeasonEntry = {
      series: draw.series,
      edition: 0,
      ...held,
      field: await historic.drawField(held.championship, held.entry, seasonSalt(career, season.index)),
      standings: buildStandings(held.championship, [], new Date().toISOString()),
      historic: true,
    };

    return withSeason(career, issueForecasts(career, { ...season, entries: [...season.entries, entry] }, career.date));
  };

  /**
   * A career entered in a historic event in the seat its invitation offers,
   * the invitation answered.
   * @param career The career
   * @param season The season the event was drawn in
   * @param draw The historic event
   * @param mail The invitation
   * @returns The career
   * @throws When the mail offers no seat
   */
  const joinInvitation = async (
    career: Career,
    season: CareerSeason,
    draw: HistoricDraw,
    mail: Mail,
  ): Promise<Career> => {
    const offer = mail.invitation;
    if (!offer) throw new AppError('mail.notFound');

    return withHistoricEntry(withReply(career, mail, 'accepted'), season, draw, {
      // A copy, with the seat offered moved to where every lowering takes the
      // player's from.
      championship: withPlayerSeat(structuredClone(draw.championship), offer.entry, offer.seat),
      entry: offer.entry,
      playerSeat: offer.seat,
      car: offer.car,
      // No fee, which the team covers.
      events: [{
        round: draw.round, raceId: draw.raceId, date: draw.date, status: 'scheduled', sessions: [],
      }],
    });
  };

  /**
   * A career entered in a historic event at its own cost: the event's fee, and
   * a car of the class, owned or rented, in the class's last seat.
   * @param career The career
   * @param season The season the event was drawn in
   * @param draw The historic event
   * @param request Which class, and in what
   * @returns The career
   * @throws When the career is in it already, holds an invitation to it still
   * to be answered, its day is behind the clock, or the car is not one of the
   * class's
   */
  const enterHistoric = async (
    career: Career,
    season: CareerSeason,
    draw: HistoricDraw,
    request: EnrolRequest,
  ): Promise<Career> => {
    const { name } = draw.championship;
    if (enteredEntry(season, draw.series, 0)) throw new AppError('career.entry.enrolled', { entry: name });
    // An invitation still open is the way in at no cost, so it is answered first.
    if (invitationState(career, season, draw) === 'awaiting') throw new AppError('historic.invited', { event: name });
    if (draw.date < career.date) throw new AppError('career.edition.over', { series: name });
    const entry = draw.championship.entries.find((one) => one.id === request.entry);
    if (!entry) throw new AppError('series.entry.unknown', { entry: request.entry });
    const availability = await historic.validate(draw.championship);
    if (!eligibleCarsIn(availability, draw.round, entry.id).includes(request.car.model)) {
      throw new AppError('career.car.ineligible', { car: (await namesOf(request.car.model)).name, entry: entry.name });
    }

    return withHistoricEntry(career, season, draw, {
      championship: structuredClone(draw.championship),
      entry: entry.id,
      // The last seat of the class, which is the one roundRace gives up.
      playerSeat: entry.seats[entry.seats.length - 1]?.id ?? '',
      car: enteredCar(career, request.car),
      events: [drawnEvent(draw, career.date, entry.id)],
    });
  };

  /**
   * A career out of a historic event it was in, as though it had never
   * entered: the field races it without the player, and it is open to enter
   * again at the player's own cost - an invitation given back stays given back.
   * @param career The career
   * @param season The season the event was drawn in
   * @param held The player's entry into it
   * @returns The career
   * @throws When a session of it is out at the game, or it has begun or gone by
   */
  const leaveHistoric = (career: Career, season: CareerSeason, held: SeasonEntry): Career => {
    const progress = race.progress();
    if (progress?.inFlight && held.events.some((event) => event.raceId === progress.raceId)) {
      throw new AppError('run.inFlight');
    }
    // Leaving is turning it down, which an event already begun is past.
    if (held.events.some((event) => event.status !== 'scheduled' || event.sessions.length > 0)) {
      throw new AppError('historic.started', { event: held.championship.name });
    }

    const left = withSeason(career, { ...season, entries: season.entries.filter((one) => one !== held) });
    const mail = held.events[0] ? invitationMail(career, held.events[0]) : null;

    return mail?.reply?.answer === 'accepted' ? withReply(left, mail, 'declined') : left;
  };

  /**
   * A career with the invitation to a historic event accepted, when it holds
   * one still to be answered - which is what launching that event does.
   * @param career The career
   * @param season The season
   * @param seriesId The historic event's id
   * @returns The career, or null when there is no such invitation to accept
   */
  const acceptOnLaunch = async (career: Career, season: CareerSeason, seriesId: string): Promise<Career | null> => {
    const draw = drawOf(season, seriesId);
    const mail = draw && invitationMail(career, draw);
    if (!draw || !mail || invitationState(career, season, draw) !== 'awaiting') return null;

    return joinInvitation(career, season, draw, mail);
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
        globalRating: ratingFloor(level),
        startDate,
        settings: readCareerSettings(own),
        date: startDate,
        level: levelsAt(level),
        ratingLog: [openingRatingLine(startDate, level)],
        seasons: [openSeason(0, startDate)],
        inbox: [],
        sponsors: [],
      };

      // Drawn before anything changes, so a draw that fails leaves the career
      // open before as it was - and an event early in January has its
      // invitation as the year opens.
      const first = currentSeason(started);
      const ready = first
        ? await sendOffers(await sendInvitations(withSeason(
          started,
          issueForecasts(started, await drawHistoric(started, first, startDate), startDate),
        )))
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
        globalRating: ratingFloor(1),
        startDate,
        settings: readCareerSettings(undefined),
        date: startDate,
        level: levelsAt(1),
        ratingLog: [],
        seasons: [season],
        inbox: [],
        sponsors: [],
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
      // says so. Only a career has money and a rating for it to change.
      const paid = career.kind === 'career' && next.prizeSpeed !== career.settings.prizeSpeed
        ? post(career, [speedLine(career, next.prizeSpeed)])
        : career;
      const noted = career.kind === 'career' && next.ratingSpeed !== career.settings.ratingSpeed
        ? noteRatingSpeed(paid, next.ratingSpeed)
        : paid;
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
      const drawn = new Map(await Promise.all(historicDraws(held).map(async (draw): Promise<
        [HistoricDraw, SeriesAvailability]
      > => [draw, await historic.validate(draw.championship)])));

      return composeCalendar(
        career,
        held,
        library.series,
        await enteredAvailability(held),
        drawn,
        career.settings.allowSameDayEvents,
      );
    },

    enrol: (request: EnrolRequest) => commit(async () => {
      const { career, season } = await seasonNow();
      if (career.kind === 'championship') throw new AppError('standalone.enter');
      // A historic event the season drew is entered off the season's own copy.
      const draw = drawOf(season, request.series);
      if (draw) {
        current = await enterHistoric(career, season, draw, request);
        await catchUp();

        return settle();
      }

      const {
        listing, entry, edition, events,
      } = await enterable(career, season, request);
      const opener = events.find((one) => one.status !== 'missed') ?? events[0];

      // The cars the Enter panel offered: the class's at the round it starts at.
      const { model } = request.car;
      if (!eligibleCarsIn(listing.availability, opener.round, entry.id).includes(model)) {
        throw new AppError('career.car.ineligible', { car: (await namesOf(model)).name, entry: entry.name });
      }
      const enrolled = await entering(career, season, listing, entry, edition, enteredCar(career, request.car));

      // Entering a championship whose opener is this week forecasts it at once,
      // rather than leaving it blank until the clock next happens to move. A
      // discipline entered on the rung below the career's best is lifted to
      // that rung's floor as it is. Entering on the player's own turns down
      // any team's offer for it still waiting.
      const declined = declineOffers(career, season, request.series, edition);
      current = withSeason(liftOnEntering(declined, season, enrolled), issueForecasts(
        declined,
        { ...season, entries: [...season.entries, enrolled] },
        career.date,
      ));
      // The rounds already behind the clock happened without the player.
      await catchUp();

      return settle();
    }),

    buySeat: (request) => commit(async () => {
      const { career, season } = await seasonNow();
      if (career.kind === 'championship') throw new AppError('standalone.enter');
      const {
        listing, entry, edition, events,
      } = await enterable(career, season, request);
      const sale = saleSeats(career, season, listing.series, listing.availability, entry, edition)
        .find((one) => one.team === request.team);
      if (!sale) throw new AppError('contract.sale.none', { series: listing.series.name });
      const terms = { ...sale, car: await liveried(sale.car) };

      // Signed through a mail of its own, written as the player asked and
      // answered at once, so the contract has an offer to point back at.
      const drafted = offerMail(season, listing.series, edition, [{ terms, events, rent: 0 }], career.date);
      // A seat bought again after one terminated in the same run is a mail of
      // its own, as its ledger line is.
      const base = seatId(listing.series.id, season.index, edition);
      const taken = career.inbox.filter((one) => one.id === base || one.id.startsWith(`${base}#`)).length;
      const mail: Mail = {
        ...drafted, id: taken === 0 ? base : `${base}#${taken + 1}`, opened: true, deadline: career.date,
      };
      const asked = { ...career, inbox: [...career.inbox, mail] };
      current = await signOffer(asked, season, mail, { entry: terms.entry, team: terms.team });
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
      // A main sponsor backing a car pays half of one a deal year, while the car
      // races on the career's rung or below - in the discipline the deal covers,
      // on that discipline's rung, for one that covers only one.
      const backer = liveDeals(career).find((deal) => deal.perks.some((perk) => perk.kind === 'carBacking')
        && !career.ledger.some((line) => line.key === `sponsor:${deal.id}:car`));
      const share = backer?.perks.find((perk) => perk.kind === 'carBacking')?.share ?? 0;
      const backedRung = backer?.covers ? career.level[backer.covers] : bestRung(career.level);
      const backing = backer && await racesAtOrBelow(model, backedRung, backer.covers)
        ? Math.round((price * share) / 100)
        : 0;
      if (price - backing > career.money) throw new AppError('career.car.short', { price: price - backing, money: career.money });

      const livery = skin ?? names.car.skins[0]?.id;
      const painted = livery === undefined ? {} : { skin: livery };
      const at = currentSeason(career)?.index ?? 0;
      const paid = post(career, [
        purchaseLine(career, model, names.name, names.livery(livery), price),
        ...(backer && backing > 0 ? [{
          ...sponsorLine(backer, 'carBacking', `sponsor:${backer.id}:car`, backing, { date: career.date, season: at }),
          car: { model, name: names.name },
        }] : []),
      ]);
      // A car being rented is the player's own from its next round, in the
      // livery bought - the round already paid for keeps its rent. What a
      // sponsor backed is not the player's to sell back.
      current = withSeason(
        { ...paid, garage: [...career.garage, { model, ...painted, paid: price - backing, bought: career.date }] },
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
      // A historic event the season drew is left altogether, open to enter again.
      if (isHistoric(held)) {
        current = leaveHistoric(career, season, held);

        return settle();
      }
      // A session out at the game would land on a round already given up.
      const progress = race.progress();
      if (progress?.inFlight && held.events.some((event) => event.raceId === progress.raceId)) {
        throw new AppError('run.inFlight');
      }
      // Under a contract, withdrawing is terminating it: the release fee is
      // paid, and a paid seat gives part of its price back.
      const contract = activeContract(held);
      if (contract) {
        const { left, release, refund } = termination(held);
        if (release > career.money) throw new AppError('contract.release.short', { fee: release, money: career.money });
        current = post(career, [
          ...(release > 0 ? [releaseLine(career, season, held, contract, release, left)] : []),
          ...(refund > 0 ? [refundLine(career, season, held, contract, refund, left)] : []),
        ]);
      }

      replaceEntry(season, held, {
        ...held,
        ...(contract ? { contract: { ...contract, ended: career.date } } : {}),
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

    answer: ({ mail: id, answer, offer: pick }) => commit(async () => {
      const { career, season } = await seasonNow();
      const mail = career.inbox.find((one) => one.id === id);
      if (!mail) throw new AppError('mail.notFound');
      if (mail.sponsor) {
        if (answer === 'accepted') current = signSponsor(career, mail);
        else if (mailStatus(mail, career.date) === 'awaiting') current = withReply(career, mail, 'declined');
        else throw new AppError('sponsor.closed', { sponsor: mail.sponsor.sponsor.name });

        return settle();
      }
      const first = mail.offers?.[0];
      if (first) {
        if (answer === 'accepted') current = await signOffer(career, season, mail, pick);
        else if (mailStatus(mail, career.date) === 'awaiting') current = withReply(career, mail, 'declined');
        else throw new AppError('contract.closed', { team: first.teamName, series: first.seriesName });
        await catchUp();

        return settle();
      }
      // Only an invitation of the season being raced can still be answered.
      const draw = historicDraws(season).find((one) => one.raceId === mail.invitation?.raceId) ?? null;
      const state = draw ? invitationState(career, season, draw) : null;
      const closed = new AppError('mail.closed', { event: draw?.championship.name ?? mail.invitation?.series ?? id });

      if (answer === 'accepted') {
        if (!draw || state !== 'awaiting') throw closed;
        current = await joinInvitation(career, season, draw, mail);
      } else if (state === 'awaiting') {
        current = withReply(career, mail, 'declined');
      } else {
        // Declining one already accepted takes the player out of the event.
        const held = draw && state === 'accepted' ? enteredEntry(season, draw.series, 0) : null;
        if (!held) throw closed;
        current = leaveHistoric(career, season, held);
      }

      return settle();
    }),

    endSponsor: (id) => commit(async () => {
      const career = await ensure();
      const deal = liveDeals(career).find((one) => one.id === id);
      if (!deal) throw new AppError('sponsor.notFound');
      const ended = endSponsor(career, deal, 'mine');
      if (ended.money < 0 && ended.money < career.money) {
        throw new AppError('sponsor.repay.short', { repay: career.money - ended.money, money: career.money });
      }
      current = ended;

      return settle();
    }),

    markAllRead: () => commit(async () => {
      const career = await ensure();
      if (career.inbox.every((one) => one.opened)) return career;
      current = { ...career, inbox: career.inbox.map((one) => (one.opened ? one : { ...one, opened: true })) };

      return settle();
    }),

    markMail: ({ mail: id, opened }) => commit(async () => {
      const career = await ensure();
      if (!career.inbox.some((one) => one.id === id)) throw new AppError('mail.notFound');
      current = { ...career, inbox: career.inbox.map((one) => (one.id === id ? { ...one, opened } : one)) };

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
      const unasked = skip ? undefined : advanceSkips(year, stop)[0] ?? unansweredSkips(working, year, stop)[0];
      if (unasked) throw new AppError('career.event.earlierPending', { event: lostName(unasked) });

      // A move past 31 December closes the year on the way: whatever of it was
      // still to run is given up and raced by the field, and the next opens empty.
      while (stop > year.endDate) {
        // Whatever of the year's invitations the move passes goes out to no one,
        // so none is left waiting on a season gone by.
        working = await sendInvitations(working, addDays(year.endDate, 1));
        year = currentSeason(working) ?? year;
        // Every session of the year is rated by now, each by the settle it landed in.
        // A round left that the install cannot race is no contract's to fine.
        const left = await withUnraceable(year, advanceSkips(year, addDays(year.endDate, 1)));
        working = closeLevels(await simulateMissed(closeSeason(working, year, left)), year);
        const opened = openSeason(year.index + 1, addDays(year.endDate, 1));
        working = { ...working, date: opened.startDate, seasons: [...working.seasons, opened] };
        // A confirmed move draws nothing before where it lands, since nothing
        // drawn on the way was shown to the player as given up.
        year = await drawHistoric(working, opened, skip && date > opened.startDate ? date : opened.startDate);
        working = withSeason(working, year);
        stop = skip ? date : advanceStop(year, working.date, date);
      }

      // An enrolled event the clock has gone right past was never raced.
      const lost = await withUnraceable(year, advanceSkips(year, stop));
      const next = issueForecasts(working, markMissed(year, lost), stop);
      current = withSeason({ ...working, date: stop }, next);
      await catchUp();
      const moved = settle();
      if (year.index !== season.index) await autosave({ kind: 'season', year: seasonYear(year) });

      return moved;
    }),

    async skips(date) {
      const { career, season } = await seasonNow();

      const lost = await withUnraceable(season, advanceSkips(season, date));

      return withLapsed(lost, unansweredSkips(career, season, date));
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

            const fee = entryFeeOf(championship, next.round, entry.id) ?? 0;

            return { series: championship.id, entry: entry.id, cost: fee + rent };
          }));

          return priced.filter((cost) => cost !== null);
        }));

      return perListing.flat();
    },

    async skipping(request) {
      const { career, season } = await seasonNow();
      const held = await heldEvent(season, request);
      const cost = await withUnraceable(season, skipCost(season, held));

      // The round skipped stays last, as the confirmation reads it.
      return [
        ...withLapsed(cost.slice(0, -1), unansweredSkips(career, season, held.event.date)),
        ...cost.slice(-1),
      ];
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
      const lost = await withUnraceable(season, skipCost(season, held));
      const next = issueForecasts(career, markMissed(season, lost), date);
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
      // A historic event is in no library a career reads from: the season's
      // draw holds it.
      const draw = drawOf(season, request.series);
      const held = enteredEvent(season, request.series, request.round, edition, closed);
      // An invitation still to be answered is shown in the seat it offers, so
      // the page plans the event the player would race on accepting it.
      const offer = draw && !held && !closed && invitationState(career, season, draw) === 'awaiting'
        ? invitationMail(career, draw)?.invitation ?? null
        : null;
      const drawnChampionship = draw && offer
        ? withPlayerSeat(structuredClone(draw.championship), offer.entry, offer.seat)
        : draw?.championship;

      const championship = held?.entry.championship ?? drawnChampionship ?? listing?.series;
      if (!championship) throw new AppError('series.notFound', { series: request.series });
      if (!held) checkEdition(championship, edition);

      const classEntry = championship.entries.find((one) => one.id === (held?.entry.entry ?? offer?.entry ?? ''))
        ?? championship.entries[0];
      const salt = seasonSalt(career, season.index, edition);
      // A championship the career is not in is dated as if entered today, and
      // a historic event on the day it was drawn for.
      let dated: SeasonEvent[] = [];
      if (draw && !held) dated = [drawnEvent(draw, career.date, classEntry.id)];
      else if (!held) dated = materialiseEvents(championship, season, edition, career.date, classEntry.id);
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
      // An invitation still to be answered, as the entry accepting it would
      // make - its field drawn as accepting draws it - which is what launching
      // it does.
      const invited: EnteredEvent | null = offer && draw ? {
        entry: {
          series: draw.series,
          edition: 0,
          championship,
          entry: offer.entry,
          playerSeat: offer.seat,
          car: offer.car,
          field: await historic.drawField(championship, offer.entry, salt),
          events: [event],
          standings: buildStandings(championship, [], new Date().toISOString()),
          historic: true,
        },
        event,
      } : null;
      const launching = held ?? invited;
      const raceable = launching ? heldRaceable(availability, launching) : roundRaceableIn(availability, request.round);
      // A career not yet in the championship has no car, so its event is
      // planned in the first one the class could field - the sessions, their
      // lengths and their weather do not depend on which.
      const firstCar = eligibleCarsIn(availability, request.round, classEntry.id)[0];
      const car = launching?.entry.car ?? (firstCar ? { model: firstCar } : null);

      let plan: EventPlan | null = null;
      if (car && raceable) {
        try {
          const definition = await lowerEvent(championship, {
            entry: classEntry.id, round: request.round, car, draw: event.forecast, field: launching?.entry.field,
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
      const allowSameDay = career.settings.allowSameDayEvents;
      const contract = held ? activeContract(held.entry) : null;
      /**
       * The team entering a class on the player's own puts them in, as
       * entering draws it - for a championship of a career not yet in it.
       * @param one The class
       * @returns The team, or null where there is none to say
       */
      const drawnTeamOf = (one: ClassEntry) => {
        const drawnSeat = held || draw || career.kind !== 'career' ? null : drawnTeam(championship, one, salt);
        if (!drawnSeat) return null;

        return {
          name: drawnSeat.team.name,
          budget: drawnSeat.team.budget ?? null,
          nation: drawnSeat.team.nationCode ?? null,
        };
      };

      /**
       * The seats a class's privateers sell - for a championship of a career
       * not yet in it, in a season still being raced.
       * @param one The class
       * @returns The seats, the cheapest first
       */
      const forSaleOf = async (one: ClassEntry): Promise<SeatSale[]> => {
        if (held || draw || closed || career.kind !== 'career' || !listing) return [];

        return Promise.all(saleSeats(career, season, championship, availability, one, edition).map(async (terms) => ({
          team: terms.team,
          name: terms.teamName,
          nation: terms.nation ?? null,
          car: await liveried(terms.car),
          price: terms.amount,
        })));
      };
      const forSale = new Map(await Promise.all(championship.entries.map(async (one) => (
        [one.id, await forSaleOf(one)] as const
      ))));

      let blocked: AppErrorInfo | null = appErrorInfo('career.event.notEntered', { series: championship.name });
      if (closed) blocked = appErrorInfo('career.season.closed', { year: seasonYear(season) });
      else if (launching) blocked = launchBlock(season, launching, raceable, allowSameDay);
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
          // A historic event is open to anyone, whatever their level.
          eligible: draw !== null || isEligible(one.ladder, openLevels(career.level)),
          cars: eligibleCarsIn(availability, enterAt, one.id),
          fee: career.kind === 'career' ? entryFeeOf(championship, enterAt, one.id) || null : null,
          team: drawnTeamOf(one),
          forSale: forSale.get(one.id) ?? [],
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
          // An invitation still to be answered launches too, accepting it.
          !closed && !!launching && event.status === 'scheduled',
        ) : [],
        blocked,
        // An invitation still to be answered costs nothing, which the team covers.
        money: launching && career.kind === 'career' ? {
          fee: held ? feeOf(held.entry, held.event) : null,
          paid: held ? feePaid(career, held.event) : false,
          sponsor: held ? coveringSponsor(career, held.entry, held.event)?.sponsor.name ?? null : null,
          rent: owed?.roundRent ?? null,
          rentPaid: held ? rentPaid(career, held.event) : false,
          balance: career.money,
          contract: held && contract ? {
            team: contract.teamName,
            covered: coveredFee(contract, held.event.entryFee ?? 0),
            salary: roundSalary(contract, held.entry.events.length),
            salaryPaid: salaryPaid(career, held.event),
            share: contract.prizeShare,
            fine: roundFine(held.entry, held.event),
          } : null,
        } : null,
        // An invitation still to be answered that is not this event's lapses
        // on the way, as the rounds lost do.
        skips: !closed && launching && event.status === 'scheduled'
          ? withLapsed(
            await withUnraceable(season, launchSkips(season, launching, allowSameDay)),
            unansweredSkips(career, season, launching.event.date, !allowSameDay, launching.event.raceId),
          )
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
        historic: draw ? {
          description: championship.description ?? null,
          event: championship,
          availability,
          seat: held?.entry.playerSeat ?? offer?.seat ?? null,
          invitation: historicInvitation(career, season, draw, availability, held?.entry ?? null),
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

      // A historic event the player is not in, raced by its field on the day
      // the season drew it for.
      const draw = drawOf(season, request.series);
      if (draw) {
        return {
          championship: draw.championship,
          season: season.index,
          edition: 0,
          rounds: [roundResult(simulatedEvent(
            draw.championship,
            drawnEvent(draw, career.date, draw.championship.entries[0]?.id ?? ''),
            seasonSalt(career, season.index),
          ))],
          playerSeat: null,
          playerEntry: null,
        };
      }

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
      const now = await seasonNow();
      // Launching an invitation still to be answered accepts it on the way -
      // kept, as everything a launch changes is, only once the launch is away.
      const accepted = request.accept ? await acceptOnLaunch(now.career, now.season, request.series) : null;
      const career = accepted ?? now.career;
      const season = currentSeason(career) ?? now.season;
      const held = await heldEvent(season, request);
      const allowSameDay = career.settings.allowSameDayEvents;

      const availability = await series.validate(held.entry.championship);
      const block = launchBlock(season, held, heldRaceable(availability, held), allowSameDay);
      if (block) throw new AppError(block.code, block.params);
      // Paid as the first session goes out, and never into debt.
      const { fee, rent } = await owedFor(career, held);
      if (fee + rent > career.money) throw new AppError('career.money.short', { fee: fee + rent, money: career.money });

      // What this event costs the rest of the season, which the player has to
      // have been shown and agreed to - an event on the same day included,
      // unless the career allows two on one day.
      const lost = withLapsed(
        await withUnraceable(season, launchSkips(season, held, allowSameDay)),
        unansweredSkips(career, season, held.event.date, !allowSameDay, held.event.raceId),
      );
      if (lost.length > 0 && !request.skip) {
        const partway = lost.find((one) => one.reason === 'partway');
        if (partway) throw new AppError('career.event.otherInProgress', { event: lostName(partway) });
        // An invitation on the event's own day is lost to the clash, not earlier.
        const earlier = lost.find((one) => one.reason !== 'clash' && !(
          one.reason === 'unanswered' && one.date === held.event.date
        ));
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
      if (changed || fee > 0 || rent > 0 || accepted) {
        // An invitation on the launched event's own day would still be waiting
        // with the clock on that day, so giving it up declines it.
        const given = lost.flatMap((one) => {
          const draw = one.reason === 'unanswered' && one.date === date ? drawOf(season, one.series) : null;
          const mail = draw && invitationMail(career, draw);

          return mail ? [mail] : [];
        });
        const next = given.reduce(
          (answered, mail) => withReply(answered, mail, 'declined'),
          changed ? withSeason({ ...career, date }, moved) : career,
        );
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
