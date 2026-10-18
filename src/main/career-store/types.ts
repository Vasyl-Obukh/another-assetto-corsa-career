import type {
  Career,
  CareerBackup,
  CareerCalendar,
  CareerDriver,
  CareerEventView,
  CareerListing,
  CareerProfile,
  CareerSaves,
  CareerSettings,
  CareerState,
  ChampionshipResults,
  LoadedSave,
  NewCareerRequest,
  RaceSetup,
  RestoredCareer,
  SaveSummary,
  SeasonEntry,
  SeasonEvent,
  SkippedRound,
  WrittenBackup,
} from '../../shared/types/index.ts';
import type { ZipEntry } from '../zip-archive/index.ts';

/**
 * What a career's backup holds, read and checked.
 */
export interface BackupContents {
  /**
   * The career's profile, as its career.json holds it.
   */
  profile: CareerProfile;
  /**
   * Where it had got to: its state.json, or else its newest save that reads.
   */
  state: CareerState;
  /**
   * When it was backed up, or null when the backup does not say.
   */
  backedUpAt: string | null;
  /**
   * How many of its saves read.
   */
  saves: number;
  /**
   * How many archived results it holds.
   */
  results: number;
  /**
   * Every file of it a career's folder keeps, by its path in the folder.
   */
  files: ZipEntry[];
}

/**
 * A save to write by hand.
 */
export interface SaveRequest {
  /**
   * The name to save under.
   */
  name: string;
  /**
   * The named save to write over, by id, or absent for a save of its own.
   */
  over?: string;
}

/**
 * One round of a championship the career is in, with the season entry it
 * belongs to.
 */
export interface EnteredEvent {
  /**
   * The championship as the career entered it.
   */
  entry: SeasonEntry;
  /**
   * The round, dated.
   */
  event: SeasonEvent;
}

/**
 * A step on the AI's strength, for an edition or one round of it.
 */
export interface StrengthRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * Which of the season's editions - the one being raced when omitted.
   */
  edition?: number;
  /**
   * The round the step is for, or omitted for every round of the edition.
   */
  round?: string;
  /**
   * The step, zero for none.
   */
  strength: number;
}

/**
 * Which round of which championship a command is about.
 */
export interface EventRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * The round's id.
   */
  round: string;
  /**
   * Which season, counting from zero - the current one when omitted. Only read
   * back: a round of a closed season cannot be raced.
   */
  season?: number;
  /**
   * Which of the season's editions, counting from zero - the one the career is
   * racing when omitted, or else the one still to come.
   */
  edition?: number;
}

/**
 * Which edition of which championship a results read is about.
 */
export interface ResultsRequest {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * Which season, counting from zero - the current one when omitted.
   */
  season?: number;
  /**
   * Which of the season's editions, counting from zero, defaulting as
   * `EventRequest.edition` does.
   */
  edition?: number;
}

/**
 * What entering a championship is told.
 */
export interface EnrolRequest {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which class of it, by its class entry id.
   */
  entry: string;
  /**
   * The car the season will be raced in.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when one was picked.
     */
    skin?: string;
  };
  /**
   * Which of the season's editions, counting from zero - the one still to
   * come when omitted.
   */
  edition?: number;
}

/**
 * Every career on disk, the one open held in memory, and the commands that
 * change it.
 *
 * Commands rather than patches: each one validates before it applies, so the
 * renderer cannot write a career into a state the rules do not allow. Every one
 * of them returns the whole career, because every one of them changes what the
 * calendar screen renders. Every command but the ones that pick a career works
 * on the one open, and refuses when none is.
 */
