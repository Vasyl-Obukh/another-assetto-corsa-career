import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import {
  ContentCard, ErrorCard, LanguageSelect, PathsCard, ScreenBody, ThemeSelect,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useInstallation } from '@/hooks';

interface SetupProps {
  /**
   * The probe main ran before the first render.
   */
  initialReport: PathsReport;
}

export const Setup = ({ initialReport }: SetupProps) => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const install = useInstallation(initialReport);

  return (
    <ScreenBody className="flex flex-col gap-8 py-8">
      <header className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('setup.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('setup.subtitle')}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeSelect />
          <LanguageSelect />
        </div>
      </header>

      <main className="flex flex-col gap-6 pb-8">
        {install.error ? (
          <ErrorCard error={install.error} onDismiss={install.dismissError} />
        ) : null}

        <PathsCard
          report={install.report}
          overrides={settings.paths}
          busy={install.busy}
          onPick={install.pick}
          onClear={install.clear}
          onRefresh={install.refresh}
        />

        <ContentCard
          ready={install.ready}
          summary={install.summary}
          issues={install.issues}
          scanning={install.scanning}
          onScan={install.scan}
          onOpenIssues={install.loadIssues}
        />

        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">
            {install.ready ? t('setup.ready') : t('setup.blocked')}
          </span>
          <Button
            disabled={!install.ready}
            onClick={() => patch({ setupCompletedAt: new Date().toISOString() })}
          >
            {t('setup.continue')}
            <ArrowRightIcon />
          </Button>
        </div>
      </main>
    </ScreenBody>
  );
};
