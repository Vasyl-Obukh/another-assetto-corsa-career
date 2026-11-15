// How much of the championship library races each recommended circuit, which
// the Tracks tab sorts and badges its cards by. Derived on every read.

import type { Discipline, SeriesListing } from '../../../../shared/types';
import { layoutOfRound } from '../../../../shared/utils/recommended-tracks';

/**
 * How much of the library races one circuit.
 */
export interface CircuitUsage {
  /**
   * How many championships race any layout of it.
   */
  championships: number;
  /**
   * How many of those race each discipline, a championship counted once per
   * discipline its classes enter at.
   */
  disciplines: ReadonlyMap<Discipline, number>;
}

/**
 * Counts the championships racing each recommended circuit.
 * @param listings The championship library
 * @returns Each circuit's usage by its id, only the circuits something races
 */
export const circuitUsage = (listings: readonly SeriesListing[]): Map<string, CircuitUsage> => {
  const usage = new Map<string, { championships: number; disciplines: Map<Discipline, number> }>();

  listings.forEach(({ series }) => {
    const circuits = new Set(series.rounds.flatMap((round) => {
      const entry = layoutOfRound(round);
      return entry ? [entry.circuit.id] : [];
    }));
    const disciplines = new Set(series.entries.map((entry) => entry.ladder.discipline));

    circuits.forEach((circuit) => {
      const held = usage.get(circuit) ?? { championships: 0, disciplines: new Map<Discipline, number>() };
      held.championships += 1;
      disciplines.forEach((discipline) => {
        held.disciplines.set(discipline, (held.disciplines.get(discipline) ?? 0) + 1);
      });
      usage.set(circuit, held);
    });
  });

  return usage;
};
