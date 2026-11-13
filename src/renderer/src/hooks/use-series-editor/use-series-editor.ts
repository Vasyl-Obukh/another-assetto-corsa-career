import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { CHECK_DEBOUNCE_MS } from './constants.ts';
import type { SeriesEditorState } from './types.ts';
import type { Championship, SeriesAvailability, SeriesListing } from '../../../../shared/types';
import { tidyText } from '../../../../shared/utils/localized-text';
import { useDebouncedValue } from '../use-debounced-value/index.ts';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { SERIES_CHANNELS } from '@/lib/series-kind';
import type { SeriesKind } from '@/lib/series-kind';

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
 *
 * A championship being started is the same screen with nothing behind it: the
 * draft is whatever `blank` holds, there is no listing, and the first save
 * writes it rather than replacing anything.
 * @param id The championship's id, from the route, or undefined for a new one
 * @param blank The document a new championship starts from
 * @param kind Which library it is in - the championships unless it says otherwise
 * @returns The draft, what is wrong with it, and the actions the screen binds to
 */
export const useSeriesEditor = (
  id: string | undefined,
  blank: Championship,
  kind: SeriesKind = 'series',
): SeriesEditorState => {
  const channels = SERIES_CHANNELS[kind];
  const [listing, setListing] = useState<SeriesListing | null>(null);
  // Unsaved from the first render when it is new, since there is nothing on
  // disk for it to differ from.
  const [draft, setDraft] = useState<Championship | null>(id === undefined ? blank : null);
  const [checked, setChecked] = useState<SeriesAvailability | null>(null);
  const [dirty, setDirty] = useState(id === undefined);
  const [loading, setLoading] = useState(id !== undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  // The draft as it stands right now: state would be a render behind the
  // keystroke an edit is reading.
  const current = useRef<Championship | null>(id === undefined ? blank : null);
  // The id main gave a new championship on its first save. Held here rather
  // than waiting on the route, so a second Save before the screen has moved
  // writes the same file instead of creating another.
  const minted = useRef<string | undefined>(undefined);
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
    if (id === undefined) return undefined;
    let live = true;

    invoke(channels.get, { id }).then(
      (next) => { if (live) { adopt(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [adopt, id, channels]);

  // Subscribed for one reason only: this championship being deleted or reverted
  // somewhere else, which leaves the editor holding a draft with nowhere to go.
  // A push is deliberately not adopted - it would clobber the draft mid-typing.
  useEffect(() => subscribe(channels.changed, (library) => {
    // Nothing to lose track of until it has been written once.
    if (id === undefined) return;
    if (!library.series.some((one) => one.series.id === id)) adopt(null);
  }), [adopt, id, channels]);

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

    invoke(channels.validate, { series: settled }).then(
      (next) => { if (live && mine === issued.current) setChecked(next); },
      () => { /* a draft that cannot even be checked is reported by saving it */ },
    );

    return () => { live = false; };
  }, [settled, classified, channels]);

  const edit = useCallback((change: (from: Championship) => Championship): void => {
    if (!current.current) return;

    const next = change(current.current);
    current.current = next;
    setDraft(next);
    setDirty(true);
  }, []);

  const save = useCallback(async (): Promise<string | null> => {
    if (!current.current) return null;

    // Compared by identity afterwards, and edit() always builds a new object,
    // so this says exactly whether anything was typed while the write was in
    // flight - which is not instant: it is a file write, a reload of the whole
    // library and a content scan.
    const sent = current.current;
    // A translation added and never written is dropped rather than saved empty.
    const written = { ...sent, description: tidyText(sent.description) };

    setBusy(true);
    setError(null);
    try {
      // A championship that has never been written is created instead, which is
      // where its id comes from: the screen then moves to that id's own URL.
      const target = id ?? minted.current;
      if (target === undefined) {
        const created = await invoke(channels.create, { series: written });
        minted.current = created.id ?? undefined;
        // Settled, or the screen's own guard against leaving with a draft
        // unwritten would block the move to the new id's URL. Only when the
        // draft stood still, on the same terms as a save.
        if (current.current === sent) setDirty(false);

        return created.id;
      }

      const saved = await invoke(channels.save, { id: target, series: written });

      // Adopting what comes back rather than what was sent: parseSeries
      // normalises in main, so the two would otherwise drift wherever it
      // dropped something. But only when the draft stood still - otherwise the
      // newer keystrokes stand and stay dirty, so the next save writes them,
      // rather than being overwritten by an answer to the older document.
      if (current.current === sent) adopt(saved);
      else setListing(saved);

      return target;
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));

      return null;
    } finally {
      setBusy(false);
    }
  }, [adopt, id, channels]);

  return {
    draft,
    listing,
    checked,
    dirty,
    loading,
    busy,
    locked: Boolean(listing?.event),
    error,
    dismissError: () => setError(null),
    edit,
    save,
    discard: () => {
      // A new championship has nothing on disk to go back to, so it starts
      // again from the blank it opened with, and stays unsaved.
      if (id !== undefined) { adopt(listing); return; }

      current.current = blank;
      setDraft(blank);
    },
  };
};
