// Probing, correcting and scanning the Assetto Corsa installation. Shared by the
// first-run setup screen and the diagnostics screen, which do the same work for
// different reasons - one gates the app, the other explains it.

import { useCallback, useState } from 'react';

import type { Installation } from './types.ts';
import type { ContentSummary, PathOverrides, PathsReport } from '../../../../shared/types';
import { useSettings } from '@/app';
import type { PathKind } from '@/components';
import { invoke, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { Installation } from './types.ts';

/**
 * Tracks the installation and the actions that change it.
 * @param initialReport The probe main ran before the first render
 * @returns The current state and the actions the screens bind to
 */
export const useInstallation = (initialReport: PathsReport): Installation => {
  const { settings } = useSettings();

  const [report, setReport] = useState<PathsReport>(initialReport);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  const fail = useCallback((thrown: unknown) => {
    setError(toDisplayableError(thrown));
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

  const pick = useCallback(async (kind: PathKind) => {
    try {
      const picked = await invoke('paths:pick', { kind });
      if (picked) await override({ ...settings.paths, [kind]: picked });
    } catch (thrown) {
      fail(thrown);
    }
  }, [override, settings.paths, fail]);

  const clear = useCallback((kind: PathKind) => {
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

  return {
    report,
    summary,
    ready: report.derived != null,
    busy,
    scanning,
    error,
    refresh: () => { void refresh(); },
    pick: (kind) => { void pick(kind); },
    clear,
    scan: () => { void scan(); },
    dismissError: () => setError(null),
  };
};
