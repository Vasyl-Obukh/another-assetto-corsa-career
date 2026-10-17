import {
  FlagIcon, FolderInputIcon, TriangleAlertIcon, ZapIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LoadSave } from './types.ts';
import { useSlot, useToast, useUnsaved } from '@/app';
import { loadedTitle } from '@/components/saves';
import { useAppError, useFormat } from '@/i18n';
import { CAUTION_ACCENT, SAVE_KIND_ACCENT } from '@/lib/accents';
import { toDisplayableError } from '@/lib/ipc';

/**
 * Loads saves, saying in a toast what was loaded and where the clock now
 * stands - loading asks nothing beforehand, so this is all the player is told,
 * unless the page open holds unsaved changes, which it asks before losing. A
 * refusal is said the same way, a race still out above all.
 * @returns The command, and whether a load is in flight
 */
export const useLoadSave = (): LoadSave => {
  const { t } = useTranslation();
  const { formatDay, formatAgo } = useFormat();
  const describeError = useAppError();
  const { loadSave } = useSlot();
  const { show } = useToast();
  const { leave } = useUnsaved();
  const [loading, setLoading] = useState(false);

  const load = useCallback((career: string, save: string): Promise<boolean> => leave('load', async () => {
    setLoading(true);
    try {
      const { save: loaded } = await loadSave(career, save);
      show({
        icon: loaded.kind === 'quick' ? ZapIcon : FolderInputIcon,
        tone: SAVE_KIND_ACCENT[loaded.kind],
        title: loadedTitle(loaded, t),
        detail: t('saves.toast.back', { date: formatDay(loaded.date), ago: formatAgo(loaded.savedAt) }),
      });

      return true;
    } catch (thrown: unknown) {
      const error = toDisplayableError(thrown);
      show(error.code === 'run.inFlight'
        ? {
          icon: FlagIcon, tone: CAUTION_ACCENT, title: t('saves.toast.racing'), detail: t('saves.toast.racingHint'),
        }
        : {
          icon: TriangleAlertIcon, tone: CAUTION_ACCENT, title: t('saves.toast.failed'), detail: describeError(error),
        });

      return false;
    } finally {
      setLoading(false);
    }
  }), [describeError, formatAgo, formatDay, leave, loadSave, show, t]);

  return { load, loading };
};
