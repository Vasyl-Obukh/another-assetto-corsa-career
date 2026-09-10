// The main <-> renderer contract. Main, preload and renderer all derive their
// types from IpcContract, so a channel cannot drift out of sync on one side
// without failing to compile on the others.

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
import type { PathOverrides, PathsReport } from './paths.ts';
import type { RaceSetup, ResultRecord } from './race-run.ts';
import type { RaceDefinition } from './race.ts';
import type {
  SeriesCommandResult, SeriesImportResult, SeriesLibrary, SeriesListing,
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
   */
  'content:car': { req: { id: string }; res: Car | null };
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
   * Replace the race being set up, re-plan it and re-validate it.
   *
   * The renderer sends the whole definition rather than a patch: main owns the
   * value, and a patch would mean the rules living in two places. Weekend
   * progress is discarded when the new definition no longer plans the same
   * launches, since a half-run weekend cannot be carried onto a different one.
   */
  'race:set': { req: RaceDefinition; res: RaceSetup };
  /**
   * Launch the next launch that has not been run, and start watching for its
   * result. Resolves as soon as Content Manager has been handed the URI; the
   * result arrives later as a race:changed push.
   */
  'race:launch': { req: void; res: RaceSetup };
  /**
   * Stop waiting for a result, without advancing the weekend.
   */
  'race:cancel': { req: void; res: RaceSetup };
  /**
   * Forget weekend progress so the race starts again from its first launch.
   */
  'race:reset': { req: void; res: RaceSetup };
  /**
   * Every result the app has archived, newest first.
   */
  'race:results': { req: void; res: ResultRecord[] };
  /**
   * One archived result by file name.
   */
  'race:result': { req: { file: string }; res: ResultRecord };
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
   * Set up one round of a championship as the race being prepared.
   *
   * Lowers the round into an ordinary race definition and hands it to the race
   * store, so a championship round runs through exactly the path a
   * hand-authored weekend does. Resolves the setup the race screen renders, so
   * the renderer's next move is to navigate there.
   */
  'series:setupRound': {
    req: {
      series: string;
      entry: string;
      round: string;
      car: { model: string; skin?: string };
    };
    res: RaceSetup;
  };
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
   * status, the weekend progress and what the next launch will be at the same
   * instant, and pushing those separately would let the screen paint a state
   * that never existed.
   */
  'race:changed': RaceSetup;
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
