// Probing, correcting and scanning the Assetto Corsa installation. Shared by the
// first-run setup screen and the diagnostics screen, which do the same work for
// different reasons - one gates the app, the other explains it.

import { useCallback, useEffect, useState } from 'react';

import type { Installation } from './types.ts';
import type {
  ContentIssue, ContentSummary, PathOverrides, PathsReport,
} from '../../../../shared/types';
import { useSettings } from '@/app';
import type { PathKind } from '@/components';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
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
  const [issues, setIssues] = useState<ContentIssue[] | null>(null);
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

  const contentDir = report.derived?.content ?? null;

  // The scan is cached across runs, so the counts can be there on first paint
  // rather than waiting for the user to ask for them. Without force, this is a
  // fingerprint pass over folders that have almost certainly not changed.
  //
  // Keyed on the content directory rather than on readiness, so pointing at a
  // different install re-fetches instead of leaving the card empty.
  useEffect(() => {
    if (contentDir === null) return;

    let live = true;
    invoke('content:scan', {}).then(
      (next) => { if (live) setSummary(next); },
      () => { /* the diagnostics card already says the paths are unresolved */ },
    );

    return () => { live = false; };
  }, [contentDir]);

  // Content installed while the app is open shows up without a click.
  useEffect(() => subscribe('content:changed', (change) => setSummary(change.summary)), []);

  // Fetched on demand rather than alongside the summary: the list is only ever
  // opened when something is broken, and re-reading it on every open is what
  // saves invalidating it after a rescan or a change under the app.
  const loadIssues = useCallback(() => {
    invoke('content:issues', undefined).then(
      (next) => setIssues(next),
      () => { /* the card already says when the paths are unresolved */ },
    );
  }, []);

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
    issues,
    ready: contentDir !== null,
    busy,
    scanning,
    error,
    refresh: () => { void refresh(); },
    pick: (kind) => { void pick(kind); },
    clear,
    scan: () => { void scan(); },
    loadIssues,
    dismissError: () => setError(null),
  };
};
