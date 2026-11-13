import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2019: three practices, the three-part
 * knockout, and the race.
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
 * Formula 1, 2019 - Lewis Hamilton's sixth title.
 *
 * The real entry list on RSS's Formula Hybrid 2019, every seat in it; Pierre
 * Gasly and Alexander Albon sit where they finished the season, after swapping
 * in August. Thirteen of twenty-one rounds at their real distances; Barcelona
 * runs the layout with its final chicane. Melbourne, Baku, Monaco, Paul
 * Ricard, Hockenheim, Marina Bay, Sochi and Suzuka are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1 and one for the fastest lap,
 * which the season paid only to a driver in the top ten - a condition a points
 * system cannot state yet.
 *
 * Source: https://en.wikipedia.org/wiki/2019_Formula_One_World_Championship
 */
export const FORMULA_1_2019: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2019',
  name: 'Formula 1 2019',
  description: 'Lewis Hamilton\'s sixth title, with the real entry list on RSS\'s Formula Hybrid 2019 and '
    + 'thirteen of its grands prix at their real distances.',
  teams: [
    team('mercedes', 'Mercedes AMG Petronas Motorsport', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('red-bull', 'Aston Martin Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('mclaren', 'McLaren F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('renault', 'Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('toro-rosso', 'Red Bull Toro Rosso Honda', 'ITA', TeamBudget.INDEPENDENT),
    team('racing-point', 'SportPesa Racing Point F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('alfa-romeo', 'Alfa Romeo Racing', 'CHE', TeamBudget.INDEPENDENT),
    team('haas', 'Haas F1 Team', 'USA', TeamBudget.INDEPENDENT),
    team('williams', 'ROKiT Williams Racing', 'GBR', TeamBudget.PRIVATEER),
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
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'MCO'),
        seat('ferrari-vettel', 'ferrari', 'Sebastian Vettel', 'DEU'),
        seat('mclaren-sainz', 'mclaren', 'Carlos Sainz', 'ESP'),
        seat('toro-rosso-gasly', 'toro-rosso', 'Pierre Gasly', 'FRA'),
        seat('red-bull-albon', 'red-bull', 'Alexander Albon', 'THA'),
        seat('renault-ricciardo', 'renault', 'Daniel Ricciardo', 'AUS'),
        seat('racing-point-perez', 'racing-point', 'Sergio Pérez', 'MEX'),
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'GBR'),
        seat('alfa-romeo-raikkonen', 'alfa-romeo', 'Kimi Räikkönen', 'FIN'),
        seat('toro-rosso-kvyat', 'toro-rosso', 'Daniil Kvyat', 'RUS'),
        seat('renault-hulkenberg', 'renault', 'Nico Hülkenberg', 'DEU'),
        seat('racing-point-stroll', 'racing-point', 'Lance Stroll', 'CAN'),
        seat('haas-magnussen', 'haas', 'Kevin Magnussen', 'DNK'),
        seat('alfa-romeo-giovinazzi', 'alfa-romeo', 'Antonio Giovinazzi', 'ITA'),
        seat('haas-grosjean', 'haas', 'Romain Grosjean', 'FRA'),
        seat('williams-kubica', 'williams', 'Robert Kubica', 'POL'),
        seat('williams-russell', 'williams', 'George Russell', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2019 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
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
      climate: Climate.TEMPERATE,
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
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    {
      id: 'mexico',
      name: 'Mexican Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
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
