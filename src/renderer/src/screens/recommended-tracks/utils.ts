import type { TrackFilter, TrackSortKey } from './types.ts';
import { RECOMMENDED_CIRCUITS } from '../../../../shared/constants';
import type {
  Discipline, RecommendedCircuit, RecommendedTrackState, SortDirection,
} from '../../../../shared/types';
import { matchesTerms } from '../../../../shared/utils/search';
import type { CircuitUsage } from '@/lib/circuit-usage';
import { rowKind, shownTrack } from '@/lib/track-rows';

/**
 * Whether a circuit has a layout the filter is after.
 * @param circuit The circuit
 * @param states Each layout's state by its id
 * @param filter The filter
 * @returns True when the circuit belongs under it
 */
export const underFilter = (
  circuit: RecommendedCircuit,
  states: ReadonlyMap<string, RecommendedTrackState>,
  filter: TrackFilter,
): boolean => filter === 'all' || circuit.layouts.some((layout) => {
  const state = states.get(layout.id);
  if (!state) return false;

  const kind = rowKind(state);
  return kind === filter || (filter === 'found' && kind === 'choice');
});

/**
 * Counts the recommended circuits under a filter.
 * @param states Each layout's state by its id
 * @param filter The filter
 * @returns How many circuits belong under it
 */
export const countUnder = (
  states: ReadonlyMap<string, RecommendedTrackState>,
  filter: TrackFilter,
): number => RECOMMENDED_CIRCUITS.filter((circuit) => underFilter(circuit, states, filter)).length;

/**
 * Whether a circuit has a layout in any of the states picked - every circuit
 * while none is.
 * @param circuit The circuit
 * @param states Each layout's state by its id
 * @param picked The states picked
 * @returns True when the circuit belongs under them
 */
export const underStates = (
  circuit: RecommendedCircuit,
  states: ReadonlyMap<string, RecommendedTrackState>,
  picked: readonly TrackFilter[],
): boolean => picked.length === 0 || picked.some((filter) => underFilter(circuit, states, filter));

/**
 * Whether championships of any of the disciplines picked race a circuit -
 * every circuit while none is.
 * @param usage How much of the library races the circuit
 * @param picked The disciplines picked
 * @returns True when the circuit belongs under them
 */
export const underDisciplines = (usage: CircuitUsage | undefined, picked: readonly Discipline[]): boolean => (
  picked.length === 0 || picked.some((discipline) => (usage?.disciplines.get(discipline) ?? 0) > 0)
);

/**
 * Whether a circuit answers a search: its name, a layout's, or the name or
 * folder of a track one of them races.
 * @param circuit The circuit
 * @param states Each layout's state by its id, or null while being read
 * @param terms The folded search terms
 * @returns True when every term is found
 */
export const matchesSearch = (
  circuit: RecommendedCircuit,
  states: ReadonlyMap<string, RecommendedTrackState> | null,
  terms: readonly string[],
): boolean => matchesTerms(terms, [
  circuit.name,
  ...circuit.layouts.flatMap((layout) => {
    const shown = shownTrack(states?.get(layout.id));
    return [layout.name, shown?.name ?? null, shown?.key ?? null];
  }),
]);

/**
 * Puts circuits in order: by how many championships race them, their name or
 * their country, ties going by name.
 * @param circuits The circuits
 * @param usage How much of the library races each circuit
 * @param sort What to sort by
 * @param direction Which way
 * @param nationOf What a nation code is called, in the reader's language
 * @returns The circuits, sorted
 */
export const sortCircuits = (
  circuits: readonly RecommendedCircuit[],
  usage: ReadonlyMap<string, CircuitUsage>,
  sort: TrackSortKey,
  direction: SortDirection,
  nationOf: (code: string) => string,
): RecommendedCircuit[] => {
  const sign = direction === 'asc' ? 1 : -1;
  const by = (left: RecommendedCircuit, right: RecommendedCircuit): number => {
    if (sort === 'championships') {
      return (usage.get(left.id)?.championships ?? 0) - (usage.get(right.id)?.championships ?? 0);
    }
    if (sort === 'country') return nationOf(left.nation).localeCompare(nationOf(right.nation));
    return left.name.localeCompare(right.name);
  };

  return [...circuits].sort((left, right) => sign * by(left, right) || left.name.localeCompare(right.name));
};
