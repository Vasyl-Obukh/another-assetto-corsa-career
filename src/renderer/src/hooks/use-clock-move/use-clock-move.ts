import { useState } from 'react';

import type { ClockMove, PendingMove } from './types.ts';
import type { CareerState } from '../use-career/index.ts';

export type { ClockMove, PendingMove } from './types.ts';

/**
 * Moves the career's clock, asking first wherever the move costs rounds.
 *
 * Every move goes all the way to the date asked for once it is made, because
 * either nothing is lost on the way or the player has just been shown what is.
 * @param career The career whose clock it is
 * @returns The move, and the one waiting on the player
 */
export const useClockMove = (career: CareerState): ClockMove => {
  const [pending, setPending] = useState<PendingMove | null>(null);

  return {
    moveTo: (date) => {
      career.skipsTo(date).then((rounds) => {
        if (rounds.length === 0) {
          void career.advanceTo(date, true);

          return;
        }

        setPending({ date, rounds });
      }, () => undefined);
    },
    pending,
    confirm: () => {
      if (!pending) return;

      setPending(null);
      void career.advanceTo(pending.date, true);
    },
    cancel: () => setPending(null),
  };
};
