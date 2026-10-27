// Shared fixtures for the seat-offers tests: a one-class cup fielded by a team
// of every budget, two cars each, and a team with no budget at all.

import { SERIES_FORMAT_VERSION } from '../../../shared/constants/index.ts';
import { Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship, ClassEntry, Seat } from '../../../shared/types/index.ts';
import type { ClassOfferRequest } from '../index.ts';

/**
 * The cars the cup may be raced in.
 */
export const CUP_CARS = ['cup_a', 'cup_b'] as const;

/**
 * A team's seats in a class, numbered from one.
 * @param entry The class entry's id
 * @param team The team's id
 * @param count How many seats
 * @returns The seats
 */
export const teamSeats = (entry: string, team: string, count: number): Seat[] => (
  Array.from({ length: count }, (unused, at) => ({
    id: `${entry}-${team}-${at + 1}`,
    team,
    driver: { name: `${team} driver ${at + 1}` },
  }))
);

/**
 * A class of the cup, on the third rung of sportscar racing.
 * @param id Its id
 * @param seats Its seats
 * @returns The class entry
 */
export const cupClass = (id: string, seats: Seat[]): ClassEntry => ({
  id,
  name: id.toUpperCase(),
  ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
  seats,
  eligibility: { kind: 'cars', cars: [...CUP_CARS] },
});

/**
 * A one-class cup fielded by a works team, an independent and a privateer, two
 * cars each, and one car of a team that states no budget.
 * @param overrides What to change about it
 * @returns The championship
 */
export const makeCup = (overrides: Partial<Championship> = {}): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: 'test-cup',
  name: 'Test Cup',
  teams: [
    {
      id: 'works', name: 'Works Racing', budget: TeamBudget.WORKS, nationCode: 'DEU',
    },
    { id: 'indy', name: 'Indy Motorsport', budget: TeamBudget.INDEPENDENT },
    { id: 'priv', name: 'Privateer Garage', budget: TeamBudget.PRIVATEER },
    { id: 'none', name: 'Nobody Racing' },
  ],
  entries: [cupClass('cup', [
    ...teamSeats('cup', 'works', 2),
    ...teamSeats('cup', 'indy', 2),
    ...teamSeats('cup', 'priv', 2),
    ...teamSeats('cup', 'none', 1),
  ])],
  rounds: [{ id: 'monza', name: 'Monza', track: { id: 'monza' } }],
  eventFormats: [{ id: 'race', name: 'Race', sessions: [{ type: 'race', name: 'Race', laps: 10 }] }],
  defaultEventFormat: 'race',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6, 4] }],
  defaultPointsSystem: 'race',
  ...overrides,
});

/**
 * A request for the cup's offers from a player at the very top of its rung,
 * experienced there, so every team calls at its best chance.
 * @param overrides What to change about it
 * @returns The request
 */
export const cupRequest = (overrides: Partial<ClassOfferRequest> = {}): ClassOfferRequest => {
  const championship = overrides.championship ?? makeCup();

  return {
    championship,
    entry: championship.entries[0],
    salt: 'career-1\u00000',
    cars: CUP_CARS,
    standing: 'rung',
    position: 1,
    experienced: true,
    fees: [1_000, 1_000, 1_000, 1_000],
    winnerPrize: 2_000,
    prizeSpeed: 1,
    ...overrides,
  };
};
