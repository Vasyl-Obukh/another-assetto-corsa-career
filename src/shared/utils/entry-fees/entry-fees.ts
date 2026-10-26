// What entering a round costs a class, out of the three places a championship
// may say it. Shared because main charges it and every screen that offers a
// way in says what it comes to.

import type { Championship } from '../../types/index.ts';

/**
 * What entering one round of a championship in one class costs: the round's
 * own fee where it states one, else the class's, else the championship's.
 * @param series The championship
 * @param round The round, by its id
 * @param entry The class entry, by its id
 * @returns The fee, or undefined where nothing states one
 */
export const entryFeeOf = (series: Championship, round: string, entry: string): number | undefined => (
  series.rounds.find((one) => one.id === round)?.entryFee
  ?? series.entries.find((one) => one.id === entry)?.entryFee
  ?? series.entryFee
);
