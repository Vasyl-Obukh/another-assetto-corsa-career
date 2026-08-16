import { useCallback, useState } from 'react';

import { ContentCard } from './ContentCard.tsx';
import { ErrorCard } from './ErrorCard.tsx';
import { PathsCard } from './PathsCard.tsx';
import type { PathKind } from './types.ts';
import type { ContentSummary, PathOverrides, PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import { invoke } from '@/lib/ipc';

interface DiagnosticsProps {
  /**
   * The probe main ran before the first render, so nothing has to load on mount.
   */
  initialReport: PathsReport;
}

export const Diagnostics = ({ initialReport }: DiagnosticsProps) => {
  const { settings } = useSettings();

  const [report, setReport] = useState<PathsReport>(initialReport);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = useCallback((thrown: unknown) => {
    setError(thrown instanceof Error ? thrown.message : String(thrown));
  }, []);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      setReport(await invoke('paths:probe', undefined));
    } catch (thrown) {
      fail(thrown);
    } finally {
      setBusy(false);
    }
  }, [fail]);

  const override = useCallback(async (next: PathOverrides) => {
    setBusy(true);
    setError(null);
    try {
      setReport(await invoke('paths:override', next));
      // The old scan described a different install root.
      setSummary(null);
    } catch (thrown) {
      fail(thrown);
    } finally {
      setBusy(false);
    }
  }, [fail]);

  const handlePick = useCallback(async (kind: PathKind) => {
    try {
      const picked = await invoke('paths:pick', { kind });
      if (picked) await override({ ...settings.paths, [kind]: picked });
    } catch (thrown) {
      fail(thrown);
    }
  }, [override, settings.paths, fail]);

  const handleClear = useCallback((kind: PathKind) => {
    const next = { ...settings.paths };
    delete next[kind];
    void override(next);
  }, [override, settings.paths]);

  const scan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      setSummary(await invoke('content:scan', { force: true }));
    } catch (thrown) {
      fail(thrown);
    } finally {
      setScanning(false);
    }
  }, [fail]);

  return (
    <div className="flex flex-col gap-6">
      {error ? <ErrorCard message={error} onDismiss={() => setError(null)} /> : null}

      <PathsCard
        report={report}
        overrides={settings.paths}
        busy={busy}
        onPick={(kind) => { void handlePick(kind); }}
        onClear={handleClear}
        onRefresh={() => { void refresh(); }}
      />

      <ContentCard
        ready={report.derived != null}
        summary={summary}
        scanning={scanning}
        onScan={() => { void scan(); }}
      />
    </div>
  );
};
