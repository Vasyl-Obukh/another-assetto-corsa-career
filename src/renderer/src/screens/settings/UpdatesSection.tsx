import {
  DownloadIcon, LoaderCircleIcon, RefreshCwIcon, RotateCwIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { UpdateStatusSkeleton } from './UpdateStatusSkeleton.tsx';
import type { UpdateState } from '../../../../shared/types';
import { useSettings } from '@/app';
import { SettingsSection, SwitchTile } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useUpdate } from '@/hooks';
import { useFormat } from '@/i18n';

export const UpdatesSection = () => {
  const { t } = useTranslation();
  const { formatAgo, formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const {
    status, check, download, install,
  } = useUpdate();
  const state = status?.state ?? null;

  /**
   * The line under the version saying where updating it is up to.
   * @param of The state to word
   * @returns The line
   */
  const describe = (of: UpdateState): string => {
    switch (of.phase) {
      case 'unsupported': return t('update.state.unsupported');
      case 'idle': return t('update.state.idle');
      case 'checking': return t('update.state.checking');
      case 'latest': return t('update.state.latest', { ago: formatAgo(of.checkedAt) });
      case 'available': return t('update.state.available', { version: of.version });
      case 'downloading':
        return t('update.state.downloading', { version: of.version, percent: formatNumber(of.percent) });
      case 'ready': return t('update.state.ready', { version: of.version });
      default:
        return of.version === null
          ? t('update.state.checkFailed')
          : t('update.state.downloadFailed', { version: of.version });
    }
  };

  let action = null;
  if (state?.phase === 'available') {
    action = (
      <Button onClick={download}>
        <DownloadIcon />
        {t('update.download')}
      </Button>
    );
  } else if (state?.phase === 'ready') {
    action = (
      <Button onClick={install}>
        <RotateCwIcon />
        {t('update.header.ready')}
      </Button>
    );
  } else if (state && state.phase !== 'unsupported') {
    const busy = state.phase === 'checking' || state.phase === 'downloading';
    action = (
      <Button variant="outline" disabled={busy} onClick={check}>
        {busy ? <LoaderCircleIcon className="animate-spin" /> : <RefreshCwIcon />}
        {t('update.check')}
      </Button>
    );
  }

  return (
    <SettingsSection id="updates" icon={DownloadIcon} tone="updates" title={t('settings.updates')}>
      <div className="flex max-w-2xl flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
          {status && state ? (
            <>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium tabular-nums">{t('update.version', { version: status.current })}</span>
                <span data-selectable className="text-sm text-muted-foreground">{describe(state)}</span>
              </div>
              {action}
            </>
          ) : <UpdateStatusSkeleton />}
        </div>

        <SwitchTile
          label={t('update.automatic')}
          checked={settings.checkForUpdates}
          onChange={(next) => patch({ checkForUpdates: next })}
        />
      </div>
    </SettingsSection>
  );
};
