// Unwrapping the IpcResult envelope, so callers can use ordinary try/catch.

import { IpcCallError } from './utils.ts';
import type {
  IpcChannel,
  IpcEventName,
  IpcEvents,
  IpcRequest,
  IpcResponse,
} from '../../../../shared/types';

export { IpcCallError } from './utils.ts';

/**
 * Calls a main-process handler and unwraps its result.
 * @param channel Which channel to call
 * @param request The request payload for that channel
 * @returns The handler's value
 * @throws IpcCallError when the handler reported a failure
 */
export const invoke = async <C extends IpcChannel>(
  channel: C,
  request: IpcRequest<C>,
): Promise<IpcResponse<C>> => {
  const result = await window.api.invoke(channel, request);
  if (!result.ok) throw new IpcCallError(channel, result.error.message, result.error.detail);

  return result.value;
};

/**
 * Subscribes to a main-process push.
 * @param event Which event to listen for
 * @param listener Called with the event payload
 * @returns A function that removes the listener
 */
export const subscribe = <E extends IpcEventName>(
  event: E,
  listener: (payload: IpcEvents[E]) => void,
): () => void => window.api.on(event, listener);
