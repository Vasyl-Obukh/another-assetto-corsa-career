import { DownloadIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { UpdateHookState } from './types.ts';
import type { UpdateStatus } from '../../../../shared/types';
import { useToast } from '@/app';
import { useAppError } from '@/i18n';
import { FAILED_ACCENT } from '@/lib/accents';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { UpdateHookState } from './types.ts';

/**
 * The installed version and its update, kept current: main pushes every move
 * of a check or a download.
 * @returns The status, and the three things the player can do about it
 */
export const useUpdate = (): UpdateHookState => {
  const { t } = useTranslation();
  const { show } = useToast();
  const describeError = useAppError();
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    let live = true;
    invoke('update:get', undefined).then(
      (next) => { if (live) setStatus(next); },
      () => { /* nothing to offer until main answers */ },
    );

    return () => { live = false; };
  }, []);

  useEffect(() => subscribe('update:changed', setStatus), []);

  const check = useCallback((): void => {
    void invoke('update:check', undefined).then(setStatus, () => { /* the push says how it ended */ });
  }, []);

  const download = useCallback((): void => {
    void invoke('update:download', undefined).then(setStatus, () => { /* the push says how it ended */ });
  }, []);

  const install = useCallback((): void => {
    void invoke('update:install', undefined).catch((thrown: unknown) => {
      show({
        icon: DownloadIcon,
        tone: FAILED_ACCENT,
        title: t('update.installFailed'),
        detail: describeError(toDisplayableError(thrown)),
      });
    });
  }, [show, t, describeError]);

  return {
    status, check, download, install,
  };
};
