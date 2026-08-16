// The only bridge across contextIsolation. It exposes exactly one object and
// forwards nothing else - no fs, no child_process, no ipcRenderer itself.
//
// Built as CommonJS: a sandboxed preload cannot be an ES module.

import { contextBridge, ipcRenderer } from 'electron';

import type {
  IpcChannel,
  IpcEventName,
  IpcEvents,
  IpcRequest,
  IpcResponse,
  IpcResult,
  RendererApi,
} from '../shared/types/index.ts';

const api: RendererApi = {
  invoke<C extends IpcChannel>(channel: C, request: IpcRequest<C>): Promise<IpcResult<IpcResponse<C>>> {
    return ipcRenderer.invoke(channel, request) as Promise<IpcResult<IpcResponse<C>>>;
  },

  on<E extends IpcEventName>(event: E, listener: (payload: IpcEvents[E]) => void): () => void {
    // The IpcRendererEvent is deliberately not forwarded; the renderer has no
    // business with sender ids or ports.
    const wrapped = (_event: unknown, payload: IpcEvents[E]): void => listener(payload);
    ipcRenderer.on(event, wrapped);

    return () => { ipcRenderer.off(event, wrapped); };
  },
};

contextBridge.exposeInMainWorld('api', api);
