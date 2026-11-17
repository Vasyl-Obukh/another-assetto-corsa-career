// How much of the championship library races each recommended circuit, which
// the Tracks tab sorts and badges its cards by, and how big a field each
// layout has to hold. Derived on every read.

import type {
  Championship, Discipline, Round, SeriesListing,
} from '../../../../shared/types';
import { fieldSize, tooFewPitboxes } from '../../../../shared/utils/field-size';
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
 * The biggest field a recommended layout has to hold.
 */
export interface LayoutField {
  /**
   * Cars on the grid, every class together.
   */
  field: number;
  /**
   * The championship fielding them.
   */
  name: string;
}

/**
 * A championship whose field a track would be too small for.
 */
export interface OutgrownChampionship {
  /**
   * The championship.
   */
  series: Championship;
  /**
   * Its rounds at the layout, in calendar order.
   */
  rounds: readonly Round[];
  /**
   * Cars on its grid, every class together.
   */
  field: number;
}

/**
 * The biggest field racing each recommended layout, so a track standing for one
 * can be judged against it.
 * @param listings The championships, historic events included
 * @returns Each layout's biggest field by its id, only the layouts something races
 */
export const layoutFields = (listings: readonly SeriesListing[]): Map<string, LayoutField> => {
  const fields = new Map<string, LayoutField>();

  listings.forEach(({ series }) => {
    const field = fieldSize(series);
    new Set(series.rounds.flatMap((round) => round.track.recommended ?? [])).forEach((layout) => {
      if ((fields.get(layout)?.field ?? 0) < field) fields.set(layout, { field, name: series.name });
    });
  });

  return fields;
};

/**
 * The championships a track would be too small for at one recommended layout:
 * each whose field is more than its pit boxes.
 * @param listings The championships, historic events included
 * @param layout The recommended layout's id
 * @param pitboxes The track's pit boxes, null when it does not say
 * @returns Every championship it cannot hold, in library order
 */
export const outgrown = (
  listings: readonly SeriesListing[],
  layout: string,
  pitboxes: number | null,
): OutgrownChampionship[] => listings.flatMap(({ series }) => {
  const rounds = series.rounds.filter((round) => round.track.recommended === layout);
  const field = fieldSize(series);

  return rounds.length > 0 && tooFewPitboxes(field, pitboxes) ? [{ series, rounds, field }] : [];
});

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
