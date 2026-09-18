import { useCallback, useState } from 'react';

import type { ClassChannel, ClassCommandsState } from './types.ts';
import type { ClassCommandResult, IpcRequest } from '../../../../shared/types';
import { useClasses } from '@/app';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, toDisplayableError } from '@/lib/ipc';

export type { ClassCommandsState } from './types.ts';

/**
 * The commands that write the user's class layer.
 *
 * The answer is adopted as soon as it arrives rather than waiting for main's
 * push, so the dialog that sent it closes onto chips that already say what it
 * did. The push still arrives, and carries the same layer.
 * @returns The commands, and whether one is running
 */
export const useClassCommands = (): ClassCommandsState => {
  const { adopt } = useClasses();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  /**
   * Runs one command, carrying the busy flag and the error for all of them.
   * @param channel Which channel to call
   * @param request What to send it
   * @returns What main answered, or null when it failed
   */
  const run = useCallback(async <C extends ClassChannel>(
    channel: C,
    request: IpcRequest<C>,
  ): Promise<ClassCommandResult | null> => {
    setBusy(true);
    try {
      const answer = await invoke(channel, request);
      adopt(answer.layer);
      setError(null);

      return answer;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return null;
    } finally {
      setBusy(false);
    }
  }, [adopt]);

  return {
    busy,
    error,
    dismissError: () => setError(null),

    assignCar: useCallback(
      async (car, specs) => (await run('classes:assignCar', { car, specs })) !== null,
      [run],
    ),

    revertCar: useCallback(
      async (car) => (await run('classes:revertCar', { car })) !== null,
      [run],
    ),

    saveClass: useCallback(
      async (draft) => (await run('classes:saveClass', draft))?.id ?? null,
      [run],
    ),

    deleteClass: useCallback(
      async (id) => (await run('classes:deleteClass', { id })) !== null,
      [run],
    ),

    copyClass: useCallback(
      async (id, name) => (await run('classes:copyClass', { id, name }))?.id ?? null,
      [run],
    ),

    saveSpec: useCallback(
      async (draft) => (await run('classes:saveSpec', draft))?.id ?? null,
      [run],
    ),

    deleteSpec: useCallback(
      async (id) => (await run('classes:deleteSpec', { id })) !== null,
      [run],
    ),
  };
};
