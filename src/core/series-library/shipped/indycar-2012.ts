import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * An IndyCar road-course event: practice, the knockout to the Fast Six, and
 * the race.
 */
const EVENT: EventFormat = {
  id: 'road-course',
  name: 'Road course',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
    { id: 'q1', type: 'qualify', name: 'Round 1', minutes: 12, day: 1 },
    { id: 'q2', type: 'qualify', name: 'Round 2', minutes: 10, day: 1, inherit: { from: 'q1', top: 12 } },
    { id: 'q3', type: 'qualify', name: 'Fast Six', minutes: 6, day: 1, inherit: { from: 'q2', top: 6 } },
    { id: 'race', type: 'race', name: 'Race', laps: 85, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * IndyCar, 2012 - the first season of the DW12.
 *
 * VRC's Formula North America 2012 is the car, its road kit for road courses
 * and its oval kit for the speedway; a round fields whichever kit its circuit
 * needs. Of its fifteen rounds, Long Beach, the Indianapolis 500 over its 200
 * laps, Mid-Ohio and Sonoma are raced. The finale, the 500 miles of Fontana,
 * runs at Daytona's tri-oval over the same distance, because Fontana has no
 * recommended track; the IndyCar field never raced there. St. Petersburg,
 * Barber, Sao Paulo, Detroit, Texas, Milwaukee, Iowa, Toronto, Edmonton and
 * Baltimore have none either.
 *
 * Qualifying is the road-course knockout, twenty-four cars cut to twelve and
 * then to the Fast Six; the ovals run a single session. Points are
 * 50-40-35-32-30-28-26 and down, a point for pole; the points for leading a
 * lap and leading the most cannot be stated yet. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2012_IndyCar_Series
 */
export const INDYCAR_2012: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'indycar-2012',
  name: 'IndyCar 2012',
  description: {
    en: 'IndyCar\'s first DW12 season on VRC\'s Formula North America 2012: Sonoma, and the Fontana'
      + ' 500-mile finale run at Daytona.',
    uk: 'Перший сезон IndyCar на DW12, на Formula North America 2012 від VRC: Сонома і фінальні 500 миль '
      + 'Фонтани, які розігруються в Дайтоні.',
  },
  teams: [
    team('lakeshore', 'Lakeshore Racing', 'USA', TeamBudget.WORKS),
    team('crossroads', 'Crossroads Motorsports', 'USA', TeamBudget.WORKS),
    team('bluegrass', 'Bluegrass Racing', 'USA', TeamBudget.INDEPENDENT),
    team('lone-star', 'Lone Star Racing', 'USA', TeamBudget.INDEPENDENT),
    team('great-plains', 'Great Plains Motorsports', 'USA', TeamBudget.INDEPENDENT),
    team('cascade', 'Cascade Racing', 'USA', TeamBudget.INDEPENDENT),
    team('motor-city', 'Motor City Racing', 'USA', TeamBudget.PRIVATEER),
    team('gulf-coast', 'Gulf Coast Motorsports', 'USA', TeamBudget.PRIVATEER),
    team('prairie', 'Prairie Fire Racing', 'CAN', TeamBudget.PRIVATEER),
    team('keystone', 'Keystone Racing', 'USA', TeamBudget.PRIVATEER),
    team('sonoran', 'Sonoran Racing', 'USA', TeamBudget.PRIVATEER),
    team('tidewater', 'Tidewater Motorsports', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'indycar',
      name: 'IndyCar',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      seats: [
        seat('lak-1', 'lakeshore', 'Brody Kincannon', 'USA'),
        seat('lak-2', 'lakeshore', 'Dalton Pruett', 'USA'),
        seat('cro-1', 'crossroads', 'Jace Whitcomb', 'USA'),
        seat('cro-b-1', 'crossroads', 'Rafael Quiroga', 'MEX'),
        seat('blu-1', 'bluegrass', 'Colt Abernathy', 'USA'),
        seat('blu-b-1', 'bluegrass', 'Sebastián Arboleda', 'COL'),
        seat('lon-1', 'lone-star', 'Tanner Guidry', 'USA'),
        seat('lon-2', 'lone-star', 'Hayes Kilgore', 'USA'),
        seat('gre-1', 'great-plains', 'Wade Tollison', 'USA'),
        seat('gre-b-1', 'great-plains', 'Emeric Vautrin', 'FRA'),
        seat('cas-1', 'cascade', 'Logan Birchfield', 'USA'),
        seat('cas-b-1', 'cascade', 'Callum Rennick', 'GBR'),
        seat('mot-1', 'motor-city', 'Dominic Szabo', 'USA'),
        seat('mot-b-1', 'motor-city', 'Anton Lindqvist', 'SWE'),
        seat('gul-1', 'gulf-coast', 'Beau Thibodeaux', 'USA'),
        seat('gul-b-1', 'gulf-coast', 'Kai Nakagawa', 'JPN'),
        seat('pra-1', 'prairie', 'Ryder Boisvenue', 'CAN'),
        seat('pra-2', 'prairie', 'Nolan Beaudry', 'CAN'),
        seat('key-1', 'keystone', 'Trent Hollabaugh', 'USA'),
        seat('key-b-1', 'keystone', 'Aidan Keough', 'IRL'),
        seat('son-1', 'sonoran', 'Mateo Valenzuela', 'MEX'),
        seat('son-b-1', 'sonoran', 'Ezra Whitlock', 'USA'),
        seat('tid-1', 'tidewater', 'Garrison Pettus', 'USA'),
        seat('tid-b-1', 'tidewater', 'Oskar Brantberg', 'SWE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2012_ROAD },
    },
  ],
  eventFormats: [
    EVENT,
    {
      id: 'oval',
      name: 'Oval, 200 laps',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: 'Race', laps: 200, day: 2 },
      ],
    },
    {
      id: 'indianapolis-500',
      name: 'Indianapolis 500',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: 'Race', laps: 200, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'road-course',
  rounds: [
    {
      id: 'long-beach',
      name: 'Long Beach',
      track: recommendedTrack('long-beach/street'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'indianapolis-500',
      name: 'Indianapolis 500',
      track: recommendedTrack('indianapolis/oval'),
      eventFormat: 'indianapolis-500',
      eligibility: [{ entry: 'indycar', eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2012_OVAL } }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mid-ohio',
      name: 'Mid-Ohio',
      track: recommendedTrack('mid-ohio/full'),
      climate: Climate.TEMPERATE,
    },
    { id: 'sonoma', name: 'Sonoma', track: recommendedTrack('sonoma/indycar'), climate: Climate.TEMPERATE },
    {
      id: 'daytona',
      name: 'Daytona International Speedway',
      track: recommendedTrack('daytona/oval'),
      eventFormat: 'oval',
      eligibility: [{ entry: 'indycar', eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2012_OVAL } }],
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [50, 40, 35, 32, 30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5],
      qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [60000, 42000, 30000, 22800, 17400, 13200, 9600, 7200, 4800, 3000],
    standings: [480000, 300000, 192000, 126000, 78000],
  },
};
