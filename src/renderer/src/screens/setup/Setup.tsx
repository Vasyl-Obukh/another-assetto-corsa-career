import {
  ArrowLeftIcon, ArrowRightIcon, PackageIcon, RefreshCwIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SETUP_STEPS } from './constants.ts';
import { SetupRail } from './SetupRail.tsx';
import { YoursStep } from './YoursStep.tsx';
import type { PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ContentStats, ErrorCard, PathList } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useInstallation } from '@/hooks';
import { useFormat } from '@/i18n';

interface SetupProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const Setup = ({ initialReport }: SetupProps) => {
  const { t } = useTranslation();
  const { formatDuration, formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const install = useInstallation(initialReport);
  const [current, setCurrent] = useState(0);

  const { summary } = install;
  const step = SETUP_STEPS[current];
  const last = current === SETUP_STEPS.length - 1;
  // Each step holds the next back until what it asks for is done: the paths
  // found, then the content scanned. The last asks for nothing.
  let blocked: string | null = null;
  if (step.id === 'paths' && !install.ready) blocked = t('setup.pathsBlocked');
  if (step.id === 'scan' && !summary) blocked = t('setup.scanBlocked');

  return (
    <div className="grid h-full place-items-center overflow-y-auto bg-background p-6">
      <div className="grid min-h-[38rem] w-full max-w-5xl grid-cols-[15rem_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-card shadow-lg">
        <SetupRail current={current} />

        <main className="flex min-w-0 flex-col gap-5 p-8">
          <header className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {t('setup.stepOf', { step: formatNumber(current + 1), total: formatNumber(SETUP_STEPS.length) })}
            </span>
            <h1 className="text-2xl font-semibold">{t(step.title)}</h1>
            <p className="text-sm text-muted-foreground">{t(step.hint)}</p>
          </header>

          {install.error ? <ErrorCard error={install.error} onDismiss={install.dismissError} /> : null}

          {step.id === 'paths' ? (
            <div className="flex flex-col gap-3">
              <PathList
                report={install.report}
                overrides={settings.paths}
                busy={install.busy}
                onPick={install.pick}
                onClear={install.clear}
              />
              <Button variant="outline" size="sm" className="self-start" disabled={install.busy} onClick={install.refresh}>
                <RefreshCwIcon />
                {t('paths.recheck')}
              </Button>
            </div>
          ) : null}

          {step.id === 'scan' ? (
            <div className="flex flex-col gap-4">
              <Button className="self-start" disabled={install.scanning} onClick={install.scan}>
                <RefreshCwIcon className={install.scanning ? 'animate-spin' : undefined} />
                {summary ? t('content.rescan') : t('content.scan')}
              </Button>

              {summary ? (
                <>
                  <ContentStats summary={summary} issues={install.issues} onOpenIssues={install.loadIssues} />
                  {summary.hidden.cars > 0 || summary.hidden.tracks > 0 ? (
                    <p className="flex items-center gap-3 rounded-lg bg-muted px-3.5 py-2.5 text-sm">
                      <PackageIcon className="size-4 shrink-0 text-muted-foreground" />
                      {t('setup.anonymous', {
                        cars: t('content.hiddenCars', { count: summary.hidden.cars }),
                        tracks: t('content.hiddenTracks', { count: summary.hidden.tracks }),
                      })}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          {step.id === 'yours' ? <YoursStep /> : null}

          <footer className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
            <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
              <ArrowLeftIcon />
              {t('setup.back')}
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {blocked ?? (step.id === 'scan' && summary
                  ? t('setup.scanned', { duration: formatDuration(summary.durationMs) })
                  : null)}
              </span>
              <Button
                disabled={blocked !== null}
                onClick={() => (last
                  ? patch({ setupCompletedAt: new Date().toISOString() })
                  : setCurrent(current + 1))}
              >
                {last ? t('setup.start') : t('setup.continue')}
                <ArrowRightIcon />
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
