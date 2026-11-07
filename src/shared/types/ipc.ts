// The main <-> renderer contract. Main, preload and renderer all derive their
// types from IpcContract, so a channel cannot drift out of sync on one side
// without failing to compile on the others.

import type {
  ClassCommandResult, ClassId, ClassLayer, SpecId,
} from './car-classes.ts';
import type { CarAppraisal } from './car-prices.ts';
import type {
  CarBacking,
  Career,
  CareerBackup,
  CareerCalendar,
  CareerDriver,
  CareerEventView,
  CareerKind,
  CareerListing,
  CareerSettings,
  ChampionshipPreview,
  ChampionshipResults,
  NewCareerRequest,
  NewChampionshipRequest,
  RestoredCareer,
  RoundCost,
  SkippedRound,
  WrittenBackup,
} from './career.ts';
import type { CmArguments, CmFlag } from './cm-arguments.ts';
import type {
  CarFacets, CarQuery, Page, TrackFacets, TrackQuery,
} from './content-query.ts';
import type {
  Car,
  ContentChange,
  ContentIssue,
  ContentSummary,
  Track,
  TrackGroup,
  Weather,
  WeatherController,
} from './content.ts';
import type { OfferPick } from './contract.ts';
import type { MailAnswer } from './inbox.ts';
import type { PathOverrides, PathsReport } from './paths.ts';
import type { QuickRace, QuickRaceArchives, QuickRaceView } from './quick-race.ts';
import type { LatestResults, RaceSetup, ResultRecord } from './race-run.ts';
import type { CareerSaves, LoadedSave, SaveSummary } from './saves.ts';
import type {
  Championship,
  SeriesAvailability,
  SeriesCommandResult,
  SeriesImportResult,
  SeriesLibrary,
  SeriesListing,
} from './series.ts';
import type { ResolvedTheme, Settings } from './settings.ts';
import type { ErrorCode, ErrorParams } from '../errors/types.ts';

/**
 * Every request/response channel, keyed by channel name.
 */
