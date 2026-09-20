import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2013: three practices, the three-part knockout, and
 * the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 60, day: 1 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 20, day: 1 },
    {
      id: 'q2',
      type: 'qualify',
      name: 'Q2',
      minutes: 15,
      day: 1,
      inherit: { from: 'q1', top: 16 },
    },
    {
      id: 'q3',
      type: 'qualify',
      name: 'Q3',
      minutes: 10,
      day: 1,
      inherit: { from: 'q2', top: 10 },
    },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Formula 1, 2013 - the last season of the V8s, and Sebastian Vettel's fourth title.
 *
 * The real entry list on the 2013 spec - the Red Pack's Ferrari F138 and
 * RSS's Formula 2013, either of which fields the grid on its own - with every
 * seat in whichever of it is installed. 13 rounds at their real distances;
 * Barcelona runs the layout with its final chicane, and where a circuit has
 * changed since, the laps cover the real race's distance. Melbourne, Monaco,
 * Marina Bay, Yeongam, Suzuka and the Buddh circuit are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, 22 cars cut to 16 and
 * then to 10. Points are 25-18-15-12-10-8-6-4-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2013_Formula_One_World_Championship
 */
export const FORMULA_1_2013: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2013',
  name: 'Formula 1 2013',
  description: 'The last season of the V8s, with the real entry list and thirteen of its grands prix at '
    + 'their real distances. It runs on the Red Pack\'s F138 or RSS\'s Formula 2013, whichever '
    + 'you own.',
  teams: [
    team('red-bull', 'Infiniti Red Bull Racing', 'Austria', 'AUT', TeamBudget.WORKS),
    team('mercedes', 'Mercedes AMG Petronas', 'Germany', 'GER', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('lotus', 'Lotus F1 Team', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('mclaren', 'Vodafone McLaren Mercedes', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('force-india', 'Sahara Force India', 'India', 'IND', TeamBudget.INDEPENDENT),
    team('sauber', 'Sauber F1 Team', 'Switzerland', 'SUI', TeamBudget.INDEPENDENT),
    team('toro-rosso', 'Scuderia Toro Rosso', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('williams', 'Williams F1 Team', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('marussia', 'Marussia F1 Team', 'Russia', 'RUS', TeamBudget.PRIVATEER),
    team('caterham', 'Caterham F1 Team', 'Malaysia', 'MAS', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('red-bull-vettel', 'red-bull', 'Sebastian Vettel', 'Germany', 'GER'),
        seat('ferrari-alonso', 'ferrari', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('red-bull-webber', 'red-bull', 'Mark Webber', 'Australia', 'AUS'),
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'Great Britain', 'GBR'),
        seat('lotus-raikkonen', 'lotus', 'Kimi Räikkönen', 'Finland', 'FIN'),
        seat('mercedes-rosberg', 'mercedes', 'Nico Rosberg', 'Germany', 'GER'),
        seat('lotus-grosjean', 'lotus', 'Romain Grosjean', 'France', 'FRA'),
        seat('ferrari-massa', 'ferrari', 'Felipe Massa', 'Brazil', 'BRA'),
        seat('mclaren-button', 'mclaren', 'Jenson Button', 'Great Britain', 'GBR'),
        seat('sauber-hulkenberg', 'sauber', 'Nico Hülkenberg', 'Germany', 'GER'),
        seat('mclaren-perez', 'mclaren', 'Sergio Pérez', 'Mexico', 'MEX'),
        seat('force-india-resta', 'force-india', 'Paul di Resta', 'Great Britain', 'GBR'),
        seat('force-india-sutil', 'force-india', 'Adrian Sutil', 'Germany', 'GER'),
        seat('toro-rosso-ricciardo', 'toro-rosso', 'Daniel Ricciardo', 'Australia', 'AUS'),
        seat('toro-rosso-vergne', 'toro-rosso', 'Jean-Éric Vergne', 'France', 'FRA'),
        seat('sauber-gutierrez', 'sauber', 'Esteban Gutiérrez', 'Mexico', 'MEX'),
        seat('williams-bottas', 'williams', 'Valtteri Bottas', 'Finland', 'FIN'),
        seat('williams-maldonado', 'williams', 'Pastor Maldonado', 'Venezuela', 'VEN'),
        seat('marussia-bianchi', 'marussia', 'Jules Bianchi', 'France', 'FRA'),
        seat('caterham-pic', 'caterham', 'Charles Pic', 'France', 'FRA'),
        seat('caterham-garde', 'caterham', 'Giedo van der Garde', 'Netherlands', 'NED'),
        seat('marussia-chilton', 'marussia', 'Max Chilton', 'Great Britain', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2013, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    { id: 'malaysia', name: 'Malaysian Grand Prix', track: { id: 'acu_sepang' }, climate: Climate.TEMPERATE },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
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
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'acu_unitedstates' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 97, aiLevelMin: 89, aiAggression: 40 },
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
