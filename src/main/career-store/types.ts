import type {
  Career,
  CareerBackup,
  CareerCalendar,
  CareerDriver,
  CareerEventView,
  CareerKind,
  CareerListing,
  CareerProfile,
  CareerSaves,
  CareerSettings,
  CareerState,
  ChampionshipPreview,
  ChampionshipResults,
  ContractTerms,
  LoadedSave,
  MailAnswer,
  NewCareerRequest,
  NewChampionshipRequest,
  OfferPick,
  RaceSetup,
  RestoredCareer,
  RoundCost,
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
 * What answering a mail is asked with.
 */
export interface AnswerRequest {
  /**
   * The mail, by its id.
   */
  mail: string;
  /**
   * The answer.
   */
  answer: MailAnswer;
  /**
   * Which of a seat offer's offers is accepted - needed only where it holds
   * more than one.
   */
  offer?: OfferPick;
}

/**
 * One class's seat offer, drawn and waiting to be mailed with the rest of its
 * edition's.
 */
export interface OfferDraft {
  /**
   * What the team offers.
   */
  terms: ContractTerms;
  /**
   * The edition's rounds in the class offered, dated.
   */
  events: readonly Pick<SeasonEvent, 'date' | 'entryFee'>[];
  /**
   * A round's rent of the cheapest car the class may be raced in.
   */
  rent: number;
}

/**
 * What launching a round's next session is asked with.
 */
export interface LaunchRequest extends Omit<EventRequest, 'season'> {
  /**
   * Whether the player confirmed losing the rounds the event view's `skips`
   * lists.
   */
  skip?: boolean;
  /**
   * The factor the race is shortened by, one or absent for the full race.
   */
  scale?: number;
  /**
   * Whether launching accepts the invitation to a historic event still to be
   * answered, which enters it in the seat offered first.
   */
  accept?: boolean;
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
   * The car the season will be raced in - owned, in the garage's livery, when
   * the career has it, and rented otherwise.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when one was picked - a rented car's alone.
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
   * Every career of one kind on disk, played most recently first. One that
   * cannot be read is listed as unreadable and said so in the log.
   * @param kind Careers, or standalone championships
   * @returns What the start screen and the Careers list show of each
   */
  list(kind: CareerKind): Promise<CareerListing[]>;
  /**
   * Starts a new career and opens it.
   * @param request Who races it, the year it opens in, its level and its money
   * @returns The career, opened
   * @throws When the request is not one a career can start from, or a launch
   * is in flight
   */
  create(request: NewCareerRequest): Promise<Career>;
  /**
   * Starts a standalone championship and opens it: the year's first edition of
   * the championship asked for, entered in the class and car asked for, and
   * nothing else on its calendar.
   * @param request Who races it, the year, the championship, the class and the
   * car
   * @returns The championship, opened
   * @throws When the championship is not one that can be raced, the class or
   * the car is not one of it, or a launch is in flight
   */
  createChampionship(request: NewChampionshipRequest): Promise<Career>;
  /**
   * Dates a championship's rounds as a standalone championship would race them
   * in a year, making nothing.
   * @param series The championship's id
   * @param year The year
   * @returns Each round's race day
   * @throws When there is no such championship, or the year is out of range
   */
  preview(series: string, year: number): Promise<ChampionshipPreview>;
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
   * @returns Every career of its kind left
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
   * @param kind The kind of career the page asking restores
   * @returns The career it holds, and whether that career is here already
   * @throws When it is not a zip, holds no career that reads, or holds one of
   * the other kind
   */
  readBackup(file: string, kind: CareerKind): Promise<CareerBackup>;
  /**
   * Restores a career from its backup.
   * @param file The zip
   * @param replace Whether a copy of the career already here is replaced -
   * otherwise the backup comes back beside it, as a career of its own
   * @returns The career's id, and every career of its kind
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
   * Buys a car into the garage. Every entry renting it races it owned, in the
   * livery bought, from its next round.
   * @param request Which car, and which livery
   * @returns The career
   * @throws When the car is owned already, is not in the library, or costs
   * more than the career holds
   */
  buyCar(request: { model: string; skin?: string }): Promise<Career>;
  /**
   * Buys a privateer's seat in a championship's class for one edition, signed
   * at once through a mail written already accepted: the team's car, every fee
   * covered, every prize the player's. Any team's offer for the edition still
   * waiting is declined.
   * @param request The championship, the class, the team and the edition
   * @returns The career
   * @throws When the class is not open to the career, the edition is entered
   * already or over, the team sells no seat in it, or the seat costs more than
   * the career holds
   */
  buySeat(request: { series: string; entry: string; team: string; edition?: number }): Promise<Career>;
  /**
   * Sells a car out of the garage, at what it is worth today. Every entry
   * still racing it races the rest of its rounds rented.
   * @param model Which car
   * @returns The career
   * @throws When it is not owned, or a round is under way in it
   */
  sellCar(model: string): Promise<Career>;
  /**
   * Repaints a car in the garage, which every round still to come races in.
   * @param request Which car, and its new livery
   * @returns The career
   * @throws When it is not owned, already wears that livery, or the repaint
   * costs more than the career holds
   */
  repaintCar(request: { model: string; skin: string }): Promise<Career>;
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
   * Answers a mail that wants an answer. Accepting an invitation enters its
   * event in the seat it offers; declining one gives the seat back, and an
   * invitation already accepted may still be declined until its first session
   * has run, which takes the player out of the event again.
   * @param request Which mail, and the answer
   * @returns The career
   * @throws When there is no such mail, it has been answered that way or can
   * no longer be, or a launch of its event is out
   */
  answer(request: AnswerRequest): Promise<Career>;
  /**
   * Ends a sponsor's deal early, repaying the share of its signing bonus its
   * year has left.
   * @param deal The deal, by id
   * @returns The career
   * @throws When there is no such deal still running, or the repayment is more
   * than the career holds
   */
  endSponsor(deal: string): Promise<Career>;
  /**
   * Marks a mail opened, or unread again.
   * @param request Which mail, and whether it is opened
   * @returns The career
   * @throws When there is no such mail
   */
  markMail(request: { mail: string; opened: boolean }): Promise<Career>;
  /**
   * Marks every mail in the inbox opened, whatever season it came in.
   * @returns The career - the same one when nothing was unread
   */
  markAllRead(): Promise<Career>;
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
   * What a round of each class of each championship that can be raced costs
   * the career to race.
   * @returns A cost per class, none for a class nothing installed can enter,
   * and none at all in a standalone championship
   */
  roundCosts(): Promise<RoundCost[]>;
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
   * What skipping a round the install cannot race would cost, for the player
   * to confirm.
   * @param request Which championship, round and edition
   * @returns The round, and every round of the career's skipping it leaves
   * unraced
   * @throws When the career is not in the round
   */
  skipping(request: Omit<EventRequest, 'season'>): Promise<SkippedRound[]>;
  /**
   * Skips a round the install cannot race: the clock moves to its day, and it
   * and every round `skipping` listed become non-starts, raced by the field
   * with a stand-in in the player's seat. A standalone championship's clock
   * moves this way and no other, so it never leaves its one season.
   * @param request Which championship, round and edition
   * @returns The career, with the clock on the round's day
   * @throws When the career is not in the round, it can be raced or is over,
   * or a launch is out
   */
  skip(request: Omit<EventRequest, 'season'>): Promise<Career>;
  /**
   * Runs the next session of a round the career is in.
   *
   * Sets the round up first when the race being run is some other event, and
   * moves the clock to the event when it is still ahead.
   * @param request Which championship, round and edition, whether the player
   * confirmed losing the rounds `skips` on its event view lists, the factor
   * a race is shortened by - one or absent for the full race - and whether
   * launching accepts the invitation to a historic event still to be answered
   * @returns The race as it stands once the launch has started
   * @throws When the round cannot be raced now, saying why, or the next launch
   * cannot be shortened by that much
   */
  launch(request: LaunchRequest): Promise<RaceSetup>;
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
