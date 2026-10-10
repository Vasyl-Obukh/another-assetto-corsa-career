// Shared builders for the career-store tests. Deliberately small: one
// two-round championship with a single class, a season to hang it on, and a
// three-session event plan. Everything the function under test does not read
// is cast rather than written out.

import { Discipline } from '../../../shared/types/index.ts';
import type {
  Career,
  CareerSeason,
  Championship,
  ClassEntry,
  EventPlan,
  GridEntry,
  RaceDefinition,
  Round,
  SeasonEntry,
  SeasonEvent,
  SeriesAvailability,
  SeriesListing,
  SeriesRequirements,
  SessionDefinition,
} from '../../../shared/types/index.ts';
import { CAREER_VERSION } from '../constants.ts';

/**
 * Builds a class entry with two seats and a one-make car list.
 * @param over Whatever the test wants said differently
 * @returns The class entry
 */
export const makeClassEntry = (over: Partial<ClassEntry> = {}): ClassEntry => ({
  id: 'main',
  name: 'Main',
  ladder: { discipline: Discipline.ROAD, tier: 4 },
  seats: [{ id: 'seat-1' }, { id: 'seat-2' }],
  eligibility: { kind: 'cars', cars: ['test_car'] },
  ...over,
});

/**
 * Builds a round running on a track of its own name.
 * @param id The round's id
 * @param over Whatever the test wants said differently
 * @returns The round
 */
export const makeRound = (id: string, over: Partial<Round> = {}): Round => ({
  id,
  name: `Round ${id}`,
  track: { id: `track_${id}` },
  ...over,
});

/**
 * Builds a championship with a three-day event and two rounds.
 * @param over Whatever the test wants said differently
 * @returns The championship
 */
export const makeChampionship = (over: Partial<Championship> = {}): Championship => ({
  version: 1,
  id: 'test-cup',
  name: 'Test Cup',
  entries: [makeClassEntry()],
  rounds: [makeRound('one'), makeRound('two')],
  eventFormats: [{
    id: 'standard',
    name: 'Standard',
    sessions: [
      { type: 'practice', name: 'Practice', minutes: 30 },
      {
        type: 'qualify', id: 'q', name: 'Qualifying', minutes: 15, day: 1,
      },
      {
        type: 'race', name: 'Race', laps: 10, day: 2, inherit: { from: 'q' },
      },
    ],
  }],
  defaultEventFormat: 'standard',
  pointsSystems: [{ id: 'standard', name: 'Standard', positions: [25, 18, 15] }],
  defaultPointsSystem: 'standard',
  ...over,
});

/**
 * Builds a dated event, its event running from the day it opens.
 * @param round The round's id
 * @param date The ISO date it is raced on
 * @param over Whatever the test wants said differently
 * @returns The event
 */
export const makeEvent = (
  round: string,
  date: string,
  over: Partial<SeasonEvent> = {},
): SeasonEvent => ({
  round,
  raceId: `test-cup/${round}`,
  date,
  status: 'scheduled',
  sessions: [],
  ...over,
});

/**
 * Builds a season entry holding its own copy of the championship.
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
export const makeEntry = (over: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: 'test-cup',
  championship: makeChampionship(),
  entry: 'main',
  playerSeat: 'seat-2',
  car: { model: 'test_car' },
  field: [],
  events: [],
  standings: { classes: [], updatedAt: '2026-01-04T00:00:00.000Z' },
  ...over,
});

/**
 * Builds a season opening on a Sunday.
 * @param over Whatever the test wants said differently
 * @returns The season
 */
export const makeSeason = (over: Partial<CareerSeason> = {}): CareerSeason => ({
  index: 0,
  startDate: '2026-01-04',
  endDate: '2027-01-02',
  entries: [],
  ...over,
});

/**
 * Builds a career whose clock stands on its opening day.
 * @param over Whatever the test wants said differently
 * @returns The career
 */
export const makeCareer = (over: Partial<Career> = {}): Career => ({
  version: CAREER_VERSION,
  id: 'career-1',
  createdAt: '2026-01-04T00:00:00.000Z',
  startDate: '2026-01-04',
  date: '2026-01-04',
  level: {
    [Discipline.SINGLE_SEATER]: 4,
    [Discipline.SPORTSCAR]: 4,
    [Discipline.TOURING]: 4,
    [Discipline.ROAD]: 4,
  },
  seasons: [],
  ...over,
});

/**
 * Builds an availability saying every round of a championship can be raced.
 * @param series The championship it describes
 * @param over Whatever the test wants said differently
 * @returns The availability
 */
export const makeAvailability = (
  series: Championship,
  over: Partial<SeriesAvailability> = {},
): SeriesAvailability => ({
  series: series.id,
  available: true,
  problems: [],
  entries: series.entries.map((entry) => ({
    entry: entry.id, eligible: ['test_car'], missing: [], enough: true,
  })),
  rounds: series.rounds.map((round) => ({
    round: round.id,
    track: null,
    pitboxes: null,
    entries: [],
    races: [{ name: 'Race', laps: 10 }],
  })),
  // Nothing here reads what a championship needs of the content catalogue.
  requires: {} as SeriesRequirements,
  ...over,
});

/**
 * Builds a library listing around a championship.
 * @param series The championship
 * @param over Whatever the test wants said differently
 * @returns The listing
 */
export const makeListing = (
  series: Championship,
  over: Partial<SeriesListing> = {},
): SeriesListing => ({
  series,
  availability: makeAvailability(series),
  origin: 'shipped',
  activeByDefault: true,
  filler: false,
  event: null,
  ...over,
});

/**
 * Builds an event plan of one launch per session, each on the day it states.
 *
 * Only what eventSessions and the grid composition read is real: the launch's
 * own race carries the session and its conditions, and the field is four cars
 * of descending skill with the player first.
 * @param sessions The sessions, in the order they run
 * @param over Whatever the test wants said differently
 * @returns The plan
 */
export const makePlan = (
  sessions: readonly SessionDefinition[],
  over: Partial<EventPlan> = {},
): EventPlan => ({
  raceId: 'test-cup/one',
  raceName: 'Test Cup - Round one',
  grid: Array.from({ length: 4 }, (unused, at) => (
    { driver: `Driver ${at}`, aiLevel: 95 - at } as GridEntry
  )),
  launches: sessions.map((session, index) => ({
    index,
    day: session.day ?? 0,
    session,
    race: { sessions: [session], conditions: session.conditions } as RaceDefinition,
  })),
  ...over,
});
