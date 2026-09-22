import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2017: three practices, the three-part knockout, and
 * the race.
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
 * Formula 1, 2017 - the wider, faster cars, and Lewis Hamilton's fourth title.
 *
 * The real entry list on the 2017 spec - the Ferrari 70th pack's SF70H and
 * RSS's Formula Hybrid 2017, either of which fields the grid on its own - with
 * every seat in whichever of it is installed. 13 rounds at their real
 * distances; Barcelona runs the layout with its final chicane, and where a
 * circuit has changed since, the laps cover the real race's distance.
 * Melbourne, Sochi, Baku, Monaco, Marina Bay, Suzuka and Mexico City are not
 * in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, 20 cars cut to 15 and
 * then to 10. Points are 25-18-15-12-10-8-6-4-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2017_Formula_One_World_Championship
 */
export const FORMULA_1_2017: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2017',
  name: 'Formula 1 2017',
  description: 'The first season of the wider, faster cars, with the real entry list and thirteen of its '
    + 'grands prix at their real distances. It runs on the Ferrari 70th pack\'s SF70H or RSS\'s '
    + 'Formula Hybrid 2017, whichever you own.',
  teams: [
    team('mercedes', 'Mercedes AMG Petronas', 'Germany', 'GER', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('red-bull', 'Red Bull Racing', 'Austria', 'AUT', TeamBudget.WORKS),
    team('force-india', 'Sahara Force India', 'India', 'IND', TeamBudget.INDEPENDENT),
    team('williams', 'Williams Martini Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('mclaren', 'McLaren Honda', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('toro-rosso', 'Scuderia Toro Rosso', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('haas', 'Haas F1 Team', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('renault', 'Renault Sport F1 Team', 'France', 'FRA', TeamBudget.WORKS),
    team('sauber', 'Sauber F1 Team', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'Great Britain', 'GBR'),
        seat('ferrari-vettel', 'ferrari', 'Sebastian Vettel', 'Germany', 'GER'),
        seat('mercedes-bottas', 'mercedes', 'Valtteri Bottas', 'Finland', 'FIN'),
        seat('ferrari-raikkonen', 'ferrari', 'Kimi Räikkönen', 'Finland', 'FIN'),
        seat('red-bull-ricciardo', 'red-bull', 'Daniel Ricciardo', 'Australia', 'AUS'),
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'Netherlands', 'NED'),
        seat('force-india-perez', 'force-india', 'Sergio Pérez', 'Mexico', 'MEX'),
        seat('force-india-ocon', 'force-india', 'Esteban Ocon', 'France', 'FRA'),
        seat('toro-rosso-sainz', 'toro-rosso', 'Carlos Sainz', 'Spain', 'ESP'),
        seat('renault-hulkenberg', 'renault', 'Nico Hülkenberg', 'Germany', 'GER'),
        seat('williams-massa', 'williams', 'Felipe Massa', 'Brazil', 'BRA'),
        seat('williams-stroll', 'williams', 'Lance Stroll', 'Canada', 'CAN'),
        seat('haas-grosjean', 'haas', 'Romain Grosjean', 'France', 'FRA'),
        seat('haas-magnussen', 'haas', 'Kevin Magnussen', 'Denmark', 'DEN'),
        seat('mclaren-alonso', 'mclaren', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('mclaren-vandoorne', 'mclaren', 'Stoffel Vandoorne', 'Belgium', 'BEL'),
        seat('renault-palmer', 'renault', 'Jolyon Palmer', 'Great Britain', 'GBR'),
        seat('sauber-wehrlein', 'sauber', 'Pascal Wehrlein', 'Germany', 'GER'),
        seat('toro-rosso-kvyat', 'toro-rosso', 'Daniil Kvyat', 'Russia', 'RUS'),
        seat('sauber-ericsson', 'sauber', 'Marcus Ericsson', 'Sweden', 'SWE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2017, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
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
      sessionLengths: [{ session: 'grand-prix', laps: 51 }],
      climate: Climate.OCEANIC,
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
