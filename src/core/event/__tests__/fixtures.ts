// Shared fixtures for the event tests. Deliberately small: one car with
// enough liveries to go round a six-car field, one track with room for it, and
// two four-session events - a plain one and a knockout - plus a planned field of
// three classes.

import type {
  Car, Content, EventPlan, GridEntry, RaceDefinition, RaceOut, RaceOutLap, RaceOutSession, SessionDefinition, Skin,
} from '../../../shared/types/index.ts';
import { carProvenance, trackProvenance } from '../../content-catalogue/index.ts';

/**
 * Builds a livery carrying nothing but its folder name.
 * @param id The livery folder name
 * @returns A complete Skin
 */
const makeSkin = (id: string): Skin => ({
  id, name: id, driver: null, team: null, number: null, country: null,
});

/**
 * Builds a car, defaulting everything the event module does not look at.
 * @param id The car folder name
 * @param skins How many liveries it ships
 * @returns A complete Car
 */
const makeCar = (id: string, skins: number): Car => ({
  id,
  name: id,
  brand: null,
  provenance: carProvenance(id),
  tags: [],
  carClass: null,
  description: null,
  curves: null,
  year: null,
  country: null,
  skins: Array.from({ length: skins }, (unused, index) => makeSkin(`skin_${index}`)),
  performance: {
    bhp: null,
    torqueNm: null,
    weightKg: null,
    topSpeedKph: null,
    accelerationSeconds: null,
    powerToWeight: null,
    raw: {
      bhp: null, torque: null, weight: null, topspeed: null, acceleration: null, pwratio: null,
    },
  },
});

/**
 * Installed content the event tests resolve against.
 * @returns A fresh Content, so a test mutating it cannot affect another
 */
export const makeContent = (): Content => ({
  cars: [makeCar('test_car', 8)],
  tracks: [{
    id: 'test_track',
    layout: '',
    key: 'test_track',
    name: 'Test Track',
    country: null,
    pitboxes: 24,
    lengthM: null,
    widthM: null,
    geotags: { lat: null, lon: null },
    city: null,
    run: null,
    description: null,
    tags: [],
    author: null,
    version: null,
    year: null,
    photos: [],
    logo: false,
    provenance: trackProvenance('test_track'),
  }],
  weather: [{
    id: 'test_clear',
    name: 'Clear',
    type: 15,
    temperatureCoeff: 0,
    author: null,
    timeDiapason: null, cloudCover: 0, rain: null, forceHeadlights: false,
  }],
  controllers: [],
  issues: [],
});

/**
 * A four-session event - practice, qualifying, a sprint and a feature - which
 * is four launches, one each. The feature is reachable now: it was listed and
 * unrunnable while a launch ended at its first race.
 * @returns A fresh RaceDefinition
 */
export const makeEvent = (): RaceDefinition => ({
  id: 'test-event',
  name: 'Test Event',
  track: { id: 'test_track' },
  playerCar: { model: 'test_car', driver: 'Player' },
  grid: { size: 6, aiLevel: 90, aiLevelMin: 80 },
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 10 },
    { type: 'qualify', name: 'Qualifying', minutes: 10 },
    { type: 'race', name: 'Sprint', laps: 2 },
    { type: 'race', name: 'Feature', laps: 6 },
  ],
  conditions: { trackState: 'green' },
});

/**
 * A knockout event: three qualifying segments into a race.
 *
 * Six cars, so Q2 runs four of them and Q3 two - small enough that a composed
 * grid can be read at a glance, and enough that being eliminated is expressible
 * at every stage.
 * @returns A fresh RaceDefinition
 */
