import { useCallback, useState } from 'react';

import type { SeriesCommandsState } from './types.ts';
import type { IpcChannel, IpcRequest, IpcResponse } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, toDisplayableError } from '@/lib/ipc';

export type { SeriesCommandsState } from './types.ts';

/**
 * The commands that write the user's own championships.
 *
 * Nothing here updates local state on success: main pushes `series:changed`
 * with the whole library and both screens listen, so splicing an answer in
 * here would give them two paths to the same truth.
 * @returns The commands, and whether one is running
 */
export const useSeriesCommands = (): SeriesCommandsState => {
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
      async (id) => (await run('series:customise', { id }, null)) !== null,
      [run],
    ),

    duplicate: useCallback(
      async (id, name) => (await run('series:duplicate', { id, name }, null))?.id ?? null,
      [run],
    ),

    create: useCallback(
      async (series) => (await run('series:create', { series }, null))?.id ?? null,
      [run],
    ),

    revert: useCallback(
      async (id) => (await run('series:revert', { id }, null)) !== null,
      [run],
    ),

    remove: useCallback(
      async (id) => (await run('series:delete', { id }, null)) !== null,
      [run],
    ),

    exportSeries: useCallback(
      async (id) => run('series:export', { id }, null),
      [run],
    ),

    importSeries: useCallback(
      async () => run('series:import', undefined, null),
      [run],
    ),
  };
};
