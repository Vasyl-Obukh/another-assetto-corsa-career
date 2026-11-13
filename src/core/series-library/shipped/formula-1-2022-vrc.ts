import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2022: three practices, the three-part
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
 * Formula 1, 2022 - the ground-effect cars return, and Max Verstappen's second title.
 *
 * The real entry list on VRC's Formula Alpha 2022, every seat in it. The 2022
 * season is a championship per spec, so RSS's car of the same year races its
 * own. 14 of 22 rounds at their real distances, the three sprint rounds
 * included - Friday's knockout still set the sprint grid, and the sprint the
 * grand prix's; Barcelona runs the layout with its final chicane. Yas Marina
 * runs the layout before its 2021 rebuild, so its laps cover the real
 * distance. Jeddah, Melbourne, Miami, Monaco, Baku, Paul Ricard, Marina Bay
 * and Suzuka are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1 and one for the fastest lap,
 * which the season paid only to a driver in the top ten - a condition a points
 * system cannot state yet, and a sprint pays 8-7-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship
 */
export const FORMULA_1_2022_VRC: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2022-vrc',
  name: 'Formula 1 2022 (VRC)',
  description: {
    en: 'Max Verstappen\'s second title and the first season of the ground-effect cars, with the '
      + 'real entry list on VRC\'s Formula Alpha 2022 and fourteen of its grands prix at their real '
      + 'distances.',
    uk: 'Другий титул Макса Ферстаппена і перший сезон машин із граунд-ефектом: реальний список учасників '
      + 'на Formula Alpha 2022 від VRC і чотирнадцять гран-прі сезону на їхніх справжніх дистанціях.',
  },
  teams: [
    team('red-bull', 'Oracle Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'DEU', TeamBudget.WORKS),
    team('alpine', 'BWT Alpine F1 Team', 'FRA', TeamBudget.WORKS),
    team('mclaren', 'McLaren F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('aston-martin', 'Aston Martin Aramco Cognizant F1 Team', 'GBR', TeamBudget.WORKS),
    team('haas', 'Haas F1 Team', 'USA', TeamBudget.INDEPENDENT),
    team('williams', 'Williams Racing', 'GBR', TeamBudget.PRIVATEER),
    team('alfa-romeo', 'Alfa Romeo F1 Team ORLEN', 'CHE', TeamBudget.INDEPENDENT),
    team('alphatauri', 'Scuderia AlphaTauri', 'ITA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'NLD'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'MCO'),
        seat('red-bull-perez', 'red-bull', 'Sergio Pérez', 'MEX'),
        seat('mercedes-russell', 'mercedes', 'George Russell', 'GBR'),
        seat('ferrari-sainz', 'ferrari', 'Carlos Sainz', 'ESP'),
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'GBR'),
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'GBR'),
        seat('alpine-ocon', 'alpine', 'Esteban Ocon', 'FRA'),
        seat('alpine-alonso', 'alpine', 'Fernando Alonso', 'ESP'),
        seat('alfa-romeo-bottas', 'alfa-romeo', 'Valtteri Bottas', 'FIN'),
        seat('mclaren-ricciardo', 'mclaren', 'Daniel Ricciardo', 'AUS'),
        seat('aston-martin-vettel', 'aston-martin', 'Sebastian Vettel', 'DEU'),
        seat('haas-magnussen', 'haas', 'Kevin Magnussen', 'DNK'),
        seat('alphatauri-gasly', 'alphatauri', 'Pierre Gasly', 'FRA'),
        seat('aston-martin-stroll', 'aston-martin', 'Lance Stroll', 'CAN'),
        seat('haas-schumacher', 'haas', 'Mick Schumacher', 'DEU'),
        seat('alphatauri-tsunoda', 'alphatauri', 'Yuki Tsunoda', 'JPN'),
        seat('alfa-romeo-guanyu', 'alfa-romeo', 'Zhou Guanyu', 'CHN'),
        seat('williams-albon', 'williams', 'Alexander Albon', 'THA'),
        seat('williams-latifi', 'williams', 'Nicholas Latifi', 'CAN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2022_VRC },
    },
  ],
  eventFormats: [EVENT, SPRINT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'emilia-romagna',
      name: 'Emilia Romagna Grand Prix',
      track: { id: 'imola' },
      eventFormat: 'sprint',
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
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      eventFormat: 'sprint',
      climate: Climate.TEMPERATE,
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
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
