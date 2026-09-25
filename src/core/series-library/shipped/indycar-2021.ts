import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * An IndyCar road-course weekend: practice, the knockout to the Fast Six, and
 * the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'road-course',
  name: 'Road course',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
    { id: 'q1', type: 'qualify', name: 'Round 1', minutes: 12, day: 1 },
    { id: 'q2', type: 'qualify', name: 'Round 2', minutes: 10, day: 1, inherit: { from: 'q1', top: 12 } },
    { id: 'q3', type: 'qualify', name: 'Fast Six', minutes: 6, day: 1, inherit: { from: 'q2', top: 6 } },
    { id: 'race', type: 'race', name: 'Race', laps: 55, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * IndyCar, 2021 - Alex Palou's first title.
 *
 * VRC's Formula North America 2021 is the car, its road kit for road courses
 * and its oval kit for the speedway; a round fields whichever kit its circuit
 * needs. Of its sixteen rounds, Road America and Laguna Seca are in Assetto
 * Corsa. Texas's opening 300 miles run at Daytona's tri-oval over the same
 * distance, because Texas is not in Assetto Corsa; the IndyCar field never
 * raced there. The short-oval kit has no short oval to race on. Barber, St.
 * Petersburg, Indianapolis, Detroit, Mid-Ohio, Nashville, Gateway, Portland
 * and Long Beach are not in Assetto Corsa.
 *
 * Qualifying is the road-course knockout, twenty-four cars cut to twelve and
 * then to the Fast Six; the oval runs a single session. Points are
 * 50-40-35-32-30-28-26 and down, a point for pole; the points for leading a
 * lap and leading the most cannot be stated yet. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2021_IndyCar_Series
 */
export const INDYCAR_2021: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'indycar-2021',
  name: 'IndyCar 2021',
  description: 'IndyCar 2021 on VRC\'s Formula North America 2021: Road America, Laguna Seca, and Texas\'s'
    + ' 300 miles run at Daytona.',
  teams: [
    team('lakeshore', 'Lakeshore Racing', 'United States', 'USA', TeamBudget.WORKS),
    team('crossroads', 'Crossroads Motorsports', 'United States', 'USA', TeamBudget.WORKS),
    team('bluegrass', 'Bluegrass Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('lone-star', 'Lone Star Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('great-plains', 'Great Plains Motorsports', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('cascade', 'Cascade Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('motor-city', 'Motor City Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('gulf-coast', 'Gulf Coast Motorsports', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('prairie', 'Prairie Fire Racing', 'Canada', 'CAN', TeamBudget.PRIVATEER),
    team('keystone', 'Keystone Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('sonoran', 'Sonoran Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('tidewater', 'Tidewater Motorsports', 'United States', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'indycar',
      name: 'IndyCar',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      seats: [
        seat('lak-1', 'lakeshore', 'Brody Kincannon', 'United States', 'USA'),
        seat('lak-2', 'lakeshore', 'Dalton Pruett', 'United States', 'USA'),
        seat('cro-1', 'crossroads', 'Jace Whitcomb', 'United States', 'USA'),
        seat('cro-b-1', 'crossroads', 'Rafael Quiroga', 'Mexico', 'MEX'),
        seat('blu-1', 'bluegrass', 'Colt Abernathy', 'United States', 'USA'),
        seat('blu-b-1', 'bluegrass', 'Sebastián Arboleda', 'Colombia', 'COL'),
        seat('lon-1', 'lone-star', 'Tanner Guidry', 'United States', 'USA'),
        seat('lon-2', 'lone-star', 'Hayes Kilgore', 'United States', 'USA'),
        seat('gre-1', 'great-plains', 'Wade Tollison', 'United States', 'USA'),
        seat('gre-b-1', 'great-plains', 'Emeric Vautrin', 'France', 'FRA'),
        seat('cas-1', 'cascade', 'Logan Birchfield', 'United States', 'USA'),
        seat('cas-b-1', 'cascade', 'Callum Rennick', 'Great Britain', 'GBR'),
        seat('mot-1', 'motor-city', 'Dominic Szabo', 'United States', 'USA'),
        seat('mot-b-1', 'motor-city', 'Anton Lindqvist', 'Sweden', 'SWE'),
        seat('gul-1', 'gulf-coast', 'Beau Thibodeaux', 'United States', 'USA'),
        seat('gul-b-1', 'gulf-coast', 'Kai Nakagawa', 'Japan', 'JPN'),
        seat('pra-1', 'prairie', 'Ryder Boisvenue', 'Canada', 'CAN'),
        seat('pra-2', 'prairie', 'Nolan Beaudry', 'Canada', 'CAN'),
        seat('key-1', 'keystone', 'Trent Hollabaugh', 'United States', 'USA'),
        seat('key-b-1', 'keystone', 'Aidan Keough', 'Ireland', 'IRL'),
        seat('son-1', 'sonoran', 'Mateo Valenzuela', 'Mexico', 'MEX'),
        seat('son-b-1', 'sonoran', 'Ezra Whitlock', 'United States', 'USA'),
        seat('tid-1', 'tidewater', 'Garrison Pettus', 'United States', 'USA'),
        seat('tid-b-1', 'tidewater', 'Oskar Brantberg', 'Sweden', 'SWE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2021_ROAD, minModels: 1 },
    },
  ],
  weekendFormats: [
    WEEKEND,
    {
      id: 'oval',
      name: 'Oval, 120 laps',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: 'Race', laps: 120, day: 2 },
      ],
    },
  ],
  defaultWeekendFormat: 'road-course',
  rounds: [
    {
      id: 'daytona',
      name: 'Daytona International Speedway',
      track: { id: 'rt_daytona', layout: 'tri-oval' },
      weekendFormat: 'oval',
      eligibility: [{ entry: 'indycar', eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2021_OVAL, minModels: 1 } }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: { id: 'lilski_road_america' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'laguna-seca',
      name: 'Laguna Seca',
      track: { id: 'ks_laguna_seca' },
      sessionLengths: [{ session: 'race', laps: 95 }],
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
  grid: { strength: 4, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [60000, 42000, 30000, 22800, 17400, 13200, 9600, 7200, 4800, 3000],
    standings: [480000, 300000, 192000, 126000, 78000],
  },
};
