// Shared fixtures for the round-simulation tests: a two-class championship far
// enough apart in pace that the order of the classes is never in doubt.

import { SERIES_FORMAT_VERSION } from '../../../shared/constants/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type { Championship, Seat } from '../../../shared/types/index.ts';

/**
 * A class's seats, named for the class and numbered from one.
 * @param entry The class entry's id
 * @param count How many seats
 * @returns The seats
 */
const seats = (entry: string, count: number): Seat[] => Array.from({ length: count }, (unused, at) => ({
  id: `${entry}-${at + 1}`,
  team: at % 2 === 0 ? 'alpha' : 'beta',
  driver: { name: `${entry.toUpperCase()} Driver ${at + 1}` },
}));

/**
 * A championship of a GT3 and a GT4 class, four seats each, raced over a
 * qualifying and a race that pays for qualifying and the fastest lap.
 * @param overrides What to change about it
 * @returns The championship
 */
export const makeSeries = (overrides: Partial<Championship> = {}): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: 'test-gt',
  name: 'Test GT',
  teams: [
    { id: 'alpha', name: 'Alpha Racing', nationCode: 'GBR' },
    { id: 'beta', name: 'Beta Racing' },
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: seats('gt3', 4),
      eligibility: { kind: 'cars', cars: ['gt3_car'] },
    },
    {
      id: 'gt4',
      name: 'GT4',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: seats('gt4', 4),
      eligibility: { kind: 'cars', cars: ['gt4_car'] },
    },
  ],
  rounds: [{ id: 'monza', name: 'Monza', track: { id: 'monza' } }],
  eventFormats: [{
    id: 'standard',
    name: 'Standard',
    sessions: [
      { type: 'qualify', name: 'Qualifying', minutes: 15 },
      { type: 'race', name: 'Race', laps: 10 },
    ],
  }],
  defaultEventFormat: 'standard',
  pointsSystems: [{
    id: 'race', name: 'Race points', positions: [10, 8, 6, 4], fastestLap: 1, qualifying: [3, 2, 1],
  }],
  defaultPointsSystem: 'race',
  ...overrides,
});
