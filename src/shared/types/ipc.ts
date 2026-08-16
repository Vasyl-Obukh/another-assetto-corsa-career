// The main <-> renderer contract. Main, preload and renderer all derive their
// types from IpcContract, so a channel cannot drift out of sync on one side
// without failing to compile on the others.

import type { ContentSummary } from './content.ts';
import type { PathOverrides, PathsReport } from './paths.ts';
import type { ResolvedTheme, Settings } from './settings.ts';

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
   */
  'content:scan': { req: { force?: boolean }; res: ContentSummary };
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
   * What went wrong, suitable for showing to the user.
   */
  message: string;
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
