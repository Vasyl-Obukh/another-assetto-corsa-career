import { useEffect, useState } from 'react';

import type { RaceStatusState } from './types.ts';
import type { RaceSetup } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

export type { RaceStatusState } from './types.ts';

/**
 * The launch slot - whichever event raced last, and the launch in flight -
 * kept current, for a page that says when a launch is with Content Manager.
 *
 * A launch needs no polling: main pushes the whole slot every time its status
 * moves, including when a result lands hours later.
 * @returns The slot, and the one command a waiting page offers
 */
export const useRaceStatus = (): RaceStatusState => {
  const [setup, setSetup] = useState<RaceSetup | null>(null);

  useEffect(() => {
    let live = true;
    invoke('race:get', undefined).then(
      (next) => { if (live) setSetup(next); },
      () => { /* nothing is waited on until the slot answers */ },
    );

    return () => { live = false; };
  }, []);

  useEffect(() => subscribe('race:changed', setSetup), []);

  return {
    setup,
    cancel: () => { void invoke('race:cancel', undefined).catch(() => { /* the push says how it ended */ }); },
  };
};
