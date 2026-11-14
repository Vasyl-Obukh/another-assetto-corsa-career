import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the early sixties: a day of practice, a day of timed
 * practice setting the grid on its fastest laps, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 395, day: 2 },
  ],
};

/**
 * Formula 1, 1962 - the season Jim Clark's Lotus 25 arrived.
 *
 * The real entry list on the base game's Lotus 25, the only car of the spec:
 * every seat drives one, the way a one-chassis grid of any era would. Six of
 * the nine rounds at their real distances: Zandvoort, Spa, the Nordschleife,
 * Monza's road course and Watkins Glen as raced, and Aintree's British Grand
 * Prix at Silverstone as it was in the sixties, since Aintree is not in Assetto
 * Corsa. Where the circuit is the one raced, the laps are the real ones; where
 * it is a later layout, the laps cover the same distance. Monaco, Rouen and
 * East London are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1. The season counted a driver's best five results,
 * which a points system cannot say yet. Zandvoort's eighteen boxes cap the
 * grid.
 *
 * Source: https://en.wikipedia.org/wiki/1962_Formula_One_World_Championship
 */
export const FORMULA_1_1962: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1962',
  name: 'Formula 1 1962',
  description: {
    en: 'The season the Lotus 25 arrived, with the real entry list in the base game\'s Lotus 25 '
      + 'and six of its grands prix at their real distances, the Nordschleife and Watkins Glen '
      + 'included. Aintree\'s British Grand Prix is raced at Silverstone as it was in the sixties.',
    uk: 'Сезон появи Lotus 25 зі справжнім списком учасників на Lotus 25 з базової гри та шістьма '
      + 'гран-прі на справжніх дистанціях, включно з Нордшляйфе та Воткінс-Гленом. Гран-прі '
      + 'Великої Британії з Ейнтрі проходить у Сільверстоуні, як і бувало в шістдесяті.',
  },
  teams: [
    team('lotus', 'Team Lotus', 'GBR', TeamBudget.WORKS),
    team('brm', 'Owen Racing Organisation', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('porsche', 'Porsche System Engineering', 'DEU', TeamBudget.WORKS),
    team('brabham', 'Brabham Racing Organisation', 'GBR', TeamBudget.INDEPENDENT),
    team('bowmaker', 'Bowmaker Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('udt', 'UDT Laystall Racing Team', 'GBR', TeamBudget.PRIVATEER),
    team('walker', 'Rob Walker Racing Team', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished, so the class's ramp puts the
      // champion at the front.
      seats: [
        seat('brm-hill', 'brm', 'Graham Hill', 'GBR'),
        seat('lotus-clark', 'lotus', 'Jim Clark', 'GBR'),
        seat('cooper-mclaren', 'cooper', 'Bruce McLaren', 'NZL'),
        seat('bowmaker-surtees', 'bowmaker', 'John Surtees', 'GBR'),
        seat('porsche-gurney', 'porsche', 'Dan Gurney', 'USA'),
        seat('ferrari-hill', 'ferrari', 'Phil Hill', 'USA'),
        seat('brabham-brabham', 'brabham', 'Jack Brabham', 'AUS'),
        seat('brm-ginther', 'brm', 'Richie Ginther', 'USA'),
        seat('porsche-bonnier', 'porsche', 'Jo Bonnier', 'SWE'),
        seat('cooper-maggs', 'cooper', 'Tony Maggs', 'ZAF'),
        seat('udt-ireland', 'udt', 'Innes Ireland', 'GBR'),
        seat('lotus-taylor', 'lotus', 'Trevor Taylor', 'GBR'),
        seat('ferrari-baghetti', 'ferrari', 'Giancarlo Baghetti', 'ITA'),
        seat('ferrari-rodriguez', 'ferrari', 'Ricardo Rodríguez', 'MEX'),
        seat('ferrari-bandini', 'ferrari', 'Lorenzo Bandini', 'ITA'),
        seat('bowmaker-salvadori', 'bowmaker', 'Roy Salvadori', 'GBR'),
        seat('udt-gregory', 'udt', 'Masten Gregory', 'USA'),
        seat('walker-trintignant', 'walker', 'Maurice Trintignant', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1962 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'ks_zandvoort' },
      sessionLengths: [{ session: 'grand-prix', laps: 80 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'grand-prix', laps: 64 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      sessionLengths: [{ session: 'grand-prix', laps: 77 }],
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
      sessionLengths: [{ session: 'grand-prix', laps: 86 }],
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'lilski_watkins_glen', layout: 'short_classic' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 4, aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 26000, 17000, 12000, 9000, 6000],
    standings: [300000, 180000, 120000, 80000, 50000],
  },
};
