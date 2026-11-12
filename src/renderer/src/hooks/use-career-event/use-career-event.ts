import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import type { CareerEventState } from './types.ts';
import type { CareerEventView, ChampionshipRun } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { CareerEventState } from './types.ts';

/**
 * Loads one round of the career's season and keeps it current.
 *
 * Read again on every push that could change it: the career recording a
 * session, the race store moving between launching and waiting, the library or
 * the install changing what the round can run. None of them carry the view, so
 * each is only a signal to ask again.
 * @param series The championship's id, or an empty string to load nothing
 * @param round The round's id
 * @param run Which season and edition, where the page names one; otherwise the
 * current season and the edition the career is racing, or else the one still
 * to come
 * @returns The round and the commands the page runs on it
 */
export const useCareerEvent = (
  series: string,
  round: string,
  run: Partial<ChampionshipRun> = {},
): CareerEventState => {
  const { season, edition } = run;
  const [view, setView] = useState<CareerEventView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);
  // Steps on the strength still out, while which a read would put back an
  // earlier one over the step on screen.
  const stepping = useRef(0);

  const load = useCallback((): (() => void) => {
    if (series === '') return () => undefined;

    let live = true;
    invoke('career:event', {
      series, round, season, edition,
    }).then(
      (next) => {
        if (!live) return;
        if (stepping.current === 0) setView(next);
        setLoading(false);
      },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [series, round, season, edition]);

  useEffect(load, [load]);
  // Null is the career closing on the way to the main menu, with nothing left
  // to read and the page about to go.
  useEffect(() => subscribe('career:changed', (career) => { if (career) load(); }), [load]);
  useEffect(() => subscribe('race:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('series:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('content:changed', () => { load(); }), [load]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param send What to run
   * @returns Resolves once it has finished, whether or not it worked
   */
  const command = useCallback(async (send: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try {
      await send();
      setError(null);
    } catch (thrown: unknown) {
      setError(toDisplayableError(thrown));
    } finally {
      setBusy(false);
      load();
    }
  }, [load]);

  return {
    view,
    loading,
    busy,
    error,
    dismissError: () => setError(null),
    // The edition the page shows, so entering and racing it never land on
    // another edition of the same championship.
    enter: (entry, car) => command(() => invoke('career:enrol', {
      series, entry, car, edition: view?.edition ?? edition,
    })),
    buySeat: (entry, team, backed) => command(() => invoke('career:buySeat', {
      series, entry, team, edition: view?.edition ?? edition, backed,
    })),
    accept: () => command(async () => {
      const mail = view?.historic?.invitation.mail;
      if (mail) await invoke('career:answer', { mail, answer: 'accepted' });
    }),
    // Declining an invitation still to be answered answers it; leaving an
    // event entered, by invitation or at the player's own cost, is
    // withdrawing from it, which leaves it to the field.
    decline: () => command(async () => {
      const mail = view?.historic?.invitation.mail;
      if (view?.entered) {
        await invoke('career:withdraw', { series, entry: view.entered.entry, edition: view.edition });
      } else if (mail) {
        await invoke('career:answer', { mail, answer: 'declined' });
      }
    }),
    // Launching an invitation still to be answered accepts it on the way.
    launch: (skip, scale) => command(() => invoke('career:launch', {
      series,
      round,
      edition: view?.edition ?? edition,
      skip,
      scale,
      accept: view?.historic?.invitation.state === 'awaiting',
    })),
    setRain: (rain) => command(() => invoke('career:rain', {
      series, round, edition: view?.edition ?? edition, rain,
    })),
    // Shown at once and kept behind it, never holding the buttons, so a step
    // can be typed or clicked through; the round is read once the last lands.
    setStrength: (strength) => {
      setView((now) => (now?.strength ? { ...now, strength: { ...now.strength, step: strength } } : now));
      stepping.current += 1;

      return invoke('career:strength', {
        series, round, edition: view?.edition ?? edition, strength,
      }).then(
        () => { setError(null); },
        (thrown: unknown) => { setError(toDisplayableError(thrown)); },
      ).finally(() => {
        stepping.current -= 1;
        if (stepping.current === 0) load();
      });
    },
  };
};