export interface IpcContract {
  /**
   * Locate Content Manager, the AC root and the Documents folder.
   */
  'paths:probe': { req: void; res: PathsReport };
  /**
   * Replace the user's path overrides, then probe again.
   */
  'paths:override': { req: PathOverrides; res: PathsReport };
  /**
   * Open a native folder or file picker in main; resolves null when cancelled.
   */
  'paths:pick': { req: { kind: keyof PathOverrides }; res: string | null };
  /**
   * Scan installed content, returning counts only.
   *
   * Cache-backed: without `force` it re-checks fingerprints and re-reads only
   * what moved, so this is cheap enough to call on mount. With `force` it reads
   * every folder again, which is what the Rescan button means.
   */
  'content:scan': { req: { force?: boolean }; res: ContentSummary };
  /**
   * One page of cars, searched, filtered and sorted.
   */
  'content:cars': { req: CarQuery; res: Page<Car> };
  /**
   * One page of tracks, searched, filtered and sorted, each with the layouts
   * that matched gathered under it.
   */
  'content:tracks': { req: TrackQuery; res: Page<TrackGroup> };
  /**
   * One car by folder ID, or null when nothing is installed under it.
   *
   * Null rather than an error: content:cars searches name, brand, folder ID and
   * tags alike, so it cannot resolve a single car, and a car uninstalled while
   * its page is open is an ordinary outcome rather than a failure.
   *
   * Answered over the library unless `installed` is set, which looks over
   * everything installed - the car page, since Your content opens mods the
   * library does not hold yet.
   */
  'content:car': { req: { id: string; installed?: boolean }; res: Car | null };
  /**
   * A car the user added as the Edit price dialog shows it. Null when it is not
   * installed, as content:car is.
   */
  'content:appraisal': { req: { id: string }; res: CarAppraisal | null };
  /**
   * Counts behind the car browser's filter lists, for the filters now applied.
   */
  'content:carFacets': { req: { query?: CarQuery }; res: CarFacets };
  /**
   * Counts behind the track browser's filter lists, for the filters now applied.
   */
  'content:trackFacets': { req: { query?: TrackQuery }; res: TrackFacets };
  /**
   * One track layout by its key - the folder ID for a single-layout track,
   * "<id>/<layout>" otherwise.
   *
   * Null rather than an error, for the same reason content:car is: a search
   * cannot resolve a single track, and a track uninstalled while it is named by
   * a race is an ordinary outcome rather than a failure.
   */
  'content:track': { req: { key: string }; res: Track | null };
  /**
   * One circuit by folder ID, with every layout installed under it, or null
   * when nothing is installed under that ID - for the track page. Answered over
   * everything installed rather than the library alone, since Your content opens
   * circuits the library does not hold yet.
   */
  'content:circuit': { req: { id: string }; res: TrackGroup | null };
  /**
   * Every installed weather preset and CSP weather controller.
   *
   * Not paged or filtered: a large library holds thousands of cars and a few
   * dozen weathers, so the race setup screen takes the lot and puts them in a
   * pair of menus.
   */
  'content:weather': { req: void; res: { weather: Weather[]; controllers: WeatherController[] } };
  /**
   * Everything the last scan found broken, so it can be reported rather than
   * silently missing.
   */
  'content:issues': { req: void; res: ContentIssue[] };
  /**
   * The race being set up, how it splits into launches, and what is stopping it.
   */
  'race:get': { req: void; res: RaceSetup };
  /**
   * Stop waiting for a result, without advancing the event.
   */
  'race:cancel': { req: void; res: RaceSetup };
  /**
   * Every result the app has archived, newest first.
   */
  'race:results': { req: void; res: ResultRecord[] };
  /**
   * The newest event's archives and how many there are in all, for Home's
   * preview - which reads a handful of files rather than every one.
   */
  'race:latest': { req: void; res: LatestResults };
  /**
   * One archived result by file name.
   */
  'race:result': { req: { file: string }; res: ResultRecord };
  /**
   * Every race event of the player's own, the ones part-way first.
   */
  'quick:list': { req: void; res: QuickRaceView[] };
  /**
   * Which archives each race event of the player's own wrote, for the Results
   * page to link them back to it. Read off the files alone, without planning
   * any race, so it is cheap enough for Home.
   */
  'quick:archives': { req: void; res: QuickRaceArchives[] };
  /**
   * One race event of the player's own.
   */
  'quick:get': { req: { id: string }; res: QuickRaceView };
  /**
   * Make a new race event, with nothing picked yet.
   */
  'quick:create': { req: void; res: QuickRaceView };
  /**
   * Replace a race event that has not started. The whole race rather than a
   * patch, as with every other document main owns.
   */
  'quick:save': { req: QuickRace; res: QuickRaceView };
  /**
   * Copy a race event, leaving its results behind.
   */
  'quick:duplicate': { req: { id: string }; res: QuickRaceView };
  /**
   * Delete a race event. Its archived results stay with every other result.
   */
  'quick:remove': { req: { id: string }; res: void };
  /**
   * Launch the next session of a race event. The result arrives later, as a
   * quick:changed push.
   */
  'quick:launch': { req: { id: string }; res: QuickRaceView };
  /**
   * Throw away what has run of a race event, so it can be changed and run
   * again.
   */
  'quick:restart': { req: { id: string }; res: QuickRaceView };
  /**
   * Set a race event's own step on the AI's strength - the one thing about it
   * that may still change once a session has run, reaching the sessions after.
   */
  'quick:strength': { req: { id: string; strength: number }; res: QuickRaceView };
  /**
   * Every championship the app knows, each with whether it can be raced.
   *
   * Not paged, and carrying whole championships rather than summaries: a
   * championship is a few kilobytes of plain JSON and the library is a handful
   * of them, which is nothing beside the mod library content:cars pages for.
   * Summaries would cost the detail screen a second round trip and leave two
   * payloads to keep in step for no measurable gain.
   */
  'series:list': { req: void; res: SeriesLibrary };
  /**
   * One championship by id, or null when the library has none.
   *
   * Null rather than an error, for the same reason content:car is: a deep link
   * to a series that is no longer shipped is an ordinary outcome.
   */
  'series:get': { req: { id: string }; res: SeriesListing | null };
  /**
   * What is wrong with a championship as it currently stands, without writing
   * anything.
   *
   * A whole availability rather than a bare problem list, because the editor
   * wants both halves - what does not validate, and what is not installed -
   * and main has the content scan in hand.
   */
  'series:validate': { req: { series: Championship }; res: SeriesAvailability };
  /**
   * Write a championship the user owns back over its own file.
   *
   * The id is sent alongside the document and the two must agree. A document
   * that does not validate is written anyway, as an imported one is; see
   * SeriesStore.save for what is refused.
   */
  'series:save': { req: { id: string; series: Championship }; res: SeriesListing };
  /**
   * Take a copy of a championship the app ships, under its own id.
   *
   * The copy replaces the original rather than sitting beside it, since a user
   * file carrying a shipped id is exactly what `adjusted` means - so this is
   * both "fork it" and "disable the app's own" in one write.
   */
  'series:customise': { req: { id: string }; res: SeriesCommandResult };
  /**
   * Copy a championship into a separate one of the user's own.
   *
   * The id of the copy is main's to pick and is not sent: only main knows what
   * is taken, since a file that failed to parse owns its name without appearing
   * in the library at all. The name is sent, because it is user-visible copy
   * and translating it here would bake English into a Ukrainian library.
   */
  'series:duplicate': { req: { id: string; name?: string }; res: SeriesCommandResult };
  /**
   * Write a championship of the user's own for the first time.
   *
   * The whole document is sent, because it was drafted in the editor and
   * nothing was written while it was being made. The id is main's to pick, for
   * the same reason a copy's is, and whatever the draft carried is replaced.
   */
  'series:create': { req: { series: Championship }; res: SeriesCommandResult };
  /**
   * Delete the user's version of a championship the app ships, putting the
   * app's own back.
   */
  'series:revert': { req: { id: string }; res: SeriesCommandResult };
  /**
   * Delete one of the user's own championships. Nothing takes its place.
   */
  'series:delete': { req: { id: string }; res: SeriesCommandResult };
  /**
   * Read a championship file the user picks into their library.
   *
   * Null when they cancelled, matching paths:pick. Neither outcome of an id
   * collision is destructive, so the file is read and written in one step
   * rather than stopping to ask: taking over a shipped id is undone by
   * reverting, and a copy that had to be renamed is undone by deleting it.
   */
  'series:import': { req: void; res: SeriesImportResult | null };
  /**
   * Write one championship out as a file the user can share.
   *
   * Resolves the path written, or null when they cancelled the dialog.
   */
  'series:export': { req: { id: string }; res: string | null };
  /**
   * Every historic event the app knows, each with whether it can be raced.
   *
   * A historic event is a one-round championship kept in a library of its own,
   * so each of these answers exactly as its series: counterpart does - only
   * over that library.
   */
  'historic:list': { req: void; res: SeriesLibrary };
  /**
   * One historic event by id, or null when the library has none.
   */
  'historic:get': { req: { id: string }; res: SeriesListing | null };
  /**
   * What is wrong with a historic event as it stands, writing nothing.
   */
  'historic:validate': { req: { series: Championship }; res: SeriesAvailability };
  /**
   * Write a historic event the user owns back over its own file.
   */
  'historic:save': { req: { id: string; series: Championship }; res: SeriesListing };
  /**
   * Take a copy of a historic event the app ships, under its own id, which
   * replaces the app's own until it is reverted.
   */
  'historic:customise': { req: { id: string }; res: SeriesCommandResult };
  /**
   * Copy a historic event into a separate one of the user's own.
   */
  'historic:duplicate': { req: { id: string; name?: string }; res: SeriesCommandResult };
  /**
   * Write a historic event of the user's own for the first time.
   */
  'historic:create': { req: { series: Championship }; res: SeriesCommandResult };
  /**
   * Delete the user's version of a historic event the app ships.
   */
  'historic:revert': { req: { id: string }; res: SeriesCommandResult };
  /**
   * Delete one of the user's own historic events.
   */
  'historic:delete': { req: { id: string }; res: SeriesCommandResult };
  /**
   * Read a historic event file the user picks into their library, as
   * series:import reads a championship.
   */
  'historic:import': { req: void; res: SeriesImportResult | null };
  /**
   * Write one historic event out as a file the user can share.
   */
  'historic:export': { req: { id: string }; res: string | null };
  /**
   * The user's layer over the shipped class catalogue.
   *
   * The layer rather than the resolved catalogue: the catalogue holds maps,
   * which do not survive the trip, and the renderer resolves the same answer
   * from the layer with the same shared function.
   */
  'classes:get': { req: void; res: ClassLayer };
  /**
   * Restate which specs a car races in. An empty list leaves it deliberately
   * unclassified; specs matching what the app ships drop the override.
   */
  'classes:assignCar': { req: { car: string; specs: SpecId[] }; res: ClassCommandResult };
  /**
   * Put a car back to whatever the app ships for it.
   */
  'classes:revertCar': { req: { car: string }; res: ClassCommandResult };
  /**
   * Add a class of the user's, or rename one. The id of a new class is main's
   * to mint.
   */
  'classes:saveClass': { req: { id?: ClassId; name: string }; res: ClassCommandResult };
  /**
   * Delete a class of the user's and every spec in it, once no championship
   * races in any of them.
   */
  'classes:deleteClass': { req: { id: ClassId }; res: ClassCommandResult };
  /**
   * Copy a class, shipped or the user's, into a new class of the user's, with
   * a copy of every spec in it and the same cars in each.
   */
  'classes:copyClass': { req: { id: ClassId; name: string }; res: ClassCommandResult };
  /**
   * Add a spec of the user's, or rename or move one.
   */
  'classes:saveSpec': {
    req: { id?: SpecId; name: string; class: ClassId };
    res: ClassCommandResult;
  };
  /**
   * Save a spec and the cars in it as one edit: a new spec or a rename of one
   * of the user's, then its cars restated. A spec the app ships keeps its name
   * and has only its cars restated. Resolves the spec's id.
   */
  'classes:saveSpecCars': {
    req: { spec: { id?: SpecId; name: string; class: ClassId }; cars: string[] };
    res: ClassCommandResult;
  };
  /**
   * Delete a spec of the user's, once no championship races in it.
   */
  'classes:deleteSpec': { req: { id: SpecId }; res: ClassCommandResult };
  /**
   * The open career as it stands, or null when none is - the start screen.
   */
  'career:get': { req: void; res: Career | null };
  /**
   * Every career of one kind on disk, played most recently first.
   */
  'career:list': { req: { kind: CareerKind }; res: CareerListing[] };
  /**
   * Start a new career, and open it.
   */
  'career:create': { req: NewCareerRequest; res: Career };
  /**
   * Start a standalone championship, entered in the class and car asked for,
   * and open it.
   */
  'career:createChampionship': { req: NewChampionshipRequest; res: Career };
  /**
   * A championship's rounds dated as a standalone championship would race
   * them in the year asked for.
   */
  'career:preview': { req: { series: string; year: number }; res: ChampionshipPreview };
  /**
   * Open a career, closing whichever was open.
   */
  'career:open': { req: { id: string }; res: Career };
  /**
   * Close the open career, which is going back to the start screen. Refused
   * while a launch is out.
   */
  'career:close': { req: void; res: null };
  /**
   * Delete a career and its folder, answering with every career of its kind
   * left.
   */
  'career:delete': { req: { id: string }; res: CareerListing[] };
  /**
   * Show a career's folder in the system's file browser.
   */
  'career:folder': { req: { id: string }; res: null };
  /**
   * Back a career up into a zip, asking where with the system's own dialog.
   * Null when the dialog was cancelled.
   */
  'career:backup': { req: { id: string }; res: WrittenBackup | null };
  /**
   * Pick a backup with the system's own dialog and read it, restoring nothing
   * yet - refused when it holds a career of another kind than the one asked
   * for. Null when the dialog was cancelled.
   */
  'career:openBackup': { req: { kind: CareerKind }; res: CareerBackup | null };
  /**
   * Restore a career from a backup `career:openBackup` read.
   */
  'career:restore': { req: { file: string; replace: boolean }; res: RestoredCareer };
  /**
   * Show a backup just written in the system's file browser.
   */
  'career:showBackup': { req: { file: string }; res: null };
  /**
   * Rename the open career's driver, or change their nation.
   */
  'career:driver': { req: CareerDriver; res: Career };
  /**
   * Change the open career's own settings.
   */
  'career:settings': { req: Partial<CareerSettings>; res: Career };
  /**
   * Every save a career has, newest first.
   */
  'career:saves': { req: { id: string }; res: SaveSummary[] };
  /**
   * Save the open career under a name - as a save of its own, or over one of
   * its named saves - answering with its saves.
   */
  'career:save': { req: { name: string; over?: string }; res: SaveSummary[] };
  /**
   * Write the open career over its quick save, answering with its saves.
   */
  'career:quickSave': { req: void; res: SaveSummary[] };
  /**
   * Open a career as one of its saves holds it, closing whichever was open.
   * Asks nothing; refused while a launch is out.
   */
  'career:load': { req: { id: string; save: string }; res: LoadedSave };
  /**
   * Rename one of a career's named saves, answering with its saves.
   */
  'career:renameSave': { req: { id: string; save: string; name: string }; res: SaveSummary[] };
  /**
   * Delete one of a career's named saves, answering with its saves.
   */
  'career:deleteSave': { req: { id: string; save: string }; res: SaveSummary[] };
  /**
   * Show a career's saves folder in the system's file browser.
   */
  'career:savesFolder': { req: { id: string }; res: null };
  /**
   * One season's calendar, merged across every championship and dated.
   *
   * Derived on every call rather than stored, because it joins three things
   * that move independently: the career, the championship library and what is
   * installed. The current season when no season is named.
   */
  'career:calendar': { req: { season?: number }; res: CareerCalendar };
  /**
   * Enter an edition of a championship for the current season - the one named,
   * or the one still to come when none is - in a car the career owns, or else
   * rents.
   */
  'career:enrol': {
    req: { series: string; entry: string; car: { model: string; skin?: string }; edition?: number };
    res: Career;
  };
  /**
   * Buy a car into the career's garage, in a livery. A car the career is
   * renting races in it, owned, from its next round.
   */
  'career:buyCar': { req: { model: string; skin?: string; backed?: boolean }; res: Career };
  /**
   * Which cars the career's main sponsor can pay half of, null with none.
   */
  'career:carBacking': { req: void; res: CarBacking | null };
  /**
   * Buy a privateer's seat in a class for one edition, signed at once.
   */
  'career:buySeat': { req: { series: string; entry: string; team: string; edition?: number; backed?: boolean }; res: Career };
  /**
   * Sell a car out of the garage. Whatever still races it races it rented.
   */
  'career:sellCar': { req: { model: string }; res: Career };
  /**
   * Repaint a car in the garage, which every round still to come races in.
   */
  'career:repaintCar': { req: { model: string; skin: string }; res: Career };
  /**
   * Pull out of an edition of a championship, marking everything still to come
   * as missed.
   */
  'career:withdraw': { req: { series: string; entry: string; edition?: number }; res: Career };
  /**
   * Answer a mail that wants an answer: accepting an invitation enters its
   * event in the seat offered, and declining gives the seat back - one already
   * accepted until the event's first session runs. Accepting a seat offer signs
   * the one picked, and declines the rest.
   */
  'career:answer': { req: { mail: string; answer: MailAnswer; offer?: OfferPick; backed?: boolean }; res: Career };
  /**
   * End a sponsor's deal early, repaying the share of its signing bonus its
   * year has left.
   */
  'career:endSponsor': { req: { deal: string }; res: Career };
  /**
   * Mark a mail opened, or unread again.
   */
  'career:markMail': { req: { mail: string; opened: boolean }; res: Career };
  /**
   * Mark every mail in the inbox opened.
   */
  'career:markAllRead': { req: void; res: Career };
  /**
   * Set the player's own step on the AI's strength for an edition the career is
   * in - for every round of it, or for the one round named. Reaches the next
   * session launched, never one already run.
   */
  'career:strength': {
    req: { series: string; edition?: number; round?: string; strength: number };
    res: Career;
  };
  /**
   * Move the clock forward, stopping at the first enrolled event on the way -
   * or, with `skip`, all the way to the date, marking every round of the
   * career's it passes a non-start. `skip` is what the player confirmed after
   * `career:skips` listed them.
   */
  'career:advance': { req: { date: string; skip?: boolean }; res: Career };
  /**
   * The rounds of the career's that moving the clock to a date would cost.
   */
  'career:skips': { req: { date: string }; res: SkippedRound[] };
  /**
   * What a round of each class of each championship that can be raced costs
   * the career, for the Championships page to say which it can afford. Empty
   * for a standalone championship, which has no money.
   */
  'career:roundCosts': { req: void; res: RoundCost[] };
  /**
   * One round as the event page shows it: its sessions, what has run of them,
   * and what the career can do next. Of any season and edition - the current
   * season, and the edition the career is in or else the one still to come,
   * when none is named. A round of a closed season is read-only.
   */
  'career:event': {
    req: { series: string; round: string; season?: number; edition?: number };
    res: CareerEventView;
  };
  /**
   * An edition of a championship so far: the career's own rounds when it is in
   * it, and otherwise every round behind the clock simulated. Defaults as
   * `career:event` does.
   */
  'career:results': { req: { series: string; season?: number; edition?: number }; res: ChampionshipResults };
  /**
   * The rounds skipping a round the install cannot race would cost - the
   * round itself last.
   */
  'career:skipping': { req: { series: string; round: string; edition?: number }; res: SkippedRound[] };
  /**
   * Skip a round the install cannot race, after `career:skipping` listed what
   * it costs: the clock moves to its day, and every round listed becomes a
   * non-start.
   */
  'career:skip': { req: { series: string; round: string; edition?: number }; res: Career };
  /**
   * Run the next session of a round the career is in, setting the round up
   * first when the race being run is another event. A round that would leave
   * others unraced is refused unless `skip` says the player confirmed it.
   * `scale` shortens a race by one of the steps its length offers, for this
   * launch alone, and `accept` accepts the invitation to a historic event still
   * to be answered on the way.
   */
  'career:launch': {
    req: { series: string; round: string; edition?: number; skip?: boolean; scale?: number; accept?: boolean };
    res: RaceSetup;
  };
  /**
   * What Content Manager's Arguments.txt holds.
   *
   * Read off disk on every call rather than mirrored into settings: the user
   * may edit that file by hand, and a copy of ours would go stale silently.
   */
  'cm:arguments': { req: void; res: CmArguments };
  /**
   * Add or remove one of Content Manager's startup flags, leaving every other
   * line in the file alone.
   */
  'cm:setArgument': { req: { flag: CmFlag; enabled: boolean }; res: CmArguments };
  /**
   * Read the current settings.
   */
  'settings:get': { req: void; res: Settings };
  /**
   * Merge a patch into the settings and persist them.
   */
  'settings:patch': { req: Partial<Settings>; res: Settings };
  /**
   * The theme actually in force - "system" resolved against the OS by main.
   */
  'theme:get': { req: void; res: ResolvedTheme };
  /**
   * Quit the app, which the start screen's Exit and the slot menu's do. Every
   * store writes what it holds on the way out.
   */
  'app:quit': { req: void; res: null };
}

