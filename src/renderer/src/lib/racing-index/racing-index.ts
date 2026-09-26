// Which championships race each car and circuit. Worked out in the renderer,
// which already holds the whole library and the class catalogue, so the
// browsers can say it on every card without a query of their own.

import { NOTHING } from './constants.ts';
import type { Racing, RacingIndex } from './types.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { ClassCatalogue, Discipline, SeriesListing } from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';

/**
 * Adds one championship to what a car or circuit races in.
 * @param index What has been gathered so far, keyed by folder ID
 * @param id The car or circuit
 * @param disciplines Which disciplines this championship enters it at
 */
const enter = (
  index: Map<string, { championships: number; disciplines: Set<Discipline> }>,
  id: string,
  disciplines: Iterable<Discipline>,
): void => {
  const entry = index.get(id) ?? { championships: 0, disciplines: new Set<Discipline>() };
  entry.championships += 1;
  [...disciplines].forEach((discipline) => entry.disciplines.add(discipline));
  index.set(id, entry);
};

/**
 * Settles the gathered sets into the order a card reads them in.
 * @param index What was gathered
 * @returns The same entries, disciplines in ladder order
 */
const settle = (
  index: Map<string, { championships: number; disciplines: Set<Discipline> }>,
): Map<string, Racing> => new Map([...index].map(([id, entry]) => [id, {
  championships: entry.championships,
  disciplines: DISCIPLINES.filter((discipline) => entry.disciplines.has(discipline)),
}]));

/**
 * Indexes where every car and circuit races.
 *
 * A car counts once per championship however many of its classes may field it,
 * and a circuit once however many rounds it holds. A circuit takes every
 * discipline of the championships it hosts, since a round is raced by them all.
 * @param listings The championships to count - the ones a career can enter
 * @param catalogue The class catalogue a spec resolves against
 * @returns Where each car and circuit races
 */
export const racingIndex = (
  listings: readonly SeriesListing[],
  catalogue: ClassCatalogue,
): RacingIndex => {
  const cars = new Map<string, { championships: number; disciplines: Set<Discipline> }>();
  const tracks = new Map<string, { championships: number; disciplines: Set<Discipline> }>();

  listings.forEach(({ series }) => {
    const byCar = new Map<string, Set<Discipline>>();
    series.entries.forEach((entry) => {
      fieldableCars(series, entry, catalogue).forEach((car) => {
        byCar.set(car, (byCar.get(car) ?? new Set()).add(entry.ladder.discipline));
      });
    });
    byCar.forEach((disciplines, car) => enter(cars, car, disciplines));

    const all = new Set(series.entries.map((entry) => entry.ladder.discipline));
    new Set(series.rounds.map((round) => round.track.id)).forEach((track) => enter(tracks, track, all));
  });

  return { cars: settle(cars), tracks: settle(tracks) };
};

/**
 * The IDs a browser's raced switch asks for: whatever the caller already
 * narrowed to, kept to what a championship races.
 *
 * An empty list is no filter at all to main, so a pair that allows nothing asks
 * for an ID no folder can have instead.
 * @param allowed What the caller already narrowed to, or undefined for all
 * @param raced What a championship races
 * @returns The IDs to ask for
 */
export const racedIds = (allowed: readonly string[] | undefined, raced: readonly string[]): string[] => {
  const both = allowed === undefined ? [...raced] : allowed.filter((id) => raced.includes(id));

  return both.length === 0 ? [NOTHING] : both;
};
