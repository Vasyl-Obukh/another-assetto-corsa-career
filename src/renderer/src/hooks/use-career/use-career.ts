import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import type { CareerState } from './types.ts';
import { withSeasonStrength } from './utils.ts';
import type { Career, CareerCalendar } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { CareerState } from './types.ts';

/**
 * Loads the career and the calendar for its current season.
 *
 * The two are read separately because only one of them is stored: the career is
 * a document main keeps, while the calendar is derived on every read from the
 * career, the championship library and what is installed. So the calendar is
 * re-read on `content:changed` and `series:changed` as well, either of which
 * can change what is on it without the career moving at all.
 * @returns The career, its calendar and the commands that move them
 */
export const useCareer = (): CareerState => {
  const [career, setCareer] = useState<Career | null>(null);
  const [calendar, setCalendar] = useState<CareerCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);
  // Steps on the strength still out, while which a push would put back an
  // earlier one over the step on screen.
  const stepping = useRef(0);
  // Whether a career is open: pages shared with the start screen and quick
  // races have no calendar to read there.
  const open = useRef(false);

  const loadCalendar = useCallback((): void => {
    if (!open.current) return;
    invoke('career:calendar', {}).then(
      setCalendar,
      (thrown: unknown) => setError(toDisplayableError(thrown)),
    );
  }, []);

  const load = useCallback((): (() => void) => {
    let live = true;

    invoke('career:get', undefined).then(
      (next) => {
        if (!live) return;
        open.current = next !== null;
        setCareer(next);
        setLoading(false);
        loadCalendar();
      },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [loadCalendar]);

  useEffect(load, [load]);
  useEffect(() => subscribe('career:changed', (next) => {
    open.current = next !== null;
    if (stepping.current === 0) setCareer(next);
    loadCalendar();
  }), [loadCalendar]);
  useEffect(() => subscribe('content:changed', loadCalendar), [loadCalendar]);
  useEffect(() => subscribe('series:changed', loadCalendar), [loadCalendar]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param command What to run
   * @returns Resolves once it has finished, whether or not it worked
   */
  const run = useCallback(async (command: () => Promise<Career>): Promise<void> => {
    setBusy(true);
    try {
      setCareer(await command());
      setError(null);
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    career,
    calendar,
    loading,
    busy,
    error,
    dismissError: () => setError(null),
    enrol: (series, entry, car) => run(() => invoke('career:enrol', { series, entry, car })),
    withdraw: (series, entry) => run(() => invoke('career:withdraw', { series, entry })),
    terminate: (series, entry, edition) => run(() => invoke('career:withdraw', { series, entry, edition })),
    // Shown at once and kept behind it, never holding the buttons, so a step can
    // be typed or clicked through; only the last answer is taken, holding them all.
    setStrength: (series, edition, strength) => {
      setCareer((now) => now && withSeasonStrength(now, series, edition, strength));
      stepping.current += 1;

      return invoke('career:strength', { series, edition, strength }).then(
        (next) => { setError(null); return next; },
        (thrown: unknown) => { setError(toDisplayableError(thrown)); return null; },
      ).then((next) => {
        stepping.current -= 1;
        if (stepping.current > 0) return;
        if (next) setCareer(next);
        else load();
      });
    },
    advanceTo: (date, skip) => run(() => invoke('career:advance', { date, skip })),
    // An error is shown as any command's is, and still rejects: a move whose
    // cost could not be read must not go ahead as though it cost nothing.
    skipsTo: (date) => invoke('career:skips', { date }).catch((thrown: unknown) => {
      setError(toDisplayableError(thrown));
      throw thrown;
    }),
  };
};