export const makeKnockout = (): RaceDefinition => ({
  id: 'test-knockout',
  name: 'Test Knockout',
  track: { id: 'test_track' },
  playerCar: { model: 'test_car', driver: 'Player' },
  grid: { size: 6, aiLevel: 90, aiLevelMin: 80 },
  sessions: [
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 5 },
    {
      id: 'q2', type: 'qualify', name: 'Q2', minutes: 5, inherit: { from: 'q1', top: 4 },
    },
    {
      id: 'q3', type: 'qualify', name: 'Q3', minutes: 5, inherit: { from: 'q2', top: 2 },
    },
    {
      type: 'race', name: 'Race', laps: 3, inherit: { from: 'q3' },
    },
  ],
  conditions: { trackState: 'green' },
});

/**
 * Builds one lap row.
 * @param car Index into the session's car list
 * @param time Lap time in milliseconds, or -1 when invalidated
 * @returns The lap row
 */
export const lap = (car: number, time: number): RaceOutLap => ({
  lap: 0, car, sectors: [], time, cuts: 0, tyre: 'SM',
});

/**
 * Builds one session's results.
 * @param type AC's numeric session type
 * @param name Session name
 * @param laps Lap rows, in the order AC recorded them
 * @returns The session
 */
export const makeSession = (
  type: number,
  name: string,
  laps: RaceOutLap[] = [],
): RaceOutSession => ({
  event: 0, name, type, lapsCount: 0, duration: 0, laps, lapstotal: [], bestLaps: [],
});

/**
 * Builds a race_out.json for a field of the given size.
 * @param sessions The sessions that ran
 * @param drivers How many entries the launch had
 * @returns A RaceOut ready to feed advanceEvent
 */
export const makeRaceOut = (sessions: RaceOutSession[], drivers = 6): RaceOut => ({
  track: 'test_track',
  number_of_sessions: sessions.length,
  players: Array.from({ length: drivers }, (unused, index) => ({
    name: index === 0 ? 'Player' : `AI Driver ${index}`,
    car: 'test_car',
    skin: `skin_${index}`,
  })),
  sessions,
});

/**
 * A qualifying session classifying the field in the given order.
 * @param order Car indices, fastest first
 * @returns The session, each car a half second behind the one ahead
 */
export const makeQualifying = (order: number[]): RaceOutSession => makeSession(
  2,
  'Qualifying',
  order.map((car, position) => lap(car, 60_000 + position * 500)),
);

/**
 * The classes of the multi-class plan, fastest first, and each car's - the
 * player in the middle class, then three prototypes, three GT3s and two GT4s.
 */
export const CLASS_ORDER = ['proto', 'gt3', 'gt4'];
const CAR_CLASSES = ['gt3', 'proto', 'proto', 'proto', 'gt3', 'gt3', 'gt3', 'gt4', 'gt4'];

/**
 * A planned event of three classes, built by hand rather than through
 * planEvent, so each car's class and skill read straight off the list: car 0
 * is the player, and the AI slow steadily down the entry list.
 * @param sessions The event's sessions
 * @param classOrder The classes fastest first, or none to leave it to the grid
 * @returns The plan
 */
export const makeClassPlan = (
  sessions: SessionDefinition[],
  classOrder: readonly string[] | undefined = CLASS_ORDER,
): EventPlan => {
  const grid: GridEntry[] = CAR_CLASSES.map((entry, car) => ({
    model: 'test_car',
    skin: `skin_${car % 8}`,
    driver: car === 0 ? 'Player' : `AI ${car}`,
    nationality: '',
    nationCode: '',
    setup: '',
    ballast: 0,
    restrictor: 0,
    entry,
    ...(car === 0 ? {} : { aiLevel: 96 - car }),
  }));

  return {
    raceId: 'test-classes',
    raceName: 'Test Classes',
    grid,
    launches: sessions.map((session, index) => ({
      index,
      day: 0,
      session,
      race: {
        id: 'test-classes',
        name: 'Test Classes',
        track: { id: 'test_track' },
        playerCar: { model: 'test_car' },
        grid: { size: grid.length, opponents: grid.slice(1) },
        sessions: [session],
      },
    })),
    ...(classOrder ? { classOrder } : {}),
  };
};
