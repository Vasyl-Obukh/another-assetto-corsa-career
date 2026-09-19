import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of the late sixties: a day of practice, a day of timed
 * practice setting the grid, and the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 387, day: 2 },
  ],
};

/**
 * Formula 1, 1967 - the first three-litre seasons, and the Lotus 49's debut.
 *
 * The real entry list, on the 1967 spec: the base game's Lotus 49, with the
 * Ferrari 312/67 of the Ferrari 70th pack joining the field for anyone who owns
 * it. Seven of eleven rounds at their real distances - Zandvoort, where the 49
 * won first time out, Spa, Le Mans' Bugatti circuit, Silverstone as it was, the
 * Nordschleife, Monza's road course and Watkins Glen. Where the circuit is the
 * one raced the laps are the real ones; elsewhere they cover the same distance.
 * Kyalami, Monaco, Mosport and Mexico City are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1; the season counted a driver's best five of the first
 * six rounds and best four of the last five, which a points system cannot say
 * yet. Lorenzo Bandini, killed at Monaco, is not on the list.
 *
 * Source: https://en.wikipedia.org/wiki/1967_Formula_One_World_Championship
 */
export const FORMULA_1_1967: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1967',
  name: 'Formula 1 1967',
  description: 'The season of the Lotus 49\'s debut, with the real entry list and seven of its grands '
    + 'prix at their real distances. The Ferrari 312/67 joins the grid if you own the Ferrari 70th '
    + 'pack.',
  teams: [
    team('brabham', 'Brabham Racing Organisation', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('lotus', 'Team Lotus', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('brm', 'Owen Racing Organisation', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('honda', 'Honda Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('eagle', 'Anglo American Racers', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('mclaren', 'Bruce McLaren Motor Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('walker', 'Rob Walker Racing Team', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('parnell', 'Reg Parnell Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('bonnier', 'Joakim Bonnier Racing Team', 'Sweden', 'SWE', TeamBudget.PRIVATEER),
    team('ligier', 'Guy Ligier', 'France', 'FRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('brabham-hulme', 'brabham', 'Denny Hulme', 'New Zealand', 'NZL'),
        seat('brabham-brabham', 'brabham', 'Jack Brabham', 'Australia', 'AUS'),
        seat('lotus-clark', 'lotus', 'Jim Clark', 'Great Britain', 'GBR'),
        seat('honda-surtees', 'honda', 'John Surtees', 'Great Britain', 'GBR'),
        seat('ferrari-amon', 'ferrari', 'Chris Amon', 'New Zealand', 'NZL'),
        seat('cooper-rodriguez', 'cooper', 'Pedro Rodríguez', 'Mexico', 'MEX'),
        seat('lotus-hill', 'lotus', 'Graham Hill', 'Great Britain', 'GBR'),
        seat('eagle-gurney', 'eagle', 'Dan Gurney', 'United States', 'USA'),
        seat('brm-stewart', 'brm', 'Jackie Stewart', 'Great Britain', 'GBR'),
        seat('brm-spence', 'brm', 'Mike Spence', 'Great Britain', 'GBR'),
        seat('mclaren-mclaren', 'mclaren', 'Bruce McLaren', 'New Zealand', 'NZL'),
        seat('cooper-rindt', 'cooper', 'Jochen Rindt', 'Austria', 'AUT'),
        seat('walker-siffert', 'walker', 'Jo Siffert', 'Switzerland', 'SUI'),
        seat('ferrari-scarfiotti', 'ferrari', 'Ludovico Scarfiotti', 'Italy', 'ITA'),
        seat('ferrari-parkes', 'ferrari', 'Mike Parkes', 'Great Britain', 'GBR'),
        seat('bonnier-bonnier', 'bonnier', 'Jo Bonnier', 'Sweden', 'SWE'),
        seat('parnell-irwin', 'parnell', 'Chris Irwin', 'Great Britain', 'GBR'),
        seat('ligier-ligier', 'ligier', 'Guy Ligier', 'France', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1967, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'ks_zandvoort' },
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'france',
      name: 'French Grand Prix',
      track: { id: 'bugatti_GPE2023', layout: 'lfm_standing' },
      sessionLengths: [{ session: 'grand-prix', laps: 80 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      sessionLengths: [{ session: 'grand-prix', laps: 80 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      sessionLengths: [{ session: 'grand-prix', laps: 15 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'italy',
      name: 'Italian Grand Prix',
      track: { id: 'ks_monza66', layout: 'road' },
      sessionLengths: [{ session: 'grand-prix', laps: 68 }],
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'lilski_watkins_glen', layout: 'short_classic' },
      sessionLengths: [{ session: 'grand-prix', laps: 108 }],
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 96, aiLevelMin: 88, aiAggression: 25 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [45000, 29000, 19000, 13500, 10000, 7000],
    standings: [320000, 190000, 125000, 85000, 55000],
  },
};