/**
 * The name of a request/response channel.
 */
export type IpcChannel = keyof IpcContract;

/**
 * The request payload for a given channel.
 */
export type IpcRequest<C extends IpcChannel> = IpcContract[C]['req'];

/**
 * The response payload for a given channel.
 */
export type IpcResponse<C extends IpcChannel> = IpcContract[C]['res'];

/**
 * Pushes from main that the renderer subscribes to.
 */
export interface IpcEvents {
  /**
   * The resolved theme changed, either by choice or because the OS changed.
   */
  'theme:changed': ResolvedTheme;
  /**
   * Settings changed somewhere other than the caller.
   */
  'settings:changed': Settings;
  /**
   * Content was installed or removed while the app was open.
   */
  'content:changed': ContentChange;
  /**
   * The race being set up changed, or the launch in flight moved on.
   *
   * One payload rather than several events: a launch finishing changes the
   * status, the event progress and what the next launch will be at the same
   * instant, and pushing those separately would let the screen paint a state
   * that never existed.
   */
  'race:changed': RaceSetup;
  /**
   * A race event of the player's own changed, or a launch of one moved on.
   * Carries every one of them, which is what quick:list answers.
   */
  'quick:changed': QuickRaceView[];
  /**
   * The championship library changed, because a command wrote or deleted one of
   * the user's files.
   *
   * Pushed as well as returned, because two screens read the library at once: a
   * duplicate performed on the detail screen has to reach the list mounted
   * behind it. Carries the whole library, which is the same value series:list
   * answers, so a listener needs no round trip of its own.
   */
  'series:changed': SeriesLibrary;
  /**
   * The historic event library changed, because a command wrote or deleted one
   * of the user's files. Pushed for the reason series:changed is.
   */
  'historic:changed': SeriesLibrary;
  /**
   * The user's class layer changed, because a command wrote it.
   *
   * Pushed for the same reason series:changed is: a spec's cars restated in
   * settings has to reach the browser and the championship editor behind it.
   */
  'classes:changed': ClassLayer;
  /**
   * The open career, after every command that changes it, or null once it has
   * closed.
   *
   * The whole career rather than the part that moved: advancing the clock can
   * mark several events missed at once, and every command changes what the
   * calendar screen renders.
   */
  'career:changed': Career | null;
  /**
   * A career's saves, whenever one is written, renamed or deleted - by hand or
   * by an autosave the renderer did not ask for.
   */
  'career:savesChanged': CareerSaves;
}

