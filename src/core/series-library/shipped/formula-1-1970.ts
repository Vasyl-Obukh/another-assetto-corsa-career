import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the era: a day of practice, a day of timed
 * practice setting the grid, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 393, day: 2 },
  ],
};

/**
 * Formula 1, 1970 - Jochen Rindt's posthumous title, and the Lotus 72's first season.
 *
 * The real entry list on RSS's Formula 1970, its V8 and V8 S between them, cut
 * to eighteen by Zandvoort's pit boxes: the drivers who started most of the
 * season. Nine of thirteen rounds at their real distances. Monza's road
 * course, Charade, Mont-Tremblant and Watkins Glen's short circuit are the
 * period ones and run their real laps; Spa, Zandvoort, Brands Hatch and the
 * Osterreichring have changed since, so their laps cover the real distance.
 * Kyalami, Jarama, Monaco and Hockenheim are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1; the season counted a driver's best six of the first
 * seven rounds and best five of the last six, which a points system cannot say
 * yet.
 *
 * Source: https://en.wikipedia.org/wiki/1970_Formula_One_World_Championship
 */
export const FORMULA_1_1970: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1970',
  name: 'Formula 1 1970',
  description: {
    en: 'Jochen Rindt\'s posthumous title season, with the real entry list on RSS\'s Formula 1970 and'
      + ' nine of its grands prix at their real distances, Charade and Mont-Tremblant included.',
    uk: 'Сезон посмертного титулу Йохена Рінта зі справжнім списком учасників на Formula 1970 '
      + 'від RSS і дев\'ятьма гран-прі на справжніх дистанціях, включно з Шарадом і Мон-Трамбланом.',
  },
  teams: [
    team('lotus', 'Gold Leaf Team Lotus', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'Bruce McLaren Motor Racing', 'GBR', TeamBudget.WORKS),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Tyrrell Racing Organisation', 'GBR', TeamBudget.INDEPENDENT),
    team('brm', 'Yardley Team BRM', 'GBR', TeamBudget.WORKS),
    team('march', 'March Engineering', 'GBR', TeamBudget.WORKS),
    team('matra', 'Équipe Matra Elf', 'FRA', TeamBudget.WORKS),
    team('surtees', 'Team Surtees', 'GBR', TeamBudget.PRIVATEER),
    team('walker', 'Rob Walker Racing Team', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('lotus-rindt', 'lotus', 'Jochen Rindt', 'AUT'),
        seat('ferrari-ickx', 'ferrari', 'Jacky Ickx', 'BEL'),
        seat('ferrari-regazzoni', 'ferrari', 'Clay Regazzoni', 'CHE'),
        seat('mclaren-hulme', 'mclaren', 'Denny Hulme', 'NZL'),
        seat('brabham-brabham', 'brabham', 'Jack Brabham', 'AUS'),
        seat('tyrrell-stewart', 'tyrrell', 'Jackie Stewart', 'GBR'),
        seat('brm-rodriguez', 'brm', 'Pedro Rodríguez', 'MEX'),
        seat('march-amon', 'march', 'Chris Amon', 'NZL'),
        seat('matra-beltoise', 'matra', 'Jean-Pierre Beltoise', 'FRA'),
        seat('lotus-fittipaldi', 'lotus', 'Emerson Fittipaldi', 'BRA'),
        seat('matra-pescarolo', 'matra', 'Henri Pescarolo', 'FRA'),
        seat('surtees-surtees', 'surtees', 'John Surtees', 'GBR'),
        seat('brm-oliver', 'brm', 'Jackie Oliver', 'GBR'),
        seat('walker-hill', 'walker', 'Graham Hill', 'GBR'),
        seat('brabham-stommelen', 'brabham', 'Rolf Stommelen', 'DEU'),
        seat('tyrrell-cevert', 'tyrrell', 'François Cevert', 'FRA'),
        seat('march-siffert', 'march', 'Jo Siffert', 'CHE'),
        seat('lotus-miles', 'lotus', 'John Miles', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1970 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'ks_zandvoort' },
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'france',
      name: 'French Grand Prix',
      track: { id: 'circuit_charade2023', layout: 'charade2023_8km' },
      sessionLengths: [{ session: 'grand-prix', laps: 38 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 87 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 82 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'ks_monza66', layout: 'road' } },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'rt_mont_tremblant', layout: 'no_chicane' },
      sessionLengths: [{ session: 'grand-prix', laps: 90 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'lilski_watkins_glen', layout: 'short_classic' },
      sessionLengths: [{ session: 'grand-prix', laps: 108 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico',
      name: 'Mexican Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'grand-prix', laps: 76 }],
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
