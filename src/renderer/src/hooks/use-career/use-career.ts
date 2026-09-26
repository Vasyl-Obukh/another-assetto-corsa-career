import { useCallback, useEffect, useState } from 'react';

import type { CareerState } from './types.ts';
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

  // Reading the calendar is also what starts a career the first time, and
  // starting one pushes career:changed - so the career arrives on its own
  // subscription rather than being asked for a second time here.
  const loadCalendar = useCallback((): void => {
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
    setCareer(next);
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
    advanceTo: (date, skip) => run(() => invoke('career:advance', { date, skip })),
    // An error is shown as any command's is, and still rejects: a move whose
    // cost could not be read must not go ahead as though it cost nothing.
    skipsTo: (date) => invoke('career:skips', { date }).catch((thrown: unknown) => {
      setError(toDisplayableError(thrown));
      throw thrown;
    }),
  };
};