/**
 * The name of a main-to-renderer event.
 */
export type IpcEventName = keyof IpcEvents;

/**
 * A failure, flattened into something that survives being sent between processes.
 */
export interface IpcError {
  /**
   * What went wrong, in English. Shown as-is when there is no code to translate.
   */
  message: string;
  /**
   * Which error this is, absent when it came from the OS rather than from us.
   */
  code?: ErrorCode;
  /**
   * Values to interpolate into the translated template.
   */
  params?: ErrorParams;
  /**
   * The original stack, for the console.
   */
  detail?: string;
}

/**
 * The envelope every handler resolves.
 *
 * Electron flattens a thrown Error into an unhelpful string across the boundary,
 * and this project's whole philosophy is failing loudly with a readable reason,
 * so handlers return one of these instead of throwing.
 */
export type IpcResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: IpcError };

/**
 * The surface preload exposes on window.api.
 */
export interface RendererApi {
  /**
   * Call a main-process handler.
   * @param channel Which channel to call
   * @param request The request payload for that channel
   * @returns The handler's result, wrapped in a success or failure envelope
   */
  invoke<C extends IpcChannel>(channel: C, request: IpcRequest<C>): Promise<IpcResult<IpcResponse<C>>>;
  /**
   * Subscribe to a main-process push.
   * @param event Which event to listen for
   * @param listener Called with the event payload
   * @returns A function that removes the listener
   */
  on<E extends IpcEventName>(event: E, listener: (payload: IpcEvents[E]) => void): () => void;
}
