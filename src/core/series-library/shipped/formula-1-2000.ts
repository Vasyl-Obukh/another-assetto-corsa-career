import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2000: practice both days and Saturday's hour of
 * qualifying, twelve laps a driver.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'practice', name: 'Saturday practice', minutes: 90, day: 1 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 2000 - Michael Schumacher's first title with Ferrari.
 *
 * The real entry list on RSS's Formula 2000, every seat in it. Twelve of
 * seventeen rounds at their real distances: where a circuit has changed since
 * - Silverstone, Barcelona, the Nurburgring, Montreal, Magny-Cours and the
 * Hungaroring - the laps cover the real race's distance. Melbourne, Monaco,
 * Hockenheim, Indianapolis and Suzuka are not in Assetto Corsa.
 *
 * Points are 10-6-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2000_Formula_One_World_Championship
 */
export const FORMULA_1_2000: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2000',
  name: 'Formula 1 2000',
  description: 'Michael Schumacher\'s first title with Ferrari, with the real entry list on RSS\'s Formula '
    + '2000 and twelve of its grands prix at their real distances.',
  teams: [
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'GBR', TeamBudget.WORKS),
    team('benetton', 'Mild Seven Benetton Playlife', 'GBR', TeamBudget.INDEPENDENT),
    team('bar', 'Lucky Strike BAR Honda', 'GBR', TeamBudget.WORKS),
    team('jordan', 'Benson & Hedges Jordan', 'IRL', TeamBudget.INDEPENDENT),
    team('arrows', 'Arrows F1 Team', 'GBR', TeamBudget.PRIVATEER),
    team('sauber', 'Red Bull Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('jaguar', 'Jaguar Racing', 'GBR', TeamBudget.WORKS),
    team('minardi', 'Telefonica Minardi Fondmetal', 'ITA', TeamBudget.PRIVATEER),
    team('prost', 'Gauloises Prost Peugeot', 'FRA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('mclaren-hakkinen', 'mclaren', 'Mika Häkkinen', 'FIN'),
        seat('mclaren-coulthard', 'mclaren', 'David Coulthard', 'GBR'),
        seat('ferrari-barrichello', 'ferrari', 'Rubens Barrichello', 'BRA'),
        seat('williams-schumacher', 'williams', 'Ralf Schumacher', 'DEU'),
        seat('benetton-fisichella', 'benetton', 'Giancarlo Fisichella', 'ITA'),
        seat('bar-villeneuve', 'bar', 'Jacques Villeneuve', 'CAN'),
        seat('williams-button', 'williams', 'Jenson Button', 'GBR'),
        seat('jordan-frentzen', 'jordan', 'Heinz-Harald Frentzen', 'DEU'),
        seat('jordan-trulli', 'jordan', 'Jarno Trulli', 'ITA'),
        seat('sauber-salo', 'sauber', 'Mika Salo', 'FIN'),
        seat('arrows-verstappen', 'arrows', 'Jos Verstappen', 'NLD'),
        seat('prost-heidfeld', 'prost', 'Nick Heidfeld', 'DEU'),
        seat('bar-zonta', 'bar', 'Ricardo Zonta', 'BRA'),
        seat('jaguar-irvine', 'jaguar', 'Eddie Irvine', 'GBR'),
        seat('arrows-rosa', 'arrows', 'Pedro de la Rosa', 'ESP'),
        seat('benetton-wurz', 'benetton', 'Alexander Wurz', 'AUT'),
        seat('sauber-diniz', 'sauber', 'Pedro Diniz', 'BRA'),
        seat('jaguar-herbert', 'jaguar', 'Johnny Herbert', 'GBR'),
        seat('prost-alesi', 'prost', 'Jean Alesi', 'FRA'),
        seat('minardi-gene', 'minardi', 'Marc Gené', 'ESP'),
        seat('minardi-mazzacane', 'minardi', 'Gastón Mazzacane', 'ARG'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2000 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'san-marino',
      name: 'San Marino Grand Prix',
      track: { id: 'imola' },
      sessionLengths: [{ session: 'grand-prix', laps: 62 }],
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 53 }],
      climate: Climate.OCEANIC,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'europe',
      name: 'European Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    { id: 'france', name: 'French Grand Prix', track: { id: 'magnycours22' }, climate: Climate.TEMPERATE },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    { id: 'malaysia', name: 'Malaysian Grand Prix', track: { id: 'acu_sepang' }, climate: Climate.TEMPERATE },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
