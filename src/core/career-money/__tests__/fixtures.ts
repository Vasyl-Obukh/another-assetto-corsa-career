// Shared builders for the career money tests: one two-round championship of a
// single class paying a purse per race and per final standing, a season to
// hang it on, and a career whose ledger holds nothing yet.

import { DEFAULT_CAREER_SETTINGS } from '../../../shared/constants/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type {
  Career,
  CareerSeason,
  Championship,
  DriverStanding,
  RacePlace,
  RaceScore,
  SeasonEntry,
  SeasonEvent,
} from '../../../shared/types/index.ts';

/**
 * The cup: two rounds, one class, a purse paying the top three of each race
 * and of the final table.
 */
export const CUP: Championship = {
  version: 1,
  id: 'test-cup',
  name: 'Test Cup',
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 4 },
    seats: [{ id: 'seat-1' }, { id: 'seat-2' }],
    eligibility: { kind: 'cars', cars: ['test_car'] },
  }],
  rounds: [
    { id: 'one', name: 'Round one', track: { id: 'track_one' } },
    { id: 'two', name: 'Round two', track: { id: 'track_two' } },
  ],
  eventFormats: [{ id: 'standard', name: 'Standard', sessions: [{ type: 'race', name: 'Race', laps: 10 }] }],
  defaultEventFormat: 'standard',
  pointsSystems: [{ id: 'standard', name: 'Standard', positions: [25, 18, 15] }],
  defaultPointsSystem: 'standard',
  prizes: { positions: [1000, 600, 400], standings: [10_000, 6000, 4000] },
};

/**
 * Builds a place in a race, the player's own seat by default.
 * @param classPosition Where it finished in its class
 * @param over Whatever the test wants said differently
 * @returns The place
 */
export const makePlace = (classPosition: number, over: Partial<RacePlace> = {}): RacePlace => ({
  seat: 'seat-2',
  entry: 'main',
  team: null,
  driver: 'Test Driver',
  position: classPosition,
  classPosition,
  qualifyingPosition: null,
  fastestLap: false,
  finishPoints: 0,
  fastestLapPoints: 0,
  qualifyingPoints: 0,
  points: 0,
  ...over,
});

/**
 * Builds a scored race.
 * @param launch Which launch of the event it was
 * @param places Its places
 * @param over Whatever the test wants said differently
 * @returns The race
 */
export const makeRace = (
  launch: number,
  places: readonly RacePlace[],
  over: Partial<RaceScore> = {},
): RaceScore => ({
  launch, session: null, name: `Race ${launch}`, pointsSystem: 'standard', places, ...over,
});

/**
 * Builds a dated round, scored where it is handed races.
 * @param round The round's id
 * @param date The ISO date it is raced on
 * @param races What it scored, or nothing for a round not yet raced
 * @param over Whatever the test wants said differently
 * @returns The event
 */
export const makeEvent = (
  round: string,
  date: string,
  races?: readonly RaceScore[],
  over: Partial<SeasonEvent> = {},
): SeasonEvent => ({
  round,
  raceId: `test-cup/${round}@0.0`,
  date,
  status: races ? 'raced' : 'scheduled',
  sessions: [],
  ...(races ? { score: { round, recordedAt: `${date}T18:00:00.000Z`, races } } : {}),
  ...over,
});

/**
 * Builds the player's row in the cup's final table.
 * @param position Where they stand
 * @param over Whatever the test wants said differently
 * @returns The row
 */
export const makeStanding = (position: number, over: Partial<DriverStanding> = {}): DriverStanding => ({
  seat: 'seat-2',
  driver: 'Test Driver',
  team: null,
  position,
  points: 0,
  wins: 0,
  podiums: 0,
  bestFinish: null,
  races: 2,
  ...over,
});

/**
 * Builds the season's entry in the cup.
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
export const makeEntry = (over: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: CUP.id,
  edition: 0,
  championship: CUP,
  entry: 'main',
  playerSeat: 'seat-2',
  car: { model: 'test_car' },
  field: [],
  events: [],
  standings: { classes: [], updatedAt: '2027-01-01T00:00:00.000Z' },
  ...over,
});

/**
 * Builds a season, which is a calendar year.
 * @param entries What it entered
 * @returns The season
 */
export const makeSeason = (entries: readonly SeasonEntry[] = []): CareerSeason => ({
  index: 0, startDate: '2027-01-01', endDate: '2027-12-31', entries,
});

/**
 * Builds a career, its clock on the day the test puts it.
 * @param over Whatever the test wants said differently
 * @returns The career
 */
export const makeCareer = (over: Partial<Career> = {}): Career => ({
  version: 1,
  id: '00000000-0000-4000-8000-000000000001',
  kind: 'career',
  createdAt: '2027-01-01T00:00:00.000Z',
  playedAt: '2027-01-01T00:00:00.000Z',
  driver: { name: 'Test Driver', nation: 'GBR' },
  settings: { ...DEFAULT_CAREER_SETTINGS },
  money: 50_000,
  ledger: [],
  garage: [],
  rating: {
    [Discipline.SINGLE_SEATER]: 1200,
    [Discipline.SPORTSCAR]: 1200,
    [Discipline.TOURING]: 1200,
    [Discipline.ROAD]: 1200,
  },
  startDate: '2027-01-01',
  date: '2027-01-01',
  level: {
    [Discipline.SINGLE_SEATER]: 4,
    [Discipline.SPORTSCAR]: 4,
    [Discipline.TOURING]: 4,
    [Discipline.ROAD]: 4,
  },
  seasons: [],
  ...over,
});
