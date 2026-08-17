import { ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';

import { isAppError } from '../../shared/errors/index.ts';
import type {
  IpcChannel,
  IpcError,
  IpcEventName,
  IpcEvents,
  IpcRequest,
  IpcResponse,
  IpcResult,
} from '../../shared/types/index.ts';

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
