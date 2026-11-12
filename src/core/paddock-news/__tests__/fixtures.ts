// Shared builders for the paddock news tests: one class of four seats in two
// teams - the player's works team and a privateer - a qualifying and a race,
// and a round recorded off them with laps archived. Everything the functions
// under test do not read is cast rather than written out.

import { Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type {
  Career,
  CareerSeason,
  Championship,
  Contract,
  EventPlan,
  GridEntry,
  LaunchRecord,
  RaceOut,
  RacePlace,
  RaceScore,
  SeasonEntry,
  SeasonEvent,
  SessionDefinition,
} from '../../../shared/types/index.ts';
import { buildStandings } from '../../../shared/utils/standings/index.ts';
import type { LaunchResult } from '../../season-scoring/index.ts';

/**
 * The career every test's mail is for.
 */
export const CAREER_ID = 'career-1';

/**
 * The seats of the class, in the order the plan's grid holds them - the
 * player's first, as every lowering puts it.
 */
export const GRID_SEATS = ['s2', 's1', 's3', 's4'] as const;

/**
 * Builds a championship of one class, four seats and two teams, racing a
 * qualifying and a race a round over three rounds.
 * @param over Whatever the test wants said differently
 * @returns The championship
 */
export const makeChampionship = (over: Partial<Championship> = {}): Championship => ({
  version: 1,
  id: 'gt-cup',
  name: 'GT Cup',
  teams: [
    {
      id: 'aster', name: 'Aster Racing', nationCode: 'GBR', budget: TeamBudget.WORKS,
    },
    {
      id: 'bolt', name: 'Bolt Motorsport', nationCode: 'ITA', budget: TeamBudget.PRIVATEER,
    },
  ],
  entries: [{
    id: 'gt',
    name: 'GT',
    ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
    eligibility: { kind: 'cars', cars: ['gt_car'] },
    seats: [
      { id: 's1', team: 'aster', driver: { name: 'Ann Mate' } },
      { id: 's2', team: 'aster', driver: { name: 'Reese Erve' } },
      { id: 's3', team: 'bolt', driver: { name: 'Cal Third', nationCode: 'DEU' } },
      { id: 's4', team: 'bolt', driver: { name: 'Dan Fourth' } },
    ],
  }],
  rounds: [
    { id: 'one', name: 'Monza', track: { id: 'monza' } },
    { id: 'two', name: 'Spa', track: { id: 'spa' } },
    { id: 'three', name: 'Imola', track: { id: 'imola' } },
  ],
  eventFormats: [],
  pointsSystems: [{ id: 'race', name: 'Race', positions: [25, 18, 15, 12] }],
  defaultPointsSystem: 'race',
  ...over,
} as Championship);

/**
 * The qualifying a round runs.
 */
export const QUALIFY: SessionDefinition = { type: 'qualify', id: 'q', name: 'Qualifying', minutes: 15 };

/**
 * The race a round runs, its grid off the qualifying.
 */
export const RACE: SessionDefinition = { type: 'race', name: 'Race', laps: 10, inherit: { from: 'q' } };

/**
 * Builds the plan a round lowered to: the class's four cars, the player's seat
 * first, and a launch per session.
 * @param sessions The sessions, in the order they run
 * @returns The plan
 */
export const makePlan = (sessions: readonly SessionDefinition[] = [QUALIFY, RACE]): EventPlan => ({
  raceId: 'gt-cup/one@0.0',
  raceName: 'GT Cup - Monza',
  grid: GRID_SEATS.map((seat) => ({
    driver: seat, seat, entry: 'gt', team: seat === 's1' || seat === 's2' ? 'aster' : 'bolt',
  } as GridEntry)),
  launches: sessions.map((session, index) => ({
    index, day: 0, session, race: { sessions: [session] },
  })) as EventPlan['launches'],
});

/**
 * Builds a launch's record, run in the event grid's own order.
 * @param index Which launch
 * @param classification Car indices, in the order it classified them
 * @param over Whatever the test wants said differently
 * @returns The record
 */
export const makeRecord = (
  index: number,
  classification: number[],
  over: Partial<LaunchRecord> = {},
): LaunchRecord => ({
  index,
  completedAt: '2026-03-01T12:00:00.000Z',
  archive: `launch-${index}.json`,
  gridOrder: [0, 1, 2, 3],
  classification,
  ...over,
});

/**
 * Builds what a launch archived: each car's laps, -1 for one invalidated.
 * @param launch Which launch
 * @param type Assetto Corsa's number for the session's kind
 * @param laps Each car's lap times, by car index
 * @returns The archive
 */
export const makeResult = (
  launch: number,
  type: number,
  laps: readonly (readonly number[])[],
): LaunchResult => ({
  launch,
  raceOut: {
    sessions: [{
      type,
      laps: laps.flatMap((times, car) => times.map((time) => ({ car, time }))),
    }],
  } as unknown as RaceOut,
});

/**
 * Builds a race's places, the cars in the order given, each scoring off the
 * points table.
 * @param launch Which launch the race was
 * @param seats The seats, winner first
 * @param over What to say differently of a seat's place
 * @returns The race's score
 */
export const makeRace = (
  launch: number,
  seats: readonly string[],
  over: Record<string, Partial<RacePlace>> = {},
): RaceScore => ({
  launch,
  session: null,
  name: 'Race',
  pointsSystem: 'race',
  places: seats.map((seat, at) => ({
    seat,
    entry: 'gt',
    team: seat === 's1' || seat === 's2' ? 'aster' : 'bolt',
    driver: seat,
    position: at + 1,
    classPosition: at + 1,
    qualifyingPosition: null,
    fastestLap: false,
    finishPoints: [25, 18, 15, 12][at] ?? 0,
    fastestLapPoints: 0,
    qualifyingPoints: 0,
    points: [25, 18, 15, 12][at] ?? 0,
    ...over[seat],
  })),
});

/**
 * Builds a dated round.
 * @param round The round's id
 * @param date The ISO date it is raced on
 * @param over Whatever the test wants said differently
 * @returns The event
 */
export const makeEvent = (round: string, date: string, over: Partial<SeasonEvent> = {}): SeasonEvent => ({
  round,
  raceId: `gt-cup/${round}@0.0`,
  date,
  status: 'scheduled',
  sessions: [],
  ...over,
});

/**
 * Builds the player's entry into the championship, its standings rebuilt off
 * whatever its events scored.
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
export const makeEntry = (over: Partial<SeasonEntry> = {}): SeasonEntry => {
  const entry: SeasonEntry = {
    series: 'gt-cup',
    edition: 0,
    championship: makeChampionship(),
    entry: 'gt',
    playerSeat: 's2',
    car: { model: 'gt_car' },
    field: [],
    events: [
      makeEvent('one', '2026-03-01'),
      makeEvent('two', '2026-04-01'),
      makeEvent('three', '2026-05-01'),
    ],
    standings: { classes: [], updatedAt: '' },
    ...over,
  };
  const scores = entry.events.flatMap((event) => (event.score ? [event.score] : []));

  return over.standings ? entry : { ...entry, standings: buildStandings(entry.championship, scores, '') };
};

/**
 * Builds a works team's contract, signed before the season opens and keeping
 * the player on for a top-two finish.
 * @param over Whatever the test wants said differently
 * @returns The contract
 */
export const makeContract = (over: Partial<Contract> = {}): Contract => ({
  team: 'aster',
  teamName: 'Aster Racing',
  budget: TeamBudget.WORKS,
  nation: 'GBR',
  entry: 'gt',
  seat: 's2',
  car: { model: 'gt_car', skin: 'aster' },
  pay: 'salary',
  amount: 30_000,
  feeCover: 1,
  prizeShare: 25,
  keep: 2,
  offer: 'offer:gt-cup:0.0',
  signed: '2026-01-10',
  ...over,
});

/**
 * Builds a season, a calendar year.
 * @param over Whatever the test wants said differently
 * @returns The season
 */
export const makeSeason = (over: Partial<CareerSeason> = {}): CareerSeason => ({
  index: 0,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  entries: [],
  ...over,
});

/**
 * Builds a career whose news starts the day it opened.
 * @param over Whatever the test wants said differently
 * @returns The career
 */
export const makeCareer = (over: Partial<Career> = {}): Career => ({
  id: CAREER_ID,
  kind: 'career',
  date: '2026-06-01',
  newsFrom: '2026-01-01',
  ledger: [],
  ratingLog: [],
  seasons: [],
  inbox: [],
  ...over,
} as Career);
