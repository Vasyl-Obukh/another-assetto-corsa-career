import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2015: three practices, the three-part knockout, and
 * the race.
 */
const EVENT: EventFormat = {
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
 * Formula 1, 2015 - the hybrid era's second season, and Lewis Hamilton's third title.
 *
 * The real entry list on the 2015 spec - the Red Pack's Ferrari SF15-T and
 * VRC's Williams FW37, either of which fields the grid on its own - with every
 * seat in whichever of it is installed. 13 rounds at their real distances;
 * Barcelona runs the layout with its final chicane, and where a circuit has
 * changed since, the laps cover the real race's distance. Melbourne, Monaco,
 * Marina Bay, Suzuka, Sochi and Mexico City are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, 20 cars cut to 15 and
 * then to 10. Points are 25-18-15-12-10-8-6-4-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2015_Formula_One_World_Championship
 */
export const FORMULA_1_2015: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2015',
  name: 'Formula 1 2015',
  description: 'The hybrid era\'s second season, with the real entry list and thirteen of its grands prix '
    + 'at their real distances. It runs on the Red Pack\'s SF15-T or VRC\'s FW37, whichever you '
    + 'own.',
  teams: [
    team('mercedes', 'Mercedes AMG Petronas', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('williams', 'Williams Martini Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('red-bull', 'Infiniti Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('force-india', 'Sahara Force India', 'IND', TeamBudget.INDEPENDENT),
    team('lotus', 'Lotus F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('toro-rosso', 'Scuderia Toro Rosso', 'ITA', TeamBudget.INDEPENDENT),
    team('sauber', 'Sauber F1 Team', 'CHE', TeamBudget.INDEPENDENT),
    team('mclaren', 'McLaren Honda', 'GBR', TeamBudget.WORKS),
    team('manor', 'Manor Marussia F1 Team', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'GBR'),
        seat('mercedes-rosberg', 'mercedes', 'Nico Rosberg', 'DEU'),
        seat('ferrari-vettel', 'ferrari', 'Sebastian Vettel', 'DEU'),
        seat('ferrari-raikkonen', 'ferrari', 'Kimi Räikkönen', 'FIN'),
        seat('williams-bottas', 'williams', 'Valtteri Bottas', 'FIN'),
        seat('williams-massa', 'williams', 'Felipe Massa', 'BRA'),
        seat('red-bull-kvyat', 'red-bull', 'Daniil Kvyat', 'RUS'),
        seat('red-bull-ricciardo', 'red-bull', 'Daniel Ricciardo', 'AUS'),
        seat('force-india-perez', 'force-india', 'Sergio Pérez', 'MEX'),
        seat('force-india-hulkenberg', 'force-india', 'Nico Hülkenberg', 'DEU'),
        seat('lotus-grosjean', 'lotus', 'Romain Grosjean', 'FRA'),
        seat('toro-rosso-verstappen', 'toro-rosso', 'Max Verstappen', 'NLD'),
        seat('sauber-nasr', 'sauber', 'Felipe Nasr', 'BRA'),
        seat('lotus-maldonado', 'lotus', 'Pastor Maldonado', 'VEN'),
        seat('toro-rosso-sainz', 'toro-rosso', 'Carlos Sainz', 'ESP'),
        seat('mclaren-button', 'mclaren', 'Jenson Button', 'GBR'),
        seat('mclaren-alonso', 'mclaren', 'Fernando Alonso', 'ESP'),
        seat('sauber-ericsson', 'sauber', 'Marcus Ericsson', 'SWE'),
        seat('manor-stevens', 'manor', 'Will Stevens', 'GBR'),
        seat('manor-merhi', 'manor', 'Roberto Merhi', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2015, minModels: 1 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
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
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      sessionLengths: [{ session: 'grand-prix', laps: 69 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'grand-prix', laps: 43 }],
      climate: Climate.OCEANIC,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
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
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
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
