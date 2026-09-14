import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { CHECK_DEBOUNCE_MS } from './constants.ts';
import type { SeriesEditorState } from './types.ts';
import type { Championship, SeriesAvailability, SeriesListing } from '../../../../shared/types';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { SeriesEditorState } from './types.ts';

/**
 * One championship, held as a draft the user saves deliberately.
 *
 * Unlike the race screen, which sends every keystroke to main, a championship
 * is a document: it passes through states no validator would accept - deleting
 * a round to re-add it leaves a championship with none - and a cross-referential
 * edit is half-done by construction while it is being made. So the draft lives
 * here, problems come from a check that writes nothing, and Save is the only
 * thing that touches the file.
 * @param id The championship's id, from the route
 * @returns The draft, what is wrong with it, and the actions the screen binds to
 */
export const useSeriesEditor = (id: string): SeriesEditorState => {
  const [listing, setListing] = useState<SeriesListing | null>(null);
  const [draft, setDraft] = useState<Championship | null>(null);
  const [checked, setChecked] = useState<SeriesAvailability | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  // The draft as it stands right now: state would be a render behind the
  // keystroke an edit is reading.
  const current = useRef<Championship | null>(null);
  // Counts the checks issued, so a slow answer to an old draft cannot overwrite
  // the answer to a newer one.
  const issued = useRef(0);

  const adopt = useCallback((next: SeriesListing | null): void => {
    current.current = next?.series ?? null;
    setListing(next);
    setDraft(next?.series ?? null);
    setDirty(false);
  }, []);

  useEffect(() => {
    let live = true;

    invoke('series:get', { id }).then(
      (next) => { if (live) { adopt(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [adopt, id]);

  // Subscribed for one reason only: this championship being deleted or reverted
  // somewhere else, which leaves the editor holding a draft with nowhere to go.
  // A push is deliberately not adopted - it would clobber the draft mid-typing.
  useEffect(() => subscribe('series:changed', (library) => {
    if (!library.series.some((one) => one.series.id === id)) adopt(null);
  }), [adopt, id]);

  const settled = useDebouncedValue(draft, CHECK_DEBOUNCE_MS);
  // Bumped when the class catalogue changes, since what a spec holds decides
  // whether the unchanged draft is still raceable.
  const [classified, setClassified] = useState(0);

  useEffect(() => subscribe('classes:changed', () => setClassified((n) => n + 1)), []);

  useEffect(() => {
    if (!settled) return undefined;

    issued.current += 1;
    const mine = issued.current;
    let live = true;

    invoke('series:validate', { series: settled }).then(
      (next) => { if (live && mine === issued.current) setChecked(next); },
      () => { /* a draft that cannot even be checked is reported by saving it */ },
    );

    return () => { live = false; };
  }, [settled, classified]);

  const edit = useCallback((change: (from: Championship) => Championship): void => {
    if (!current.current) return;

    const next = change(current.current);
    current.current = next;
    setDraft(next);
    setDirty(true);
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!current.current) return false;

    // Compared by identity afterwards, and edit() always builds a new object,
    // so this says exactly whether anything was typed while the write was in
    // flight - which is not instant: it is a file write, a reload of the whole
    // library and a content scan.
    const sent = current.current;

    setBusy(true);
    setError(null);
    try {
      const saved = await invoke('series:save', { id, series: sent });

      // Adopting what comes back rather than what was sent: parseSeries
      // normalises in main, so the two would otherwise drift wherever it
      // dropped something. But only when the draft stood still - otherwise the
      // newer keystrokes stand and stay dirty, so the next save writes them,
      // rather than being overwritten by an answer to the older document.
      if (current.current === sent) adopt(saved);
      else setListing(saved);

      return true;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return false;
    } finally {
      setBusy(false);
    }
  }, [adopt, id]);

  return {
    draft,
    listing,
    checked,
    dirty,
    loading,
    busy,
    locked: Boolean(listing?.weekend),
    error,
    dismissError: () => setError(null),
    edit,
    save,
    discard: () => adopt(listing),
  };
};
