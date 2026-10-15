import { BrowserWindow, dialog, ipcMain } from 'electron';

import { SERIES_FILE_EXTENSION } from '../../core/series-file/index.ts';
import { isSafeSeriesId } from '../../core/series-library/index.ts';
import { AppError, isAppError } from '../../shared/errors/index.ts';
import type {
  IpcChannel,
  IpcError,
  IpcEventName,
  IpcEvents,
  IpcRequest,
  IpcResponse,
  IpcResult,
  SeriesImportResult,
} from '../../shared/types/index.ts';
import type { SeriesStore } from '../series-store/index.ts';

/**
 * Flattens anything thrown into something that survives the process boundary.
 * @param error Whatever was thrown
 * @returns A message, and the stack when there was one
 */
export const toIpcError = (error: unknown): IpcError => {
  if (!(error instanceof Error)) return { message: String(error) };

  return {
    message: error.message,
    // Only errors we raised ourselves carry a code; an errno from fs or a spawn
    // failure has no translation and travels as its raw message.
    ...(isAppError(error) ? { code: error.code, params: error.params } : {}),
    ...(error.stack ? { detail: error.stack } : {}),
  };
};

/**
 * Registers a handler that answers with a result envelope rather than throwing.
 * @param channel Which channel to answer
 * @param handler Does the work, and may throw freely
 */
export const handle = <C extends IpcChannel>(
  channel: C,
  handler: (request: IpcRequest<C>) => Promise<IpcResponse<C>>,
): void => {
  ipcMain.handle(channel, async (_event, request: IpcRequest<C>): Promise<IpcResult<IpcResponse<C>>> => {
    try {
      return { ok: true, value: await handler(request) };
    } catch (error) {
      console.error(`ipc ${channel} failed`, error);
      return { ok: false, error: toIpcError(error) };
    }
  });
};

/**
 * Pushes an event to a window, if it is still there.
 * @param window The window to push to
 * @param event Which event to send
 * @param payload The event payload
 */
export const send = <E extends IpcEventName>(
  window: BrowserWindow,
  event: E,
  payload: IpcEvents[E],
): void => {
  if (window.isDestroyed()) return;
  window.webContents.send(event, payload);
};

/**
 * The window a native dialog should be parented to.
 *
 * Focused first, then whatever is open: a dialog has to belong to something, or
 * it appears detached and the app stays interactive behind it.
 * @returns The window
 * @throws When there is no window at all, which is the app shutting down
 */
export const focusedWindow = (): BrowserWindow => {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  if (!window) throw new AppError('ipc.noWindow');

  return window;
};

/**
 * A file name to suggest for a championship the user is exporting.
 *
 * Off the name rather than the id, since a minted id is a UUID. Put through
 * `isSafeSeriesId` because it knows more than a character class - `NUL` is a
 * Windows device name, and a very long name is a path nothing can open. Anything
 * it refuses falls back to the id, which is always safe.
 * @param name What the championship is called
 * @param id Its id, used when the name yields nothing usable
 * @returns A file name, without its extension
 */
export const fileNameFor = (name: string, id: string): string => {
  const stem = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return isSafeSeriesId(stem) ? stem : id;
};

/**
 * Asks for a file to read into a library, and reads it.
 * @param store The library to read it into - the championships or the
 * historic events, which are files of the same kind
 * @returns What came in, or null when the dialog was cancelled
 */
export const importInto = async (store: SeriesStore): Promise<SeriesImportResult | null> => {
  const result = await dialog.showOpenDialog(focusedWindow(), {
    properties: ['openFile'],
    filters: [{ name: 'Championship', extensions: ['json'] }],
  });
  const file = result.canceled ? null : result.filePaths[0] ?? null;

  return file === null ? null : store.importFrom(file);
};

/**
 * Asks where to write one of a library's documents, and writes it.
 * @param store The library it is in
 * @param id Its id
 * @returns The path written, or null when the dialog was cancelled
 */
export const exportFrom = async (store: SeriesStore, id: string): Promise<string | null> => {
  // Named after the document, since a minted id is a UUID.
  const listing = await store.get(id);
  const suggested = listing ? fileNameFor(listing.series.name, id) : id;

  // No title: omitted so Windows supplies its own localised "Save As" rather
  // than us pushing a translated string across IPC purely to label a dialog.
  const result = await dialog.showSaveDialog(focusedWindow(), {
    defaultPath: `${suggested}${SERIES_FILE_EXTENSION}`,
    filters: [{ name: 'Championship', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return null;

  await store.exportTo(id, result.filePath);

  return result.filePath;
};
