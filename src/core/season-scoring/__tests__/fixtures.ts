// Shared fixtures for the season-scoring tests: a four-seat championship whose
// seats, teams and drivers can be read at a glance, and the grid row builder
// both suites compose their entry lists out of.

import { SERIES_FORMAT_VERSION } from '../../../shared/constants/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type { Championship, GridEntry } from '../../../shared/types/index.ts';

/**
 * Builds one entry on a weekend's grid, defaulting everything scoring never
 * reads - scoring only cares about the seat, the class, the team and the name.
 * @param row What the test cares about
 * @returns A complete GridEntry
 */
export const gridRow = (row: Partial<GridEntry> = {}): GridEntry => ({
  model: 'test_car',
  skin: 'red',
  driver: 'Driver',
  nationality: '',
  nationCode: '',
  setup: '',
  ballast: 0,
  restrictor: 0,
  ...row,
});

/**
 * A championship of one class and four seats, two of them team-mates.
 *
 * The points table stops at three places, so the fourth seat scoring nothing is
 * a fact a test can assert rather than an accident. Fastest lap and qualifying
 * pay nothing here, so a test that wants them replaces the table.
 * @param overrides What to change about it
 * @returns The championship
 */
export const makeSeries = (overrides: Partial<Championship> = {}): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: 'test-cup',
  name: 'Test Cup',
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 6 },
    seats: [
      { id: 'main-1', driver: { name: 'Ada' }, team: 'alpha' },
      { id: 'main-2', driver: { name: 'Bo' }, team: 'alpha' },
      { id: 'main-3', driver: { name: 'Cy' }, team: 'beta' },
      { id: 'main-4', driver: { name: 'Di' } },
    ],
    eligibility: { kind: 'cars', cars: ['test_car'] },
  }],
  teams: [
    { id: 'alpha', name: 'Alpha Racing' },
    { id: 'beta', name: 'Beta Racing' },
  ],
  rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
  weekendFormats: [{
    id: 'standard',
    name: 'Race weekend',
    sessions: [{ type: 'race', name: 'Race', laps: 8 }],
  }],
  defaultWeekendFormat: 'standard',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
  defaultPointsSystem: 'race',
  ...overrides,
});

/**
 * The four-car grid the championship above fields, one car per seat.
 * @returns A fresh grid, so a test mutating it cannot affect another
 */
export const makeGrid = (): GridEntry[] => [
  gridRow({
    seat: 'main-1', entry: 'main', team: 'alpha', driver: 'Ada',
  }),
  gridRow({
    seat: 'main-2', entry: 'main', team: 'alpha', driver: 'Bo',
  }),
  gridRow({
    seat: 'main-3', entry: 'main', team: 'beta', driver: 'Cy',
  }),
  gridRow({ seat: 'main-4', entry: 'main', driver: 'Di' }),
];
