// Shared builders for the career rating tests: one championship of a single
// road class on the fourth rung, whose three rounds run a lone race, a
// qualifying into a race and a three-segment knockout into a race, a season to
// hang it on, and a career on the fourth rung with nothing rated yet.

import { DEFAULT_CAREER_SETTINGS } from '../../../shared/constants/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type {
  Career,
  CareerSeason,
  Championship,
  LaunchRecord,
  SeasonEntry,
  SeasonEvent,
} from '../../../shared/types/index.ts';

/**
 * Every car of the six-car field, the player's own first.
 */
export const FIELD: readonly number[] = [0, 1, 2, 3, 4, 5];

/**
 * The cup: one road class on the fourth rung, and a round for each format.
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
    {
      id: 'two', name: 'Round two', track: { id: 'track_two' }, eventFormat: 'qualified',
    },
    {
      id: 'three', name: 'Round three', track: { id: 'track_three' }, eventFormat: 'knockout',
    },
  ],
  eventFormats: [
    { id: 'race', name: 'Race', sessions: [{ type: 'race', name: 'Race', laps: 10 }] },
    {
      id: 'qualified',
      name: 'Qualified',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 10 },
        {
          id: 'q', type: 'qualify', name: 'Qualifying', minutes: 10,
        },
        {
          type: 'race', name: 'Race', laps: 10, inherit: { from: 'q' },
        },
      ],
    },
    {
      id: 'knockout',
      name: 'Knockout',
      sessions: [
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 5,
        },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 5, inherit: { from: 'q1', top: 4 },
        },
        {
          id: 'q3', type: 'qualify', name: 'Q3', minutes: 5, inherit: { from: 'q2', top: 2 },
        },
        {
          type: 'race', name: 'Race', laps: 10, inherit: { from: 'q3' },
        },
      ],
    },
  ],
  defaultEventFormat: 'race',
  pointsSystems: [{ id: 'standard', name: 'Standard', positions: [25, 18, 15] }],
  defaultPointsSystem: 'standard',
};

/**
 * The cup with its one class moved to another place on the ladder.
 * @param tier The rung it enters at
 * @param discipline The discipline it enters, road unless said otherwise
 * @returns The championship
 */
export const cupAt = (tier: number, discipline: Discipline = Discipline.ROAD): Championship => ({
  ...CUP,
  entries: [{ ...CUP.entries[0], ladder: { discipline, tier } }],
});

/**
 * Builds a launch that was driven, its whole field run and read back.
 * @param index Which launch of the round it was
 * @param classification The order it classified the cars in
 * @param over Whatever the test wants said differently
 * @returns The record
 */
export const makeRecord = (
  index: number,
  classification: readonly number[] | null,
  over: Partial<LaunchRecord> = {},
): LaunchRecord => ({
  index,
  completedAt: `2027-03-07T1${index}:00:00.000Z`,
  archive: `archive-${index}.json`,
  gridOrder: [...FIELD],
  classification: classification === null ? null : [...classification],
  ...over,
});

/**
 * Builds a round on the calendar with the launches it ran.
 * @param round The round's id
 * @param date The ISO date it is raced on
 * @param sessions The launches that have run
 * @param over Whatever the test wants said differently
 * @returns The event
 */
export const makeEvent = (
  round: string,
  date: string,
  sessions: readonly LaunchRecord[] = [],
  over: Partial<SeasonEvent> = {},
): SeasonEvent => ({
  round,
  raceId: `test-cup/${round}@0.0`,
  date,
  status: sessions.length > 0 ? 'raced' : 'scheduled',
  sessions,
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
 * @param index Which season of the career it is
 * @returns The season
 */
export const makeSeason = (entries: readonly SeasonEntry[] = [], index = 0): CareerSeason => ({
  index,
  startDate: `${2027 + index}-01-01`,
  endDate: `${2027 + index}-12-31`,
  entries,
});

/**
 * Builds a career on the fourth rung of every discipline, at that rung's
 * floor, nothing rated yet.
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
    [Discipline.SINGLE_SEATER]: 2000,
    [Discipline.SPORTSCAR]: 2000,
    [Discipline.TOURING]: 2000,
    [Discipline.ROAD]: 2000,
  },
  globalRating: 2000,
  startDate: '2027-01-01',
  date: '2027-01-01',
  level: {
    [Discipline.SINGLE_SEATER]: 4,
    [Discipline.SPORTSCAR]: 4,
    [Discipline.TOURING]: 4,
    [Discipline.ROAD]: 4,
  },
  ratingLog: [],
  seasons: [],
  ...over,
});

/**
 * Builds a career holding one season with the entries given.
 * @param entries The season's entries
 * @param over Whatever the test wants said differently of the career
 * @returns The career
 */
export const careerWith = (entries: readonly SeasonEntry[], over: Partial<Career> = {}): Career => makeCareer({
  seasons: [makeSeason(entries)], ...over,
});

/**
 * Builds a career whose one entry raced the lone race of round one.
 * @param classification The order the race finished in
 * @param over Whatever the test wants said differently of the race's launch
 * @param career Whatever the test wants said differently of the career
 * @returns The career
 */
export const racedOnce = (
  classification: readonly number[],
  over: Partial<LaunchRecord> = {},
  career: Partial<Career> = {},
): Career => careerWith([makeEntry({
  events: [makeEvent('one', '2027-03-07', [makeRecord(0, classification, over)])],
})], career);
