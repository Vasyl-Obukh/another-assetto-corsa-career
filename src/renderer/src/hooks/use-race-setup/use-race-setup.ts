import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import type { RaceSetupState } from './types.ts';
import type { RaceDefinition, RaceSetup } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';

export type { RaceSetupState } from './types.ts';

/**
 * The race being set up, and the actions that change or launch it.
 *
 * Main owns the definition; this holds a projection of it and pushes intent
 * back. That is also why a launch in flight needs no polling here - main sends
 * the whole setup again every time the status moves, including when a result
 * lands hours later.
 * @returns The current state and the actions the screen binds to
 */
export const useRaceSetup = (): RaceSetupState => {
  const [setup, setSetup] = useState<RaceSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);

  // Counts the calls made, so a slow answer to an old one cannot overwrite a
  // newer one: typing in a number field makes a call per keystroke.
  const issued = useRef(0);

  // The definition as it stands right now: state would be a render behind the
  // keystroke an edit is reading.
  const current = useRef<RaceDefinition | null>(null);

  const adopt = useCallback((next: RaceSetup): void => {
    current.current = next.definition;
    setSetup(next);
  }, []);

  useEffect(() => {
    let live = true;

    invoke('race:get', undefined).then(
      (next) => { if (live) { adopt(next); setLoading(false); } },
      (thrown: unknown) => {
        if (!live) return;
        setError(toDisplayableError(thrown));
        setLoading(false);
      },
    );

    return () => { live = false; };
  }, [adopt]);

  // Everything a launch changes arrives this way: the wait outlives the call
  // that started it.
  useEffect(() => subscribe('race:changed', adopt), [adopt]);

  /**
   * Runs one action against main and adopts whatever setup it answers with.
   * @param action The call to make
   * @returns Resolves once the setup has been adopted or the failure recorded
   */
  const run = useCallback(async (action: () => Promise<RaceSetup>): Promise<void> => {
    issued.current += 1;
    const mine = issued.current;

    setBusy(true);
    setError(null);
    try {
      const next = await action();
      if (mine === issued.current) adopt(next);
    } catch (thrown) {
      if (mine === issued.current) setError(toDisplayableError(thrown));
    } finally {
      if (mine === issued.current) setBusy(false);
    }
  }, [adopt]);

  /**
   * Applies an edit locally, then sends it to main.
   *
   * Applied here first so a text field is not a round trip behind the keyboard;
   * main answers with the same definition plus the plan and problems it implies,
   * which is the part only main can work out. The same arrangement the settings
   * provider uses.
   * @param change Produces the new definition from the current one
   */
  const edit = useCallback((change: (from: RaceDefinition) => RaceDefinition): void => {
    if (!current.current) return;

    const next = change(current.current);
    current.current = next;
    setSetup((prev) => (prev ? { ...prev, definition: next } : prev));
    void run(() => invoke('race:set', next));
  }, [run]);

  const status = setup?.status;
  const done = setup?.state?.completed.length ?? 0;

  return {
    setup,
    loading,
    busy,
    runnable: setup !== null
      && setup.problems.length === 0
      && setup.plan !== null
      && status?.phase === 'idle'
      && done < setup.plan.launches.length,
    locked: done > 0 || status?.phase !== 'idle',
    error,

    setTrack: (layout) => edit((from) => ({
      ...from,
      track: layout.layout ? { id: layout.id, layout: layout.layout } : { id: layout.id },
    })),

    // The livery goes with the old car: a skin folder belongs to one model, and
    // carrying it over would name one that is not installed.
    setCar: (model) => edit((from) => ({
      ...from,
      playerCar: { ...from.playerCar, model, skin: undefined },
    })),

    setGrid: (grid) => edit((from) => ({ ...from, grid })),

    setSessions: (sessions) => edit((from) => ({ ...from, sessions })),

    setConditions: (conditions) => edit((from) => ({ ...from, conditions })),

    launch: () => { void run(() => invoke('race:launch', undefined)); },
    cancel: () => { void run(() => invoke('race:cancel', undefined)); },
    reset: () => { void run(() => invoke('race:reset', undefined)); },
    dismissError: () => setError(null),
  };
};