export interface CareerStore {
  /**
   * Reads the open career as it stands.
   * @returns The career, or null when none is open - the start screen
   */
  get(): Career | null;
  /**
   * Every career on disk, played most recently first. One that cannot be read
   * is left out and said so in the log.
   * @returns What the start screen and the Careers list show of each
   */
  list(): Promise<CareerListing[]>;
  /**
   * Starts a new career and opens it.
   * @param request Who races it, the year it opens in, its level and its money
   * @returns The career, opened
   * @throws When the request is not one a career can start from, or a launch
   * is in flight
   */
  create(request: NewCareerRequest): Promise<Career>;
  /**
   * Opens a career, closing whichever was open.
   * @param id The career's id
   * @returns The career, caught up on anything its clock has passed
   * @throws When there is no such career, it cannot be read, or a launch is in
   * flight
   */
  open(id: string): Promise<Career>;
  /**
   * Closes the open career, which is going back to the start screen.
   * @returns Resolves once it is written
   * @throws When a launch is in flight, since its result would land nowhere
   */
  close(): Promise<void>;
  /**
   * Deletes a career and everything in its folder.
   * @param id The career's id
   * @returns Every career left
   * @throws When it is the one open, or there is no such career
   */
  remove(id: string): Promise<CareerListing[]>;
  /**
   * The folder a career is kept in, for the system's file browser.
   * @param id The career's id
   * @returns The folder's path
   * @throws When there is no such career
   */
  folderOf(id: string): Promise<string>;
  /**
   * The name a career's backup is offered under.
   * @param id The career's id
   * @returns The file's name
   * @throws When there is no such career, or it does not read
   */
  backupName(id: string): Promise<string>;
  /**
   * Backs a career up into one zip: its profile, its state, its saves and its
   * archived results.
   * @param id The career's id
   * @param file Where to write the zip
   * @returns What was written
   * @throws When there is no such career
   */
  backup(id: string, file: string): Promise<WrittenBackup>;
  /**
   * Reads a backup without restoring anything of it.
   * @param file The zip
   * @returns The career it holds, and whether that career is here already
   * @throws When it is not a zip, or holds no career that reads
   */
  readBackup(file: string): Promise<CareerBackup>;
  /**
   * Restores a career from its backup.
   * @param file The zip
   * @param replace Whether a copy of the career already here is replaced -
   * otherwise the backup comes back beside it, as a career of its own
   * @returns The career's id, and every career
   * @throws When the backup does not read, or the career it would replace is
   * the one open
   */
  restore(file: string, replace: boolean): Promise<RestoredCareer>;
  /**
   * Renames the open career's driver, or changes their nation.
   * @param driver Who races it now
   * @returns The career
   * @throws When the name is empty or the nation is none Assetto Corsa has
   */
  setDriver(driver: CareerDriver): Promise<Career>;
  /**
   * Changes the open career's own settings - following the app's opponents or
   * driving aids again with null, or setting its own.
   * @param patch The settings to replace
   * @returns The career
   */
  setSettings(patch: Partial<CareerSettings>): Promise<Career>;
  /**
   * Every save a career has - none for a career that is not there.
   * @param id The career's id
   * @returns Its saves, newest first
   * @throws When the id is no career's
   */
  saves(id: string): Promise<SaveSummary[]>;
  /**
   * Saves the open career under a name, as a save of its own or over one of
   * the named saves it already has.
   * @param request The name, and the named save to write over, if any
   * @returns The career's saves
   * @throws When no career is open, the name is empty, or the save to write
   * over is no named save of the career's
   */
  save(request: SaveRequest): Promise<SaveSummary[]>;
  /**
   * Writes the open career over its quick save.
   * @returns The career's saves
   * @throws When no career is open
   */
  quickSave(): Promise<SaveSummary[]>;
  /**
   * Opens a career as one of its saves holds it, closing whichever was open.
   * What the career held before is replaced, and asked about by no one.
   * @param id The career's id
   * @param save The save's id
   * @returns The career, and the save it came from
   * @throws When a launch is out, or there is no such save or it cannot be read
   */
  load(id: string, save: string): Promise<LoadedSave>;
  /**
   * Renames one of a career's named saves.
   * @param id The career's id
   * @param save The save's id
   * @param name Its new name
   * @returns The career's saves
   * @throws When the save is no named save, or the name is empty
   */
  renameSave(id: string, save: string, name: string): Promise<SaveSummary[]>;
  /**
   * Deletes one of a career's named saves.
   * @param id The career's id
   * @param save The save's id
   * @returns The career's saves
   * @throws When the save is no named save of the career's
   */
  deleteSave(id: string, save: string): Promise<SaveSummary[]>;
  /**
   * The folder a career's saves are kept in, made if it is not there yet, for
   * the system's file browser.
   * @param id The career's id
   * @returns The folder's path
   * @throws When there is no such career
   */
  savesFolderOf(id: string): Promise<string>;
  /**
   * Composes the calendar for a season, joining the career against the
   * championship library and the installed content.
   * @param season Which season, counting from zero; the current one by default
   * @returns The dated, merged calendar
   */
  calendar(season?: number): Promise<CareerCalendar>;
  /**
   * Enters an edition of a championship for the current season.
   * @param request Which championship, which class, in what, and which edition
   * @returns The career with the edition entered
   * @throws When the championship cannot be entered
   */
  enrol(request: EnrolRequest): Promise<Career>;
  /**
   * Pulls out of an edition of a championship, marking everything still to
   * come as missed.
   * @param request Which championship, class and edition to leave - the
   * edition being raced when it names none
   * @returns The career
   * @throws When that championship was not entered
   */
  withdraw(request: { series: string; entry: string; edition?: number }): Promise<Career>;
  /**
   * Sets the player's own step on the AI's strength for an edition the career
   * is in: for every round of it, or for the one round named. Read at every
   * launch, so it reaches the next session and never one already run.
   * @param request Which championship and edition - the one being raced when
   * it names none - which round, if only one, and the step, zero for none
   * @returns The career
   * @throws When the edition is not entered, the round has been run, or the
   * step moves the AI further than a step may
   */
  strength(request: StrengthRequest): Promise<Career>;
  /**
   * Moves the clock forward, stopping at the first enrolled event on the way
   * - or, once the player has confirmed what it costs, all the way. A move past
   * 31 December closes the season and opens the next, empty.
   * @param date The ISO date to advance towards
   * @param skip Whether to go all the way, marking every round of the career's
   * passed on the way, and an event left part-way, as non-starts
   * @returns The career, with the clock wherever it stopped
   * @throws When the date is behind the clock, a launch is out, or the move
   * would lose rounds and was not confirmed
   */
  advanceTo(date: string, skip?: boolean): Promise<Career>;
  /**
   * What moving the clock to a date would cost, for the player to confirm.
   * @param date The ISO date the clock would move to
   * @returns Every round of the career's it would leave unraced
   */
  skips(date: string): Promise<SkippedRound[]>;
  /**
   * One round as the event page shows it, of any season - a closed one's
   * read-only.
   * @param request Which championship and round, and which season and edition
   * @returns The round, its sessions and what the career can do with it
   * @throws When no championship the career or the library holds has it
   */
  event(request: EventRequest): Promise<CareerEventView>;
  /**
   * An edition of a championship so far.
   *
   * The career's own rounds when it is in the edition. Otherwise every round
   * behind the clock is simulated on the spot and nothing is stored - the same
   * round always simulates the same, so there is nothing to keep.
   * @param request Which championship, and which season and edition
   * @returns Every round and what it left
   * @throws When neither the career nor the library holds the championship
   */
  results(request: ResultsRequest): Promise<ChampionshipResults>;
  /**
   * Runs the next session of a round the career is in.
   *
   * Sets the round up first when the race being run is some other event, and
   * moves the clock to the event when it is still ahead.
   * @param request Which championship, round and edition, whether the player
   * confirmed losing the rounds `skips` on its event view lists, and the factor
   * a race is shortened by - one or absent for the full race
   * @returns The race as it stands once the launch has started
   * @throws When the round cannot be raced now, saying why, or the next launch
   * cannot be shortened by that much
   */
  launch(request: Omit<EventRequest, 'season'> & { skip?: boolean; scale?: number }): Promise<RaceSetup>;
  /**
   * Forces any pending write to complete. Call before quitting.
   * @returns Resolves once nothing is left to write
   */
  flush(): Promise<void>;
  /**
   * Subscribes to changes.
   * @param listener Called with the open career after every command, and with
   * null when it closes
   * @returns A function that removes the listener
   */
  onChange(listener: (career: Career | null) => void): () => void;
  /**
   * Subscribes to a career's saves changing.
   * @param listener Called with the career's saves whenever one is written,
   * renamed or deleted
   * @returns A function that removes the listener
   */
  onSaves(listener: (saves: CareerSaves) => void): () => void;
}
