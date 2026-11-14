import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2021: three practices, the three-part
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
 * A sprint event as it was introduced: Friday's knockout lines up a
 * Saturday sprint, and the sprint's result is the grand prix grid.
 */
const SPRINT: EventFormat = {
  id: 'sprint',
  name: 'Sprint',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 60, day: 0 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18, day: 0 },
    {
      id: 'q2',
      type: 'qualify',
      name: 'Q2',
      minutes: 15,
      day: 0,
      inherit: { from: 'q1', top: 15 },
    },
    {
      id: 'q3',
      type: 'qualify',
      name: 'Q3',
      minutes: 12,
      day: 0,
      inherit: { from: 'q2', top: 10 },
    },
    { type: 'practice', name: 'Free practice 2', minutes: 60, day: 1 },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint',
      distance: 100,
      day: 1,
      inherit: { from: 'q3' },
      pointsSystem: 'sprint',
    },
    {
      id: 'grand-prix',
      type: 'race',
      name: 'Grand Prix',
      distance: 305,
      day: 2,
      inherit: { from: 'sprint' },
    },
  ],
};

/**
 * Formula 1, 2021 - Max Verstappen's first title, decided on the last lap.
 *
 * The real entry list on RSS's Formula Hybrid 2021, every seat in it. Sixteen
 * of twenty-two rounds at their real distances, the three sprint rounds of
 * the first year included: Friday's knockout set the sprint grid, and the
 * sprint set the grand prix's. Yas Marina runs the layout before its 2021
 * rebuild, so its laps cover the real distance. Monaco, Baku, Paul Ricard,
 * Sochi, Losail and Jeddah are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1 and one for the fastest lap,
 * which the season paid only to a driver in the top ten - a condition a points
 * system cannot state yet - and a sprint pays 3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2021_Formula_One_World_Championship
 */
export const FORMULA_1_2021: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2021',
  name: 'Formula 1 2021',
  description: {
    en: 'Max Verstappen\'s first title, with the real entry list on RSS\'s Formula Hybrid 2021, '
      + 'sixteen of its grands prix at their real distances and the first three sprint rounds.',
    uk: 'Перший титул Макса Ферстаппена: реальний список учасників на Formula Hybrid 2021 від RSS, '
      + 'шістнадцять гран-прі сезону на їхніх справжніх дистанціях і перші три етапи зі спринтом.',
  },
  teams: [
    team('red-bull', 'Red Bull Racing Honda', 'AUT', TeamBudget.WORKS),
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'McLaren F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('alpine', 'Alpine F1 Team', 'FRA', TeamBudget.WORKS),
    team('alphatauri', 'Scuderia AlphaTauri Honda', 'ITA', TeamBudget.INDEPENDENT),
    team('aston-martin', 'Aston Martin Cognizant F1 Team', 'GBR', TeamBudget.WORKS),
    team('williams', 'Williams Racing', 'GBR', TeamBudget.PRIVATEER),
    team('alfa-romeo', 'Alfa Romeo Racing ORLEN', 'CHE', TeamBudget.INDEPENDENT),
    team('haas', 'Haas F1 Team', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'NLD'),
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'GBR'),
        seat('mercedes-bottas', 'mercedes', 'Valtteri Bottas', 'FIN'),
        seat('red-bull-perez', 'red-bull', 'Sergio Pérez', 'MEX'),
        seat('ferrari-sainz', 'ferrari', 'Carlos Sainz', 'ESP'),
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'GBR'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'MCO'),
        seat('mclaren-ricciardo', 'mclaren', 'Daniel Ricciardo', 'AUS'),
        seat('alphatauri-gasly', 'alphatauri', 'Pierre Gasly', 'FRA'),
        seat('alpine-alonso', 'alpine', 'Fernando Alonso', 'ESP'),
        seat('alpine-ocon', 'alpine', 'Esteban Ocon', 'FRA'),
        seat('aston-martin-vettel', 'aston-martin', 'Sebastian Vettel', 'DEU'),
        seat('aston-martin-stroll', 'aston-martin', 'Lance Stroll', 'CAN'),
        seat('alphatauri-tsunoda', 'alphatauri', 'Yuki Tsunoda', 'JPN'),
        seat('williams-russell', 'williams', 'George Russell', 'GBR'),
        seat('alfa-romeo-raikkonen', 'alfa-romeo', 'Kimi Räikkönen', 'FIN'),
        seat('williams-latifi', 'williams', 'Nicholas Latifi', 'CAN'),
        seat('alfa-romeo-giovinazzi', 'alfa-romeo', 'Antonio Giovinazzi', 'ITA'),
        seat('haas-schumacher', 'haas', 'Mick Schumacher', 'DEU'),
        seat('haas-mazepin', 'haas', 'Nikita Mazepin', 'RUS'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2021 },
    },
  ],
  eventFormats: [EVENT, SPRINT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 56 }],
      climate: Climate.ARID,
    },
    { id: 'emilia-romagna', name: 'Emilia Romagna Grand Prix', track: { id: 'imola' } },
    {
      id: 'portugal',
      name: 'Portuguese Grand Prix',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'styria',
      name: 'Styrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
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
      eventFormat: 'sprint',
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
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' }, eventFormat: 'sprint' },
    {
      id: 'turkey',
      name: 'Turkish Grand Prix',
      track: { id: 'rj_istanbul_park', layout: 'layout_f1_2020' },
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'acu_unitedstates' },
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
      eventFormat: 'sprint',
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
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 1 },
    { id: 'sprint', name: 'Sprint points', positions: [3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
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
