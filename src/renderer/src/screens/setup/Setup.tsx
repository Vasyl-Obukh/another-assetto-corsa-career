import {
  ArrowLeftIcon, ArrowRightIcon, PackageIcon, RefreshCwIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SETUP_STEPS } from './constants.ts';
import { SetupRail } from './SetupRail.tsx';
import { isOptional, optionalState } from './utils.ts';
import { YoursStep } from './YoursStep.tsx';
import type { PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ContentStats, ErrorCard, PathList } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useInstallation } from '@/hooks';
import { useFormat } from '@/i18n';
import { ContentSourcesBody } from '@/screens/content-sources';
import { RecommendedTracksBody } from '@/screens/recommended-tracks';

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
  // What the optional steps change, as it stood when the step was arrived at:
  // until something on it moves, its button says the step is being skipped.
  const [arrived, setArrived] = useState('');

  const { summary } = install;
  const step = SETUP_STEPS[current];
  const last = current === SETUP_STEPS.length - 1;
  // Each step holds the next back until what it asks for is done: the paths
  // found, then the content scanned. The rest ask for nothing.
  let blocked: string | null = null;
  if (step.id === 'paths' && !install.ready) blocked = t('setup.pathsBlocked');
  if (step.id === 'scan' && !summary) blocked = t('setup.scanBlocked');
  const untouched = isOptional(step.id) && optionalState(settings, step.id) === arrived;

  /**
   * Moves to another step, noting what an optional one stands at.
   * @param index The step's index
   */
  const go = (index: number): void => {
    const next = SETUP_STEPS[index];
    if (next && isOptional(next.id)) setArrived(optionalState(settings, next.id));
    setCurrent(index);
  };

  return (
    <div className="grid h-full place-items-center bg-background p-6">
      {/* Held inside the window, its heading and footer pinned, so a long step
          scrolls its own content rather than running off the screen. */}
      <div className="grid h-full max-h-[56rem] min-h-0 w-full max-w-6xl grid-cols-[15rem_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-card shadow-lg">
        <SetupRail current={current} />

        <main className="flex min-h-0 min-w-0 flex-col gap-5 p-8">
          <header className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {t('setup.stepOf', { step: formatNumber(current + 1), total: formatNumber(SETUP_STEPS.length) })}
            </span>
            <h1 className="text-2xl font-semibold">{t(step.title)}</h1>
            <p className="text-sm text-muted-foreground">{t(step.hint)}</p>
          </header>

          {/* Keyed on the step, so each one opens at its top. */}
          <div key={step.id} className="-mx-8 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 [scrollbar-gutter:stable]">
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

            {step.id === 'sources' ? <ContentSourcesBody /> : null}

            {step.id === 'tracks' ? <RecommendedTracksBody /> : null}

            {step.id === 'yours' ? <YoursStep /> : null}
          </div>

          <footer className="flex items-center justify-between gap-3 border-t pt-4">
            <Button variant="outline" disabled={current === 0} onClick={() => go(current - 1)}>
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
                  : go(current + 1))}
              >
                {last ? t('setup.start') : untouched ? t('setup.skip') : t('setup.continue')}
                <ArrowRightIcon />
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
