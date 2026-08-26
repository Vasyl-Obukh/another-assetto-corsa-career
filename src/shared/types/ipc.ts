// The main <-> renderer contract. Main, preload and renderer all derive their
// types from IpcContract, so a channel cannot drift out of sync on one side
// without failing to compile on the others.

import type {
  CarFacets, CarQuery, Page, TrackFacets, TrackQuery,
} from './content-query.ts';
import type {
  Car, ContentChange, ContentIssue, ContentSummary, TrackGroup,
} from './content.ts';
import type { PathOverrides, PathsReport } from './paths.ts';
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
   * Everything the last scan found broken, so it can be reported rather than
   * silently missing.
   */
  'content:issues': { req: void; res: ContentIssue[] };
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
