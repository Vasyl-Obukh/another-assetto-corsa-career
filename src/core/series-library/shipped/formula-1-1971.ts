import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the early seventies: a day of practice, a day of
 * timed practice setting the grid, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 318, day: 2 },
  ],
};

/**
 * Formula 1, 1971 - Jackie Stewart's second title, and the Lotus 72's era.
 *
 * The real entry list on the 1971 spec, which is the base game's Lotus 72D and
 * nothing else, so every seat drives one. Five of eleven rounds at their real
 * distances: Zandvoort, Silverstone as it still was, the Nordschleife, Monza's
 * road course the year before its chicanes - the slipstreaming race Peter
 * Gethin won by a hundredth - and Watkins Glen's long circuit. The rest of the
 * calendar is not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1; the season counted a driver's best five of the first
 * six rounds and best four of the last five, which a points system cannot say
 * yet. Zandvoort's eighteen boxes cap the grid.
 *
 * Source: https://en.wikipedia.org/wiki/1971_Formula_One_World_Championship
 */
export const FORMULA_1_1971: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1971',
  name: 'Formula 1 1971',
  description: {
    en: 'Jackie Stewart\'s second title season, with the real entry list in the base game\'s '
      + 'Lotus 72D and five of its grands prix at their real distances, Monza before its chicanes '
      + 'included.',
    uk: 'Сезон другого титулу Джекі Стюарта зі справжнім списком учасників на Lotus 72D з базової '
      + 'гри та п\'ятьма гран-прі на справжніх дистанціях, включно з Монцою ще без шикан.',
  },
  teams: [
    team('tyrrell', 'Elf Team Tyrrell', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('brm', 'Yardley Team BRM', 'GBR', TeamBudget.WORKS),
    team('lotus', 'Gold Leaf Team Lotus', 'GBR', TeamBudget.WORKS),
    team('march', 'STP March Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('mclaren', 'Bruce McLaren Motor Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('matra', 'Équipe Matra Sports', 'FRA', TeamBudget.WORKS),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.INDEPENDENT),
    team('surtees', 'Team Surtees', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('tyrrell-stewart', 'tyrrell', 'Jackie Stewart', 'GBR'),
        seat('march-peterson', 'march', 'Ronnie Peterson', 'SWE'),
        seat('tyrrell-cevert', 'tyrrell', 'François Cevert', 'FRA'),
        seat('ferrari-ickx', 'ferrari', 'Jacky Ickx', 'BEL'),
        seat('brm-siffert', 'brm', 'Jo Siffert', 'CHE'),
        seat('lotus-fittipaldi', 'lotus', 'Emerson Fittipaldi', 'BRA'),
        seat('ferrari-regazzoni', 'ferrari', 'Clay Regazzoni', 'CHE'),
        seat('matra-amon', 'matra', 'Chris Amon', 'NZL'),
        seat('mclaren-hulme', 'mclaren', 'Denny Hulme', 'NZL'),
        seat('brm-gethin', 'brm', 'Peter Gethin', 'GBR'),
        seat('brm-rodriguez', 'brm', 'Pedro Rodríguez', 'MEX'),
        seat('lotus-wisell', 'lotus', 'Reine Wisell', 'SWE'),
        seat('surtees-surtees', 'surtees', 'John Surtees', 'GBR'),
        seat('matra-beltoise', 'matra', 'Jean-Pierre Beltoise', 'FRA'),
        seat('brabham-schenken', 'brabham', 'Tim Schenken', 'AUS'),
        seat('brm-ganley', 'brm', 'Howden Ganley', 'NZL'),
        seat('brabham-hill', 'brabham', 'Graham Hill', 'GBR'),
        seat('surtees-stommelen', 'surtees', 'Rolf Stommelen', 'DEU'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1971 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'ks_zandvoort' },
      sessionLengths: [{ session: 'grand-prix', laps: 70 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      sessionLengths: [{ session: 'grand-prix', laps: 12 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'ks_monza66', layout: 'road' } },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'lilski_watkins_glen', layout: 'boot_classic' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 4 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12500,
  prizes: {
    positions: [50000, 32000, 21000, 15000, 11000, 8000],
    standings: [340000, 200000, 130000, 90000, 60000],
  },
};
