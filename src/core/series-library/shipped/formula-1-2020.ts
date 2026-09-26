import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2020: three practices, the three-part
 * knockout, and the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 60, day: 1 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18, day: 1 },
    {
      id: 'q2',
      type: 'qualify',
      name: 'Q2',
      minutes: 15,
      day: 1,
      inherit: { from: 'q1', top: 15 },
    },
    {
      id: 'q3',
      type: 'qualify',
      name: 'Q3',
      minutes: 12,
      day: 1,
      inherit: { from: 'q2', top: 10 },
    },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Formula 1, 2020 - the pandemic season, and Lewis Hamilton's seventh title.
 *
 * The real entry list on RSS's Formula Hybrid 2020, every seat in it. Sixteen
 * of seventeen rounds at their real distances - the reshuffled calendar ran
 * almost wholly on circuits Assetto Corsa has: two races at the Red Bull Ring
 * and two at Silverstone, Mugello, the Nurburgring, Portimao, Imola, Istanbul
 * and the Bahrain outer loop. Sochi is not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1 and one for the fastest lap,
 * which the season paid only to a driver in the top ten - a condition a points
 * system cannot state yet.
 *
 * Source: https://en.wikipedia.org/wiki/2020_Formula_One_World_Championship
 */
export const FORMULA_1_2020: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2020',
  name: 'Formula 1 2020',
  description: 'The pandemic season and Lewis Hamilton\'s seventh title, with the real entry list on RSS\'s '
    + 'Formula Hybrid 2020 and sixteen of its seventeen grands prix at their real distances.',
  teams: [
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'DEU', TeamBudget.WORKS),
    team('red-bull', 'Aston Martin Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('mclaren', 'McLaren F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('racing-point', 'BWT Racing Point F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('renault', 'Renault DP World F1 Team', 'FRA', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('alphatauri', 'Scuderia AlphaTauri Honda', 'ITA', TeamBudget.INDEPENDENT),
    team('alfa-romeo', 'Alfa Romeo Racing ORLEN', 'CHE', TeamBudget.INDEPENDENT),
    team('haas', 'Haas F1 Team', 'USA', TeamBudget.INDEPENDENT),
    team('williams', 'Williams Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'GBR'),
        seat('mercedes-bottas', 'mercedes', 'Valtteri Bottas', 'FIN'),
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'NLD'),
        seat('racing-point-perez', 'racing-point', 'Sergio Pérez', 'MEX'),
        seat('renault-ricciardo', 'renault', 'Daniel Ricciardo', 'AUS'),
        seat('mclaren-sainz', 'mclaren', 'Carlos Sainz', 'ESP'),
        seat('red-bull-albon', 'red-bull', 'Alexander Albon', 'THA'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'MCO'),
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'GBR'),
        seat('alphatauri-gasly', 'alphatauri', 'Pierre Gasly', 'FRA'),
        seat('racing-point-stroll', 'racing-point', 'Lance Stroll', 'CAN'),
        seat('renault-ocon', 'renault', 'Esteban Ocon', 'FRA'),
        seat('ferrari-vettel', 'ferrari', 'Sebastian Vettel', 'DEU'),
        seat('alphatauri-kvyat', 'alphatauri', 'Daniil Kvyat', 'RUS'),
        seat('alfa-romeo-raikkonen', 'alfa-romeo', 'Kimi Räikkönen', 'FIN'),
        seat('alfa-romeo-giovinazzi', 'alfa-romeo', 'Antonio Giovinazzi', 'ITA'),
        seat('williams-russell', 'williams', 'George Russell', 'GBR'),
        seat('haas-grosjean', 'haas', 'Romain Grosjean', 'FRA'),
        seat('haas-magnussen', 'haas', 'Kevin Magnussen', 'DNK'),
        seat('williams-latifi', 'williams', 'Nicholas Latifi', 'CAN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2020, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'styria',
      name: 'Styrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'anniversary',
      name: '70th Anniversary Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    { id: 'tuscany', name: 'Tuscan Grand Prix', track: { id: 'mugello' } },
    {
      id: 'eifel',
      name: 'Eifel Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'portugal',
      name: 'Portuguese Grand Prix',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'emilia-romagna', name: 'Emilia Romagna Grand Prix', track: { id: 'imola' } },
    {
      id: 'turkey',
      name: 'Turkish Grand Prix',
      track: { id: 'rj_istanbul_park', layout: 'layout_f1_2020' },
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'sakhir',
      name: 'Sakhir Grand Prix',
      track: { id: 'fn_bahrain', layout: 'outer' },
      climate: Climate.ARID,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 1 },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
