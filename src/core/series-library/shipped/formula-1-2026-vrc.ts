import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2026: three practices, the three-part
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
      inherit: { from: 'q1', top: 16 },
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
      inherit: { from: 'sq1', top: 16 },
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
      inherit: { from: 'q1', top: 16 },
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
 * Formula 1, 2026 - new power units, active aerodynamics, and eleven teams.
 *
 * The entry list as the season started, on VRC's Formula Alpha 2026, every
 * seat in it: twenty-two cars, which the Kunos layouts' boxes hold. The
 * calendar is the one announced for the season, which was under way when this
 * was written, so changes since are not in it. Fourteen of twenty-four rounds
 * at their real distances, four of its six sprint weekends included; Yas
 * Marina runs the layout before its 2021 rebuild, so its laps cover the real
 * distance. Melbourne, Suzuka, Jeddah, Miami, Monaco, Madrid, Baku, Marina
 * Bay, Las Vegas and Losail are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty-two cars cut to sixteen and
 * then to ten. Points are 25-18-15-12-10-8-6-4-2-1, and a sprint pays
 * 8-7-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2026_Formula_One_World_Championship
 */
export const FORMULA_1_2026_VRC: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2026-vrc',
  name: 'Formula 1 2026 (VRC)',
  description: 'The 2026 season - new power units, active aerodynamics and Cadillac\'s arrival - with the '
    + 'entry list on VRC\'s Formula Alpha 2026 and fourteen of its grands prix at their real '
    + 'distances.',
  teams: [
    team('mclaren', 'McLaren Formula 1 Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'Germany', 'GER', TeamBudget.WORKS),
    team('red-bull', 'Oracle Red Bull Racing', 'Austria', 'AUT', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari HP', 'Italy', 'ITA', TeamBudget.WORKS),
    team('williams', 'Atlassian Williams Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('racing-bulls', 'Visa Cash App Racing Bulls F1 Team', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('aston-martin', 'Aston Martin Aramco F1 Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('haas', 'TGR Haas F1 Team', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('audi', 'Audi Revolut F1 Team', 'Germany', 'GER', TeamBudget.WORKS),
    team('alpine', 'BWT Alpine F1 Team', 'France', 'FRA', TeamBudget.WORKS),
    team('cadillac', 'Cadillac F1 Team', 'United States', 'USA', TeamBudget.WORKS),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // By team.
      seats: [
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'Great Britain', 'GBR'),
        seat('mclaren-piastri', 'mclaren', 'Oscar Piastri', 'Australia', 'AUS'),
        seat('mercedes-russell', 'mercedes', 'George Russell', 'Great Britain', 'GBR'),
        seat('mercedes-antonelli', 'mercedes', 'Andrea Kimi Antonelli', 'Italy', 'ITA'),
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'Netherlands', 'NED'),
        seat('red-bull-hadjar', 'red-bull', 'Isack Hadjar', 'France', 'FRA'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'Monaco', 'MON'),
        seat('ferrari-hamilton', 'ferrari', 'Lewis Hamilton', 'Great Britain', 'GBR'),
        seat('williams-albon', 'williams', 'Alexander Albon', 'Thailand', 'THA'),
        seat('williams-sainz', 'williams', 'Carlos Sainz', 'Spain', 'ESP'),
        seat('racing-bulls-lawson', 'racing-bulls', 'Liam Lawson', 'New Zealand', 'NZL'),
        seat('racing-bulls-lindblad', 'racing-bulls', 'Arvid Lindblad', 'Great Britain', 'GBR'),
        seat('aston-martin-alonso', 'aston-martin', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('aston-martin-stroll', 'aston-martin', 'Lance Stroll', 'Canada', 'CAN'),
        seat('haas-ocon', 'haas', 'Esteban Ocon', 'France', 'FRA'),
        seat('haas-bearman', 'haas', 'Oliver Bearman', 'Great Britain', 'GBR'),
        seat('audi-hulkenberg', 'audi', 'Nico Hülkenberg', 'Germany', 'GER'),
        seat('audi-bortoleto', 'audi', 'Gabriel Bortoleto', 'Brazil', 'BRA'),
        seat('alpine-gasly', 'alpine', 'Pierre Gasly', 'France', 'FRA'),
        seat('alpine-colapinto', 'alpine', 'Franco Colapinto', 'Argentina', 'ARG'),
        seat('cadillac-perez', 'cadillac', 'Sergio Pérez', 'Mexico', 'MEX'),
        seat('cadillac-bottas', 'cadillac', 'Valtteri Bottas', 'Finland', 'FIN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2026_VRC, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND, SPRINT],
  defaultWeekendFormat: 'sprint',
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
      weekendFormat: 'grand-prix',
      climate: Climate.ARID,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'barcelona',
      name: 'Barcelona-Catalunya Grand Prix',
      track: { id: 'fn_barcelona', layout: 'barcelona_2023' },
      weekendFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
    },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      weekendFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: { id: 'spa' },
      weekendFormat: 'grand-prix',
      climate: Climate.OCEANIC,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      weekendFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' }, weekendFormat: 'grand-prix' },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'acu_unitedstates' },
      weekendFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico-city',
      name: 'Mexico City Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      weekendFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sao-paulo',
      name: 'São Paulo Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      weekendFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      weekendFormat: 'grand-prix',
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
    { id: 'sprint', name: 'Sprint points', positions: [8, 7, 6, 5, 4, 3, 2, 1] },
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
