// Shared builders for the sponsor tests: one road championship of a single
// class, the player's seat sharing a team with seat-1, a career to hang it on
// and a deal signed on the first of the year.

import { DEFAULT_CAREER_SETTINGS } from '../../../constants/index.ts';
import { Discipline } from '../../../types/index.ts';
import type {
  Career,
  CareerSeason,
  Championship,
  DriverStanding,
  RacePlace,
  RaceScore,
  SeasonEntry,
  SeasonEvent,
  SponsorDeal,
} from '../../../types/index.ts';

/**
 * The cup: one road class of four seats, the player's (seat-2) and seat-1 in
 * one team.
 */
export const CUP: Championship = {
  version: 1,
  id: 'test-cup',
  name: 'Test Cup',
  teams: [{ id: 'works', name: 'Works Racing' }],
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 4 },
    seats: [{ id: 'seat-1', team: 'works' }, { id: 'seat-2', team: 'works' }, { id: 'seat-3' }, { id: 'seat-4' }],
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
  team: 'works',
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
 * Builds a race of the whole class: the player where the test puts them, and
 * the other three seats filling the places left in seat order.
 * @param launch Which launch of the event it was
 * @param mine The player's own place
 * @param over Whatever the test wants said differently
 * @returns The race
 */
export const makeRace = (launch: number, mine: RacePlace, over: Partial<RaceScore> = {}): RaceScore => {
  const free = [1, 2, 3, 4].filter((one) => one !== mine.classPosition);
  const others = ['seat-1', 'seat-3', 'seat-4'].map((seat, at) => makePlace(free[at], { seat, driver: seat }));

  return {
    launch, session: null, name: `Race ${launch}`, pointsSystem: 'standard', places: [mine, ...others], ...over,
  };
};

/**
 * Builds a dated round, scored where it is handed races.
 * @param round The round's id
 * @param date The ISO date it is raced on
 * @param races What it scored, or nothing for a round not yet raced
 * @returns The event
 */
export const makeEvent = (round: string, date: string, races?: readonly RaceScore[]): SeasonEvent => ({
  round,
  raceId: `test-cup/${round}@0.0`,
  date,
  status: races ? 'raced' : 'scheduled',
  sessions: [],
  ...(races ? { score: { round, recordedAt: `${date}T18:00:00.000Z`, races } } : {}),
});

/**
 * Builds a row of the cup's table.
 * @param seat Whose
 * @param position Where it stands
 * @param over Whatever the test wants said differently
 * @returns The row
 */
export const makeStanding = (seat: string, position: number, over: Partial<DriverStanding> = {}): DriverStanding => ({
  seat,
  driver: seat,
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
 * @param index Which season it is
 * @returns The season
 */
export const makeSeason = (entries: readonly SeasonEntry[] = [], index = 0): CareerSeason => ({
  index,
  startDate: `${2027 + index}-01-01`,
  endDate: `${2027 + index}-12-31`,
  entries,
});

/**
 * Builds a deal: a partner covering any racing, paying for a top-half class
 * place, signed on the first of 2027.
 * @param over Whatever the test wants said differently
 * @returns The deal
 */
export const makeDeal = (over: Partial<SponsorDeal> = {}): SponsorDeal => ({
  id: 'sponsor:test-cup/zero@0.0',
  sponsor: { name: 'Halden Lubricants', trade: 'oil', nation: 'GBR' },
  slot: 'partner',
  covers: null,
  perks: [{ kind: 'racePay', amount: 500 }],
  target: { kind: 'classPlace', share: 1 / 2 },
  goal: { kind: 'racesStarted', count: 2 },
  rung: 4,
  signed: '2027-01-01',
  until: '2028-01-01',
  ...over,
});

/**
 * Builds a career at Silver in every discipline, its clock on the day the test
 * puts it.
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
  date: '2027-07-01',
  level: {
    [Discipline.SINGLE_SEATER]: 4,
    [Discipline.SPORTSCAR]: 4,
    [Discipline.TOURING]: 4,
    [Discipline.ROAD]: 4,
  },
  ratingLog: [],
  seasons: [],
  inbox: [],
  sponsors: [],
  ...over,
});

/**
 * A career whose one season raced the cup over the rounds given.
 * @param events The cup's rounds
 * @param over Whatever the test wants said differently of the career
 * @param entry Whatever the test wants said differently of the entry
 * @returns The career
 */
export const racedCareer = (
  events: readonly SeasonEvent[],
  over: Partial<Career> = {},
  entry: Partial<SeasonEntry> = {},
): Career => makeCareer({ seasons: [makeSeason([makeEntry({ events, ...entry })])], ...over });
