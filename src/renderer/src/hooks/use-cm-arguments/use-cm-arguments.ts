import { useCallback, useEffect, useState } from 'react';

import type { CmArgumentsState } from './types.ts';
import type { CmArguments, CmFlag } from '../../../../shared/types';
import { invoke, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { CmArgumentsState } from './types.ts';

/**
 * Content Manager's startup flags, read straight off its own Arguments.txt.
 *
 * Nothing is mirrored into settings and nothing is cached across mounts: the
 * user may edit that file by hand or through Content Manager, so the file is
 * the state and every answer comes from a fresh read.
 * @returns What the file holds, and the action that changes it
 */
export const useCmArguments = (): CmArgumentsState => {
  const [args, setArgs] = useState<CmArguments | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  useEffect(() => {
    let live = true;

    invoke('cm:arguments', undefined).then(
      (next) => { if (live) { setArgs(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, []);

  const toggle = useCallback((flag: CmFlag, enabled: boolean): void => {
    setBusy(true);
    setError(null);

    void invoke('cm:setArgument', { flag, enabled }).then(
      (next) => { setArgs(next); setBusy(false); },
      (thrown: unknown) => { setError(toDisplayableError(thrown)); setBusy(false); },
    );
  }, []);

  return {
    arguments: args,
    loading,
    busy,
    error,
    toggle,
    dismissError: () => setError(null),
  };
};
