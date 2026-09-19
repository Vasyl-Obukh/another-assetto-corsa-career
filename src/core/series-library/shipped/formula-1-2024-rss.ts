import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2024: three practices, the three-part
 * knockout, and the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 60, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 60, day: 0 },
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
 * A sprint weekend: Friday's sprint qualifying lines up Saturday's
 * sprint, and Saturday's knockout the grand prix.
 */
const SPRINT: WeekendFormat = {
  id: 'sprint',
  name: 'Sprint weekend',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 60, day: 0 },
    { id: 'sq1', type: 'qualify', name: 'SQ1', minutes: 12, day: 0 },
    {
      id: 'sq2',
      type: 'qualify',
      name: 'SQ2',
      minutes: 10,
      day: 0,
      inherit: { from: 'sq1', top: 15 },
    },
    {
      id: 'sq3',
      type: 'qualify',
      name: 'SQ3',
      minutes: 8,
      day: 0,
      inherit: { from: 'sq2', top: 10 },
    },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint',
      distance: 100,
      day: 1,
      inherit: { from: 'sq3' },
      pointsSystem: 'sprint',
    },
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
 * Formula 1, 2024 - Max Verstappen's fourth title, and McLaren's constructors' crown.
 *
 * The real entry list on RSS's Formula Hybrid 2024, every seat in it. The 2024
 * season is a championship per spec, so VRC's car of the same year races its
 * own. 15 of 24 rounds at their real distances, four of its six sprint
 * weekends included - sprint qualifying on Friday, the sprint and the grand
 * prix knockout on Saturday. Yas Marina runs the layout before its 2021
 * rebuild, so its laps cover the real distance. Jeddah, Melbourne, Suzuka,
 * Miami, Monaco, Baku, Marina Bay, Las Vegas and Losail are not in Assetto
 * Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1 and one for the fastest lap,
 * which the season paid only to a driver in the top ten - a condition a points
 * system cannot state yet, and a sprint pays 8-7-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship
 */
export const FORMULA_1_2024_RSS: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2024-rss',
  name: 'Formula 1 2024 (RSS)',
  description: 'Max Verstappen\'s fourth title, with the real entry list on RSS\'s Formula Hybrid 2024 and '
    + 'fifteen of its grands prix at their real distances.',
  teams: [
    team('red-bull', 'Oracle Red Bull Racing', 'Austria', 'AUT', TeamBudget.WORKS),
    team('mclaren', 'McLaren Formula 1 Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'Germany', 'GER', TeamBudget.WORKS),
    team('aston-martin', 'Aston Martin Aramco F1 Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('alpine', 'BWT Alpine F1 Team', 'France', 'FRA', TeamBudget.WORKS),
    team('haas', 'MoneyGram Haas F1 Team', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('rb', 'Visa Cash App RB F1 Team', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('williams', 'Williams Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('sauber', 'Stake F1 Team Kick Sauber', 'Switzerland', 'SUI', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'Netherlands', 'NED'),
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'Great Britain', 'GBR'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'Monaco', 'MON'),
        seat('mclaren-piastri', 'mclaren', 'Oscar Piastri', 'Australia', 'AUS'),
        seat('ferrari-sainz', 'ferrari', 'Carlos Sainz', 'Spain', 'ESP'),
        seat('mercedes-russell', 'mercedes', 'George Russell', 'Great Britain', 'GBR'),
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'Great Britain', 'GBR'),
        seat('red-bull-perez', 'red-bull', 'Sergio Pérez', 'Mexico', 'MEX'),
        seat('aston-martin-alonso', 'aston-martin', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('alpine-gasly', 'alpine', 'Pierre Gasly', 'France', 'FRA'),
        seat('haas-hulkenberg', 'haas', 'Nico Hülkenberg', 'Germany', 'GER'),
        seat('rb-tsunoda', 'rb', 'Yuki Tsunoda', 'Japan', 'JPN'),
        seat('aston-martin-stroll', 'aston-martin', 'Lance Stroll', 'Canada', 'CAN'),
        seat('alpine-ocon', 'alpine', 'Esteban Ocon', 'France', 'FRA'),
        seat('haas-magnussen', 'haas', 'Kevin Magnussen', 'Denmark', 'DEN'),
        seat('williams-albon', 'williams', 'Alexander Albon', 'Thailand', 'THA'),
        seat('rb-ricciardo', 'rb', 'Daniel Ricciardo', 'Australia', 'AUS'),
        seat('sauber-guanyu', 'sauber', 'Zhou Guanyu', 'China', 'CHN'),
        seat('sauber-bottas', 'sauber', 'Valtteri Bottas', 'Finland', 'FIN'),
        seat('williams-sargeant', 'williams', 'Logan Sargeant', 'United States', 'USA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2024_RSS, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND, SPRINT],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: { id: 'shanghai_v2', layout: 'gp' },
      weekendFormat: 'sprint',
      climate: Climate.TEMPERATE,
    },
    { id: 'emilia-romagna', name: 'Emilia Romagna Grand Prix', track: { id: 'imola' } },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: { id: 'fn_barcelona', layout: 'barcelona_2023' },
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
    },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      weekendFormat: 'sprint',
      sessionLengths: [{ session: 'sprint', laps: 23 }],
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
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'acu_unitedstates' },
      weekendFormat: 'sprint',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico-city',
      name: 'Mexico City Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sao-paulo',
      name: 'São Paulo Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      weekendFormat: 'sprint',
      climate: Climate.TEMPERATE,
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
    { id: 'sprint', name: 'Sprint points', positions: [8, 7, 6, 5, 4, 3, 2, 1] },
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
