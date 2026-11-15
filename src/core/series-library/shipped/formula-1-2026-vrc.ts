import { FORMULA_1_2026_RSS } from './formula-1-2026-rss.ts';
import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2026: three practices, the three-part
 * knockout, and the race.
 */
const EVENT: EventFormat = {
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
 * A sprint event: Friday's sprint qualifying lines up Saturday's
 * sprint, and Saturday's knockout the grand prix.
 */
const SPRINT: EventFormat = {
  id: 'sprint',
  name: 'Sprint',
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
 * seat in it: twenty-two cars, which every layout's boxes hold. RSS's car of
 * the same year races the same calendar as a championship of its own. The
 * calendar is the season's as it ran: the war in the Middle East cancelled the
 * Saudi Arabian Grand Prix and moved the Bahrain Grand Prix to Sepang in
 * October. This was written with three rounds still to run, so changes after
 * mid-November are not in it. All twenty-three rounds at their real
 * distances, the six sprint rounds included; Yas Marina runs the layout
 * before its 2021 rebuild, so its laps cover the real distance.
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
  description: {
    en: 'The 2026 season - new power units, active aerodynamics and Cadillac\'s arrival - with the '
      + 'entry list on VRC\'s Formula Alpha 2026 and its twenty-three grands prix at their real '
      + 'distances.',
    uk: 'Сезон 2026 року - нові силові установки, активна аеродинаміка й дебют Cadillac - зі списком '
      + 'учасників на Formula Alpha 2026 від VRC і двадцятьма трьома гран-прі сезону на їхніх справжніх '
      + 'дистанціях.',
  },
  teams: [
    team('mclaren', 'McLaren Formula 1 Team', 'GBR', TeamBudget.WORKS),
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'DEU', TeamBudget.WORKS),
    team('red-bull', 'Oracle Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari HP', 'ITA', TeamBudget.WORKS),
    team('williams', 'Atlassian Williams Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('racing-bulls', 'Visa Cash App Racing Bulls F1 Team', 'ITA', TeamBudget.INDEPENDENT),
    team('aston-martin', 'Aston Martin Aramco F1 Team', 'GBR', TeamBudget.WORKS),
    team('haas', 'TGR Haas F1 Team', 'USA', TeamBudget.INDEPENDENT),
    team('audi', 'Audi Revolut F1 Team', 'DEU', TeamBudget.WORKS),
    team('alpine', 'BWT Alpine F1 Team', 'FRA', TeamBudget.WORKS),
    team('cadillac', 'Cadillac F1 Team', 'USA', TeamBudget.WORKS),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // By team.
      seats: [
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'GBR'),
        seat('mclaren-piastri', 'mclaren', 'Oscar Piastri', 'AUS'),
        seat('mercedes-russell', 'mercedes', 'George Russell', 'GBR'),
        seat('mercedes-antonelli', 'mercedes', 'Andrea Kimi Antonelli', 'ITA'),
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'NLD'),
        seat('red-bull-hadjar', 'red-bull', 'Isack Hadjar', 'FRA'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'MCO'),
        seat('ferrari-hamilton', 'ferrari', 'Lewis Hamilton', 'GBR'),
        seat('williams-albon', 'williams', 'Alexander Albon', 'THA'),
        seat('williams-sainz', 'williams', 'Carlos Sainz', 'ESP'),
        seat('racing-bulls-lawson', 'racing-bulls', 'Liam Lawson', 'NZL'),
        seat('racing-bulls-lindblad', 'racing-bulls', 'Arvid Lindblad', 'GBR'),
        seat('aston-martin-alonso', 'aston-martin', 'Fernando Alonso', 'ESP'),
        seat('aston-martin-stroll', 'aston-martin', 'Lance Stroll', 'CAN'),
        seat('haas-ocon', 'haas', 'Esteban Ocon', 'FRA'),
        seat('haas-bearman', 'haas', 'Oliver Bearman', 'GBR'),
        seat('audi-hulkenberg', 'audi', 'Nico Hülkenberg', 'DEU'),
        seat('audi-bortoleto', 'audi', 'Gabriel Bortoleto', 'BRA'),
        seat('alpine-gasly', 'alpine', 'Pierre Gasly', 'FRA'),
        seat('alpine-colapinto', 'alpine', 'Franco Colapinto', 'ARG'),
        seat('cadillac-perez', 'cadillac', 'Sergio Pérez', 'MEX'),
        seat('cadillac-bottas', 'cadillac', 'Valtteri Bottas', 'FIN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2026_VRC },
    },
  ],
  eventFormats: [EVENT, SPRINT],
  defaultEventFormat: 'sprint',
  rounds: FORMULA_1_2026_RSS.rounds,
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
    { id: 'sprint', name: 'Sprint points', positions: [8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
