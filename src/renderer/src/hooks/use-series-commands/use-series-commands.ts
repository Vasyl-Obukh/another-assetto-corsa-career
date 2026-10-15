import { useCallback, useState } from 'react';

import type { SeriesCommandsState } from './types.ts';
import type { IpcChannel, IpcRequest, IpcResponse } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, toDisplayableError } from '@/lib/ipc';
import { SERIES_CHANNELS } from '@/lib/series-kind';
import type { SeriesKind } from '@/lib/series-kind';

export type { SeriesCommandsState } from './types.ts';

/**
 * The commands that write the user's own championships.
 *
 * Nothing here updates local state on success: main pushes `series:changed`
 * with the whole library and both screens listen, so splicing an answer in
 * here would give them two paths to the same truth.
 * @param kind Which library the commands write - the championships unless it
 * says otherwise
 * @returns The commands, and whether one is running
 */
export const useSeriesCommands = (kind: SeriesKind = 'series'): SeriesCommandsState => {
  const channels = SERIES_CHANNELS[kind];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  /**
   * Runs one command, carrying the busy flag and the error for all of them.
   * @param channel Which channel to call
   * @param request What to send it
   * @param onFail What to answer with when it fails
   * @returns What main answered, or the failure value
   */
  const run = useCallback(async <C extends IpcChannel, F>(
    channel: C,
    request: IpcRequest<C>,
    onFail: F,
  ): Promise<IpcResponse<C> | F> => {
    setBusy(true);
    try {
      const answer = await invoke(channel, request);
      setError(null);

      return answer;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return onFail;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    busy,
    error,
    dismissError: () => setError(null),

    customise: useCallback(
      async (id) => (await run(channels.customise, { id }, null)) !== null,
      [run, channels],
    ),

    duplicate: useCallback(
      async (id, name) => (await run(channels.duplicate, { id, name }, null))?.id ?? null,
      [run, channels],
    ),

    create: useCallback(
      async (series) => (await run(channels.create, { series }, null))?.id ?? null,
      [run, channels],
    ),

    revert: useCallback(
      async (id) => (await run(channels.revert, { id }, null)) !== null,
      [run, channels],
    ),

    remove: useCallback(
      async (id) => (await run(channels.remove, { id }, null)) !== null,
      [run, channels],
    ),

    exportSeries: useCallback(
      async (id) => run(channels.exportFile, { id }, null),
      [run, channels],
    ),

    importSeries: useCallback(
      async () => run(channels.importFile, undefined, null),
      [run, channels],
    ),
  };
};
