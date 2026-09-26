import { InstallHealth } from './InstallHealth.tsx';
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
    <ScreenBody className="py-6" backToTop>
      {/* Capped and kept to the tabs' left edge, as every settings form is. */}
      <div className="flex max-w-6xl flex-col gap-5">
        <InstallHealth ready={install.ready} scanned={install.summary !== null} />

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
      </div>
    </ScreenBody>
  );
};
