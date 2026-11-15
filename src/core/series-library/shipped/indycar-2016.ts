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
 * IndyCar, 2016 - the second season of the makers' own aero kits, on URD's
 * Formula Challenge.
 *
 * URD's Formula Challenge Detroit and Suzuka are the Dallara DW12 in
 * Chevrolet's and Honda's kits, the road kit for road and street courses and
 * the speedway kit for the Indianapolis 500; a round fields whichever kit its
 * circuit needs. Seven of sixteen rounds: Long Beach, the Grand Prix of
 * Indianapolis, the Indianapolis 500 and the Sonoma finale at double points,
 * Road America, Mid-Ohio and Watkins Glen. St. Petersburg, Phoenix, Barber,
 * Detroit twice, Texas, Iowa, Toronto and Pocono have no recommended track.
 * The race lengths are the real races' laps.
 *
 * Qualifying is the road-course knockout, cut to twelve and then to the Fast
 * Six; the 500 runs a single session. Points are 50-40-35-32-30-28-26 and
 * down, a point for pole, as understood rather than checked; the points for
 * leading a lap and leading the most cannot be stated yet. The field is
 * invented, IndyCar 2018's.
 *
 * Source: https://en.wikipedia.org/wiki/2016_IndyCar_Series
 */
export const INDYCAR_2016: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'indycar-2016',
  name: 'IndyCar 2016',
  description: {
    en: 'IndyCar\'s 2016 season on URD\'s Formula Challenge, Chevrolet\'s and Honda\'s aero kits: '
      + 'Long Beach, the Indianapolis 500 and the double-points Sonoma finale among seven rounds.',
    uk: 'Сезон IndyCar 2016 року на Formula Challenge від URD з аеропакетами Chevrolet і Honda: '
      + 'Лонг-Біч, Індіанаполіс 500 і фінал у Сономі з подвійними очками серед семи етапів.',
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
      eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2016_ROAD },
    },
  ],
  eventFormats: [
    EVENT,
    {
      id: 'indianapolis-500',
      name: 'Indianapolis 500, double points',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: 'Race', laps: 200, day: 2, pointsSystem: 'double' },
      ],
    },
    {
      id: 'sonoma',
      name: 'Road course, 85 laps, double points',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'q1', type: 'qualify', name: 'Round 1', minutes: 12, day: 1 },
        { id: 'q2', type: 'qualify', name: 'Round 2', minutes: 10, day: 1, inherit: { from: 'q1', top: 12 } },
        { id: 'q3', type: 'qualify', name: 'Fast Six', minutes: 6, day: 1, inherit: { from: 'q2', top: 6 } },
        { type: 'race', name: 'Race', laps: 85, day: 2, inherit: { from: 'q3' }, pointsSystem: 'double' },
      ],
    },
  ],
  defaultEventFormat: 'road-course',
  rounds: [
    {
      id: 'long-beach',
      name: 'Long Beach',
      track: recommendedTrack('long-beach/street'),
      sessionLengths: [{ session: 'race', laps: 80 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'indianapolis',
      name: 'Grand Prix of Indianapolis',
      track: recommendedTrack('indianapolis/road'),
      sessionLengths: [{ session: 'race', laps: 82 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'indianapolis-500',
      name: 'Indianapolis 500',
      track: recommendedTrack('indianapolis/oval'),
      eventFormat: 'indianapolis-500',
      eligibility: [{ entry: 'indycar', eligibility: { kind: 'spec', spec: CarSpec.INDYCAR_2016_OVAL } }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: recommendedTrack('road-america/full'),
      sessionLengths: [{ session: 'race', laps: 50 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mid-ohio',
      name: 'Mid-Ohio',
      track: recommendedTrack('mid-ohio/full'),
      sessionLengths: [{ session: 'race', laps: 90 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen',
      track: recommendedTrack('watkins-glen/boot'),
      sessionLengths: [{ session: 'race', laps: 60 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sonoma',
      name: 'Sonoma',
      track: recommendedTrack('sonoma/indycar'),
      eventFormat: 'sonoma',
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
