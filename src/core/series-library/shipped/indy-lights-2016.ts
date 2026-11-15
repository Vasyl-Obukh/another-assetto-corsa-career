import { seat, team } from './utils.ts';
import {
  Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Indy Lights, 2016 - the IL-15 on URD's Formula Lights.
 *
 * URD's Formula Lights is the Dallara IL-15 every car of the series raced,
 * named directly as a one-make series' car is: the road version for road
 * courses, the oval version for the Freedom 100 at Indianapolis. Six of
 * eleven events, the doubleheaders racing twice - the Grand Prix of
 * Indianapolis, the Freedom 100, Road America, Mid-Ohio, Watkins Glen and the
 * Laguna Seca finale. St. Petersburg, Phoenix, Barber, Iowa and Toronto have
 * no recommended track. The race lengths are the real races' 35 to 50 minutes
 * turned into laps, not checked against the results.
 *
 * Each race of a doubleheader starts from a qualifying of its own. Points are
 * 30-25-22-19-17-15-14-13-12-11-10-9-8-7-6 with a point for pole, as
 * understood rather than checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2016_Indy_Lights
 */
export const INDY_LIGHTS_2016: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'indy-lights-2016',
  name: 'Indy Lights 2016',
  description: {
    en: 'The last rung below IndyCar in 2016, on URD\'s Formula Lights: doubleheaders on road courses '
      + 'and the Freedom 100 on the Indianapolis oval.',
    uk: 'Остання сходинка перед IndyCar у 2016 році на Formula Lights від URD: подвійні етапи на '
      + 'дорожніх трасах і Freedom 100 на овалі Індіанаполіса.',
  },
  teams: [
    team('hoosier', 'Hoosier Lights Racing', 'USA', TeamBudget.WORKS),
    team('red-river', 'Red River Racing', 'USA', TeamBudget.WORKS),
    team('maple-leaf', 'Maple Leaf Motorsport', 'CAN', TeamBudget.INDEPENDENT),
    team('pampas', 'Pampas Racing', 'ARG', TeamBudget.INDEPENDENT),
    team('thames', 'Thames Valley Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('everglades', 'Everglades Motorsport', 'USA', TeamBudget.PRIVATEER),
    team('ozark', 'Ozark Racing', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'indy-lights',
      name: 'Indy Lights',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 3 },
      seats: [
        seat('hoo-1', 'hoosier', 'Cody Lindquist', 'USA'),
        seat('hoo-2', 'hoosier', 'Mateus Bastos', 'BRA'),
        seat('red-1', 'red-river', 'Tyler Ashcroft', 'USA'),
        seat('red-2', 'red-river', 'Santiago Olmedo', 'MEX'),
        seat('map-1', 'maple-leaf', 'Jordan Thibault', 'CAN'),
        seat('map-2', 'maple-leaf', 'Ethan Macklin', 'CAN'),
        seat('pam-1', 'pampas', 'Facundo Iriarte', 'ARG'),
        seat('pam-2', 'pampas', 'Lucas Aranguren', 'ARG'),
        seat('tha-1', 'thames', 'George Ellery', 'GBR'),
        seat('tha-2', 'thames', 'Freddie Haldane', 'GBR'),
        seat('eve-1', 'everglades', 'Austin Calloway', 'USA'),
        seat('eve-2', 'everglades', 'Nico Ferreira', 'COL'),
        seat('oza-1', 'ozark', 'Blake Renfro', 'USA'),
        seat('oza-2', 'ozark', 'Jonah Pettigrew', 'NZL'),
      ],
      eligibility: { kind: 'cars', cars: ['urd_formulalights_road'] },
    },
  ],
  eventFormats: [
    {
      id: 'doubleheader',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
        {
          id: 'race-1', type: 'race', name: 'Race 1', laps: 30, day: 1, inherit: { from: 'qualifying-1' },
        },
        {
          id: 'race-2', type: 'race', name: 'Race 2', laps: 30, day: 2, inherit: { from: 'qualifying-2' },
        },
      ],
    },
    {
      id: 'freedom-100',
      name: 'Freedom 100',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 1 },
        { type: 'race', name: 'Race', laps: 40, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'doubleheader',
  rounds: [
    {
      id: 'indianapolis',
      name: 'Grand Prix of Indianapolis',
      track: recommendedTrack('indianapolis/road'),
      sessionLengths: [{ session: 'race-1', laps: 35 }, { session: 'race-2', laps: 35 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'freedom-100',
      name: 'Freedom 100',
      track: recommendedTrack('indianapolis/oval'),
      eventFormat: 'freedom-100',
      eligibility: [{ entry: 'indy-lights', eligibility: { kind: 'cars', cars: ['urd_formulalights_oval'] } }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: recommendedTrack('road-america/full'),
      sessionLengths: [{ session: 'race-1', laps: 20 }, { session: 'race-2', laps: 20 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mid-ohio',
      name: 'Mid-Ohio',
      track: recommendedTrack('mid-ohio/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen',
      track: recommendedTrack('watkins-glen/boot'),
      sessionLengths: [{ session: 'race-1', laps: 25 }, { session: 'race-2', laps: 25 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'laguna-seca',
      name: 'Laguna Seca',
      track: recommendedTrack('laguna-seca/full'),
      sessionLengths: [{ session: 'race-1', laps: 40 }, { session: 'race-2', laps: 40 }],
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [30, 25, 22, 19, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6],
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
  entryFee: 7500,
  prizes: {
    positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
    standings: [240000, 150000, 96000, 63000, 39000],
  },
};
