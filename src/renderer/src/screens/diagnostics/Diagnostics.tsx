import type { PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import {
  ContentCard, ErrorCard, PathsCard, ScreenBody,
} from '@/components';
import { useInstallation } from '@/hooks';
import { path } from '@/lib/routes';

interface DiagnosticsProps {
  /**
   * The probe main ran before the first render, so nothing has to load on mount.
   */
  initialReport: PathsReport;
}

export const Diagnostics = ({ initialReport }: DiagnosticsProps) => {
  const { settings } = useSettings();
  const install = useInstallation(initialReport);

  return (
    <ScreenBody className="flex flex-col gap-6 py-8" backToTop>
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
        addContentHref={path.settingsContent()}
      />
    </ScreenBody>
  );
};
