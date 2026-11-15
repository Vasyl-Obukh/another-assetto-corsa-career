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
    { id: 'race', type: 'race', name: 'Race', laps: 55, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * IndyCar, 2020 - the first season of the aeroscreen.
 *
 * RSS's Formula Americas 2020 is the road-course car and its oval version the
 * speedway kit, and a round fields whichever its circuit needs. The season as
 * run is raced at Indianapolis - the Grand Prix, the 500 at double points and
 * the Harvest Grand Prix's two races - and at Road America and Mid-Ohio, two
 * races each; the Circuit of the Americas and Laguna Seca were on the
 * calendar as first published and cancelled by the pandemic, and race here
 * at the lengths they ran in 2019. Texas's oval opener runs at Daytona's tri-
 * oval over the same 300 miles, because Texas has no recommended track; the
 * IndyCar field never raced there. St. Petersburg, Iowa and Gateway have none
 * either.
 *
 * Qualifying is the road-course knockout, twenty-four cars cut to twelve and
 * then to the Fast Six; the ovals run a single session. Points are
 * 50-40-35-32-30-28-26 and down, a point for pole; the points for leading a
 * lap and leading the most cannot be stated yet. The Indianapolis 500 pays
 * double. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2020_IndyCar_Series
 */
export const INDYCAR_2020: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'indycar-2020',
  name: 'IndyCar 2020',
  description: {
    en: 'IndyCar\'s first aeroscreen season on RSS\'s Formula Americas 2020: Road America\'s double '
      + 'header, the two road courses the pandemic cancelled, and an oval opener at Daytona.',
    uk: 'Перший сезон IndyCar з аероскріном на Formula Americas 2020 від RSS: здвоєний етап на '
      + 'Роуд-Америці, дві дорожні траси, скасовані через пандемію, і старт сезону на овалі в Дайтоні.',
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
      eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2020_ROAD },
    },
  ],
  eventFormats: [
    EVENT,
    {
      id: 'oval',
      name: 'Oval, 120 laps',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: 'Race', laps: 120, day: 2 },
      ],
    },
    {
      id: 'indianapolis-500',
      name: 'Indianapolis 500, double points',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: 'Race', laps: 200, day: 2, pointsSystem: 'double' },
      ],
    },
  ],
  defaultEventFormat: 'road-course',
  rounds: [
    {
      id: 'daytona',
      name: 'Daytona International Speedway',
      track: recommendedTrack('daytona/oval'),
      eventFormat: 'oval',
      eligibility: [{ entry: 'indycar', eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2020_OVAL } }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'indianapolis',
      name: 'Indianapolis',
      track: recommendedTrack('indianapolis/road'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america-1',
      name: 'Road America, race 1',
      track: recommendedTrack('road-america/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america-2',
      name: 'Road America, race 2',
      track: recommendedTrack('road-america/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'indianapolis-500',
      name: 'Indianapolis 500',
      track: recommendedTrack('indianapolis/oval'),
      eventFormat: 'indianapolis-500',
      eligibility: [{ entry: 'indycar', eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2020_OVAL } }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mid-ohio-1',
      name: 'Mid-Ohio, race 1',
      track: recommendedTrack('mid-ohio/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mid-ohio-2',
      name: 'Mid-Ohio, race 2',
      track: recommendedTrack('mid-ohio/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'indianapolis-1',
      name: 'Harvest Grand Prix, race 1',
      track: recommendedTrack('indianapolis/road'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'indianapolis-2',
      name: 'Harvest Grand Prix, race 2',
      track: recommendedTrack('indianapolis/road'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'circuit-of-the-americas',
      name: 'Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      sessionLengths: [{ session: 'race', laps: 60 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'laguna-seca',
      name: 'Laguna Seca',
      track: recommendedTrack('laguna-seca/full'),
      sessionLengths: [{ session: 'race', laps: 90 }],
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [50, 40, 35, 32, 30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5],
      qualifying: [1],
    },
    {
      id: 'double',
      name: 'Double points',
      positions: [100, 80, 70, 64, 60, 56, 52, 48, 44, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10],
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
