// Shared fixtures for the results helpers under lib/: a two-round
// championship of three seats in one class, and builders for what a race paid.

import { SERIES_FORMAT_VERSION } from '../../../../../shared/constants';
import { Discipline } from '../../../../../shared/types';
import type {
  Championship, ChampionshipResults, RacePlace, RaceScore, RoundScore,
} from '../../../../../shared/types';

/**
 * A championship of one class and three seats, two of them team-mates. Its
 * first round runs qualifying then a race, its second two races.
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
      { id: 'main-1', driver: { name: 'Ada', nationCode: 'ITA' }, team: 'alpha' },
      { id: 'main-2', driver: { name: 'Bo' }, team: 'alpha' },
      { id: 'main-3', driver: { name: 'Cy' }, team: 'beta' },
    ],
    eligibility: { kind: 'cars', cars: ['test_car'] },
  }],
  teams: [
    { id: 'alpha', name: 'Alpha Racing', nationCode: 'GBR' },
    { id: 'beta', name: 'Beta Racing' },
  ],
  rounds: [
    { id: 'r1', name: 'Magione', track: { id: 'magione' } },
    {
      id: 'r2', name: 'Vallelunga', track: { id: 'vallelunga' }, weekendFormat: 'double',
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [{ type: 'qualify', name: 'Qualifying', minutes: 10 }, { type: 'race', laps: 8 }],
    },
    {
      id: 'double',
      name: 'Two races',
      sessions: [{ type: 'race', name: 'Race 1', laps: 8 }, { type: 'race', name: 'Race 2', laps: 8 }],
    },
  ],
  defaultWeekendFormat: 'standard',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
  defaultPointsSystem: 'race',
  ...overrides,
});

/**
 * One car's place in one race, everything scoring adds up defaulted.
 * @param seat The seat
 * @param position Where it finished, which is also its class position
 * @param overrides What else to change
 * @returns The place
 */
export const place = (seat: string, position: number, overrides: Partial<RacePlace> = {}): RacePlace => {
  const finishPoints = [10, 8, 6][position - 1] ?? 0;

  return {
    seat,
    entry: 'main',
    team: seat === 'main-3' ? 'beta' : 'alpha',
    driver: seat,
    position,
    classPosition: position,
    qualifyingPosition: null,
    fastestLap: false,
    finishPoints,
    fastestLapPoints: 0,
    qualifyingPoints: 0,
    points: finishPoints,
    ...overrides,
  };
};

/**
 * One race's score.
 * @param launch Which launch of the weekend it was
 * @param places Its places, in finishing order
 * @returns The score
 */
export const race = (launch: number, places: readonly RacePlace[]): RaceScore => ({
  launch, session: null, name: 'Race', pointsSystem: 'race', places,
});

/**
 * One round's score.
 * @param round The round, by its id
 * @param races Its races
 * @returns The score
 */
export const roundScore = (round: string, races: readonly RaceScore[]): RoundScore => ({
  round, recordedAt: '2026-05-01T12:00:00.000Z', races,
});

/**
 * The season as the career reports it: round one won by Ada from Bo and Cy,
 * round two both won by Cy from Bo and Ada, the player in Ada's seat.
 * @param overrides What to change about it
 * @returns The season
 */
export const makeResults = (overrides: Partial<ChampionshipResults> = {}): ChampionshipResults => ({
  championship: makeSeries(),
  rounds: [
    {
      round: 'r1',
      raceDay: '2026-05-03',
      status: 'raced',
      score: roundScore('r1', [race(1, [place('main-1', 1), place('main-2', 2), place('main-3', 3)])]),
      sessions: [],
    },
    {
      round: 'r2',
      raceDay: '2026-05-17',
      status: 'raced',
      score: roundScore('r2', [
        race(0, [place('main-3', 1), place('main-2', 2), place('main-1', 3)]),
        race(1, [place('main-3', 1), place('main-2', 2), place('main-1', 3)]),
      ]),
      sessions: [],
    },
  ],
  playerSeat: 'main-1',
  playerEntry: 'main',
  ...overrides,
});
