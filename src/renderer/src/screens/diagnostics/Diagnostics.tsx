import type { PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ContentCard, ErrorCard, PathsCard } from '@/components';
import { useInstallation } from '@/hooks';

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
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-8">
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
          scanning={install.scanning}
          onScan={install.scan}
        />
      </div>
    </div>
  );
};
